// server/api/ask.post.ts
import { createClient } from '@supabase/supabase-js'
import { sendAdminEmail } from '../utils/email'


const CONFIDENCE_THRESHOLD = 0.75

// --------------------------------------------------
// 🔍 Verifier AI: Checks for explicit facts
// --------------------------------------------------
async function dataExplicitlyAnswers(
  question: string,
  context: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          temperature: 0,
          max_tokens: 50,
          messages: [
            {
              role: 'system',
              content: `
You are a verifier.

Task:
Decide if the provided context EXPLICITLY contains the factual answer to the question.

Rules:
- Answer ONLY "yes" or "no".
- If the context only explains absence or gives general information, answer "no".
- If the context clearly states the fact, answer "yes".
`
            },
            {
              role: 'user',
              content: `Question: ${question}\n\nContext:\n${context.slice(0, 4000)}`
            }
          ]
        })
      }
    )

    const json = await response.json()
    const verdict = json.choices?.[0]?.message?.content?.toLowerCase().trim()
    return verdict.includes('yes')
  } catch (e) {
    console.error('Verifier failed', e)
    return false
  }
}

// --------------------------------------------------
// 🗣 Main AI: Professional Answerer
// --------------------------------------------------
async function generateProfessionalAnswer(
  question: string,
  context: string,
  apiKey: string
) {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
You are “Ask Dinesh”, a professional AI assistant representing Dinesh R.

Your role is to explain Dinesh’s background, work, and capabilities clearly and confidently
to recruiters, founders, and collaborators.

Guidelines:
- Speak naturally and professionally, like a senior engineer or consultant.
- Never mention internal systems, databases, context, or documentation.
- If specific details (such as revenue or financials) are not publicly shared,
  explain that calmly and redirect to what is known.
- Do not invent numbers, revenue, salaries, companies, or financial claims.
- Keep answers honest, composed, and human.
- Do NOT return JSON or structured data.

Tone:
Professional, calm, and trustworthy.
`
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
  return json.choices?.[0]?.message?.content || ''
}



export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const question: string | undefined = body.question?.trim()
  const userEmail: string | null = body.email?.trim() || null
  const intent: string = body.intent || 'ask'

  const hasUserEmail = Boolean(userEmail)

  if (!question) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Question is required'
    })
  }

  if (!config.OPENROUTER_API_KEY) {
    return {
      type: 'answer',
      message: 'AI service not configured yet.'
    }
  }

  const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY,
    { auth: { persistSession: false } }
  )

  // --------------------------------------------------
  // ✅ EMAIL SUBMISSION MODE — DO NOT RUN AI AGAIN
  // --------------------------------------------------
  if (intent === 'submit_email' && userEmail) {
    try {
      await supabase.from('ai_unanswered_questions').insert({
        question,
        user_email: userEmail,
        ai_confidence: 'low',
        status: 'pending'
      })

      await sendAdminEmail({
        subject: 'New AI Question Needs Review',
        message: `
New unanswered AI question:

Question:
${question}

User Email:
${userEmail}
`
      })
    } catch (err) {
      console.error('Email submit failed:', err)
    }

    return {
      type: 'fallback_saved',
      message:
        "Thanks for sharing your email. Dinesh will review your question and get back to you personally."
    }
  }

  // --------------------------------------------------
  // 1️⃣ VECTOR SEARCH
  // --------------------------------------------------
  const { data: matches, error } = await supabase.rpc(
    'match_documents',
    {
      query_text: question,
      match_count: 5
    }
  )

  if (error) {
    console.error('Supabase search error:', error)
    return {
      type: 'answer',
      message: 'Search failed.'
    }
  }

  const bestMatch = matches?.[0]

  // --------------------------------------------------
  // 🧩 Context Construction
  // --------------------------------------------------
  const FALLBACK_CONTEXT = `
DINESH R - CORE PROFILE:
- Role: Full Stack Developer & UI/UX Enthusiast
- Location: Chennai, India
- Experience: Vue.js, Nuxt 3, TailwindCSS, Node.js
- Key Skills: JavaScript/TypeScript, Supabase, AI Integration, Responsive Design
- Strength: Builds premium-feeling, performant web apps
`.trim()

  function prettifySource(source: string) {
    return source
      .replace('.json', '')
      .replace('.md', '')
      .replace(/^\w/, c => c.toUpperCase())
  }

  function groupBySource(rows: any[]) {
    const map: Record<string, string[]> = {}
    for (const r of rows) {
      const source = prettifySource(r.source || 'General')
      if (!map[source]) map[source] = []
      map[source].push(r.text_content)
    }
    return Object.entries(map)
      .map(([source, texts]) => `## ${source}\n${texts.join('\n')}`)
      .join('\n\n')
  }

  const ragContextRaw = matches && matches.length > 0
    ? matches.map((m: any) => m.text_content).join('\n\n')
    : ''

  const ragContextFormatted = matches && matches.length > 0
    ? groupBySource(matches as any[])
    : ''

  const finalContext = `
${FALLBACK_CONTEXT}

RETRIEVED DOCUMENTATION:
${ragContextFormatted || 'No specific database matches found.'}
`
    .trim()
    .slice(0, 6000)

  // --------------------------------------------------
  // ⚡ Parallel Execution: Verify + Answer
  // --------------------------------------------------
  const [explicitlyAnswered, aiAnswer] = await Promise.all([
    dataExplicitlyAnswers(question, ragContextRaw, config.OPENROUTER_API_KEY),
    generateProfessionalAnswer(question, finalContext, config.OPENROUTER_API_KEY)
  ])

  // --------------------------------------------------
  // ✅ Decision Logic
  // --------------------------------------------------

  // 1️⃣ Explicitly Answered → Direct Return
  if (explicitlyAnswered) {
    return {
      type: 'answer',
      message: aiAnswer
    }
  }

  // 2️⃣ Not explicitly answered → Request Email
  if (!userEmail) {
    return {
      type: 'need_email',
      message: `
${aiAnswer}

---

If you’d like a confirmed and verified answer, please share your email.
Dinesh will personally review and get back to you.
`.trim()
    }
  }

  // --------------------------------------------------
  // 🔹 Save + notify admin (fail-safe)
  // --------------------------------------------------
  try {
    await supabase.from('ai_unanswered_questions').insert({
      question,
      user_email: userEmail,
      ai_confidence: 'low',
      status: 'pending'
    })

    await sendAdminEmail({
      subject: 'New AI Question Needs Review',
      message: `
New unanswered AI question:

Question:
${question}

User Email:
${userEmail}
`
    })
  } catch (err) {
    console.error('AI fallback save/email failed:', err)
  }

  // --------------------------------------------------
  // 🔹 Final response to user
  // --------------------------------------------------
  return {
    type: 'fallback_saved',
    message:
      "Thanks for sharing your email. Dinesh will review your question and get back to you personally."
  }
})
