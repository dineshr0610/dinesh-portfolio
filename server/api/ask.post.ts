// server/api/ask.post.ts
// server/utils/admin is auto-imported
import { sendAdminEmail } from '../utils/email'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const question = body.question?.trim()
  const userEmail = body.email?.trim() || null
  const intent = body.intent || 'ask'

  if (!question) {
    throw createError({ statusCode: 400, statusMessage: 'Question is required' })
  }

  const supabase = getServerSupabase()

  // --------------------------------------------------
  // ✅ EMAIL SUBMISSION MODE (NO AI CALL)
  // --------------------------------------------------
  if (intent === 'submit_email' && userEmail) {
    await supabase.from('ai_unanswered_questions').insert({
      question,
      user_email: userEmail,
      status: 'pending'
    })

    await sendAdminEmail({
      subject: 'New AI Question Needs Review',
      message: `Question:\n${question}\n\nUser Email:\n${userEmail}`
    })

    return {
      type: 'fallback_saved',
      message:
        "Thanks! Dinesh will personally review your question and get back to you."
    }
  }

  // --------------------------------------------------
  // 🔍 VECTOR SEARCH (documents table)
  // --------------------------------------------------
  const { data: matches, error } = await supabase.rpc(
    'match_documents',
    {
      query_text: question,
      match_count: 6
    }
  )

  if (error) {
    console.error('Vector search failed', error)
    return { type: 'answer', message: 'Search failed.' }
  }

  // --------------------------------------------------
  // ❌ NO CONTEXT FOUND → ASK FOR EMAIL
  // --------------------------------------------------
  if (!matches || matches.length === 0) {
    return {
      type: 'need_email',
      message: `
I don’t have verified information for this yet.

If you’d like a confirmed answer, please share your email.
Dinesh will personally review and respond.
      `.trim()
    }
  }

  // --------------------------------------------------
  // 🧩 CONTEXT CONSTRUCTION (SOURCE-AWARE)
  // --------------------------------------------------
  const grouped: Record<string, string[]> = {}

  for (const row of matches) {
    // Note: Using 'source' and 'text_content' to match the actual DB schema from reindex.post.ts
    // (User snippet had source_type/content, but DB has source/text_content)
    const source = row.source || 'General'
    if (!grouped[source]) grouped[source] = []
    grouped[source].push(row.text_content)
  }

  const orderedSources = Object.keys(grouped).sort((a, b) => {
    if (a === 'ai_knowledge') return -1
    if (b === 'ai_knowledge') return 1
    return a.localeCompare(b)
  })

  const context = orderedSources
    .map(
      (source) =>
        `## ${source}\n${grouped[source].join('\n')}`
    )
    .join('\n\n')
    .slice(0, 6000)

  // --------------------------------------------------
  // 🗣 MAIN AI RESPONSE
  // --------------------------------------------------
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dinesh-portfolio.vercel.app',
        'X-Title': 'Dinesh Portfolio AI'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `
You are Ask Dinesh — a professional AI assistant.

Rules:
- Use ONLY the provided context.
- Never invent facts.
- If the answer is NOT in the context, reply exactly: FALLBACK_TO_EMAIL
- Speak clearly, confidently, and professionally.
            `.trim()
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nContext:\n${context}`
          }
        ]
      })
    }
  )

  const json = await response.json()
  const answer = json.choices?.[0]?.message?.content || ''

  // --------------------------------------------------
  // 📧 FALLBACK TRIGGER LOGIC
  // --------------------------------------------------
  if (answer.includes('FALLBACK_TO_EMAIL')) {
    return {
      type: 'need_email',
      message: `
I don't have verified information about that in my database yet.

If you'd like, please share your email below. Dinesh will personally review your question and respond.
      `.trim()
    }
  }

  return {
    type: 'answer',
    message: answer
  }
})
