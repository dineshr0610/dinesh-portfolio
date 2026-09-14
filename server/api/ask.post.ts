import { detectIntent } from '../utils/rag/intent'
import { retrievePortfolio } from '../utils/rag/retrieval'
import { buildRagContext } from '../utils/rag/context'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const question = body.question?.trim()
  const email = body.email?.trim() || null
  if (!question) throw createError({ statusCode: 400, statusMessage: 'Question is required' })
  const supabase = getServerSupabase()
  if (body.intent === 'submit_email' && email) {
    const { error } = await supabase.from('ai_unanswered_questions').insert({ question, user_email: email, status: 'pending' })
    if (error) throw createError({ statusCode: 500, statusMessage: 'Could not save your question' })
    return { type: 'fallback_saved', message: 'Thanks! Dinesh will personally review your question and get back to you.', emailPayload: { admin: { title: 'New AI Question Needs Review', name: 'Portfolio AI Assistant', email, message: `Question:\n${question}\n\nUser Email:\n${email}` }, user: { subject: 'Your AI Question Has Been Received', name: 'there', intro: 'Thanks for your question. Dinesh will review it personally:', content: question, footer: 'You will get a response soon.', to_email: email } } }
  }
  const detected = detectIntent(question)
  let matches: any[] = []
  try { matches = await retrievePortfolio(supabase, config, question, detected) } catch (error) { console.error('RAG retrieval failed:', error) }
  const context = buildRagContext(matches, detected)
  const fallback = "I don't have verified information about that in my database yet.\n\nIf you'd like, please share your email below. Dinesh will personally review your question and respond."
  if (!context) return { type: 'need_email', message: fallback }
  // Structured results are authoritative. Semantic-only results need a stronger
  // similarity signal before Chitti treats them as a complete answer.
  const isStructured = ['LIST', 'COUNT', 'FILTER', 'TECHNOLOGY', 'DATE_RANGE', 'LATEST'].includes(detected.intent)
  const confidentlyGrounded = isStructured || matches.some(match => Number(match.score || 0) >= 12)
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${config.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://dinesh-portfolio.vercel.app', 'X-Title': 'Dinesh Portfolio AI' },
    body: JSON.stringify({ model: 'deepseek/deepseek-chat', temperature: 0.2, max_tokens: 700, messages: [
      { role: 'system', content: "You are Chitti, Dinesh's professional portfolio assistant. Answer only from supplied portfolio records. Never invent facts or disclose private fields. If records do not answer, reply exactly FALLBACK_TO_EMAIL. For list/count/filter/date/latest requests report every supplied matching record concisely. Gallery records are metadata only; never claim to understand image pixels. End with [SOURCES_USED: comma-separated canonical sources]." },
      { role: 'user', content: `Question: ${question}\nIntent: ${detected.intent}\n\nPortfolio records:\n${context}` }
    ] })
  })
  const json = await response.json().catch(() => ({}))
  const message = (json.choices?.[0]?.message?.content || '').replace(/\[SOURCES_USED:.*?\]/i, '').trim()
  if (!response.ok || !message || message.includes('FALLBACK_TO_EMAIL')) return { type: 'need_email', message: fallback }
  if (!confidentlyGrounded) {
    return {
      type: 'need_email',
      message: `${message}\n\nI only found limited verified information about this. Leave your email and Dinesh can follow up with a complete answer.`
    }
  }
  return { type: 'answer', message, related: await fetchRelatedItems(matches, supabase) }
})

async function fetchRelatedItems(matches: any[], supabase: any) {
  const related: any[] = []; const seen = new Set<string>()
  for (const match of matches) {
    if (related.length >= 3 || !match.source_id || seen.has(`${match.source}:${match.source_id}`)) continue
    seen.add(`${match.source}:${match.source_id}`); const id = match.source_id
    if (match.source === 'projects') { const { data } = await supabase.from('projects').select('id,title,short,image,tech,demo,repo').eq('id', id).eq('published', true).maybeSingle(); if (data) related.push({ id: data.id, type: 'project', title: data.title, image: data.image || null, short: data.short || null, tech: data.tech || [], demo: data.demo || null, repo: data.repo || null, route: '/projects' }) }
    else if (match.source === 'achievements') { const { data } = await supabase.from('achievements').select('id,title,short,achieved_at,image_url,link_url').eq('id', id).eq('published', true).maybeSingle(); if (data) related.push({ id: data.id, type: 'achievement', title: data.title, image: data.image_url || null, short: data.short || null, date: data.achieved_at || null, linkUrl: data.link_url || null, route: '/achievements' }) }
    else if (match.source === 'timeline') { const { data } = await supabase.from('timeline').select('id,title,subtitle,description,date,image').eq('id', id).eq('published', true).maybeSingle(); if (data) related.push({ id: data.id, type: 'timeline', title: data.title, image: data.image || null, short: data.description || data.subtitle || null, date: data.date || null, route: '/timeline' }) }
    else if (match.source === 'gallery') { const { data } = await supabase.from('gallery').select('id,title,description,type,src,poster,published_at').eq('id', id).eq('published', true).maybeSingle(); if (data?.src) related.push({ id: data.id, type: 'gallery', title: data.title, image: data.type === 'video' ? (data.poster || data.src) : data.src, short: data.description || null, date: data.published_at || null, mediaType: data.type || 'image', mediaSrc: data.src, poster: data.poster || null }) }
  }
  return related
}
