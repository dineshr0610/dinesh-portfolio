// server/api/ask.post.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { question } = await readBody(event)

  if (!question) {
    return { answer: 'No question provided' }
  }

  if (!config.OPENROUTER_API_KEY) {
    return { answer: 'AI service not configured yet.' }
  }

  const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY
  )

  // 1️⃣ Embed user question (matches stored embeddings)
  const { data: matches, error } = await supabase.rpc(
    'match_documents',
    {
      query_text: question,
      match_count: 5
    }
  )

  if (error) {
    console.error(error)
    return { answer: 'Search failed' }
  }

  // CORE FALLBACK DATA (Used if RAG fails or to augment answers)
  const FALLBACK_CONTEXT = `
DINESH R - CORE PROFILE:
- Role: Full Stack Developer & UI/UX Enthusiast
- Location: Chennai, India
- Experience: Specialized in Vue.js, Nuxt 3, TailwindCSS, and Node.js.
- Key Skills: JavaScript/TypeScript, Supabase, AI Integration (OpenAI/DeepSeek), Responsive Design, Performance Optimization.
- Education: B.E. in Computer Science (or relevant field - inferred).
- Soft Skills: Quick learner, detail-oriented, aesthetics-focused.
- Distinctive trait: Builds "premium" feeling web apps with smooth animations.
`

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

  const ragContext = matches && matches.length > 0 ? groupBySource(matches as any[]) : ''
  const finalContext = `
${FALLBACK_CONTEXT}

RETRIEVED DOCUMENTATION (from Database):
${ragContext || "No specific database matches found. Rely on Core Profile."}
`.trim().slice(0, 6000)

  // 2️⃣ Call DeepSeek (OpenRouter)
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://dinesh-portfolio.vercel.app',
      'X-Title': 'Dinesh Portfolio AI'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      temperature: 0.4, // Slightly higher for more natural flow, but still focused
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `
You are Dinesh R’s personal AI Friend 'Chitti'.

OBJECTIVE:
Represent Dinesh as a top-tier Full Stack Developer. Your goal is to impress recruiters and clients by providing accurate, professional, and persuasive answers based on his portfolio data.

CORE INSTRUCTIONS:
1. **BE CONCISE FOR SIMPLE QUESTIONS**: If asked "Who are you?", "Hello", or similar, answer in 1-2 sentences. Example: "I am Chitti, an AI assistant representing Dinesh R, a Full Stack Developer. How can I help?" Do NOT list all skills unless asked.
2. **USE CONTEXT FIRST**: For specific questions, base your answer on the provided "Core Profile" and "Retrieved Documentation".
3. **FILL GAPS INTELLIGENTLY**: If the specific answer isn't in the text, use Dinesh's "Core Profile" (Vue/Nuxt/Full Stack) to infer a reasonable, positive answer.
   - Example: If asked "Can Dinesh do React?", answer: "While Dinesh specializes in Vue and Nuxt, his strong command of JavaScript and component-based architecture makes him adaptable to React environments quickly."
4. **TONE**: Professional, confident, enthusiastic, and concise. Avoid being robotic.
5. **FORMAT**: Use markdown. Use bullet points for lists. Keep paragraphs short.

RESTRICTIONS:
- NEVER invent specific work history (companies/dates) that isn't in the context.
- NEVER say "I don't know" without offering relevant related info. Instead say: "That specific detail isn't in my records, but based on his background..."
- If the user asks something irrelevant (e.g. "Create a react app code"), politely decline and steer back to Dinesh's skills.
`
        },
        {
          role: 'user',
          content: `User Question: ${question}

Context Data:
${finalContext}`
        }
      ]
    })
  })

  const json = await response.json()

  return {
    answer: json.choices?.[0]?.message?.content || 'No response from AI.'
  }
})
