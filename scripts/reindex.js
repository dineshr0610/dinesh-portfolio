// scripts/reindex.js
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// ---------------- CONFIG ----------------
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENROUTER_API_KEY) {
  console.error('❌ Missing Environment Variables')
  console.error(`SUPABASE_URL: ${!!SUPABASE_URL}`)
  console.error(`SUPABASE_KEY: ${!!SUPABASE_KEY}`)
  console.error(`OPENROUTER_API_KEY: ${!!OPENROUTER_API_KEY}`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

// ---------------- EMBEDDING HELPER ----------------
// Using OpenAI's text-embedding-3-small via OpenRouter to match the app's query logic
async function embedText(text) {
  // Simple retry logic
  let retries = 3
  while (retries > 0) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.replace(/\n/g, ' ') // OpenAI recommends removing newlines
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`OpenRouter Error: ${errText}`)
      }

      const json = await response.json()
      return json.data[0].embedding
    } catch (e) {
      console.error(`⚠️ Embedding failed (retries left: ${retries - 1}):`, e.message)
      retries--
      if (retries === 0) throw e
      await new Promise(r => setTimeout(r, 1000)) // wait 1s
    }
  }
}

// ---------------- CHUNKING HELPER ----------------
function chunkText(text, maxLength = 800) {
  if (!text) return []
  if (text.length <= maxLength) return [text]

  const chunks = []
  const sentenceRegex = /[.!?]+\s/g
  let start = 0

  while (start < text.length) {
    let end = start + maxLength

    if (end < text.length) {
      // Look for the last sentence end within the range
      const searchWindow = text.slice(start, end)
      const lastSentence = searchWindow.lastIndexOf('. ')

      if (lastSentence > maxLength * 0.5) { // Only break if we found a sentence end reasonably far
        end = start + lastSentence + 1
      } else {
        // Fallback: search for space
        const lastSpace = searchWindow.lastIndexOf(' ')
        if (lastSpace > maxLength * 0.5) end = start + lastSpace
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end
  }
  return chunks
}

// ---------------- FORMATTERS ----------------
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown Date'
  return new Date(dateStr).toISOString().split('T')[0]
}

function formatMonthYear(dateStr) {
  if (!dateStr) return 'Unknown Date'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ---------------- SOURCES ----------------

async function fetchAiKnowledge() {
  const { data } = await supabase.from('ai_knowledge').select('*').eq('published', true)
  return (data || []).map(item => ({
    id: item.id,
    source: 'ai_knowledge',
    title: `${item.section}: ${item.title || 'General'}`,
    text: `Topic: ${item.section} - ${item.title || 'General'}.
${item.content}
Priority Level: ${item.priority}`,
    metadata: { section: item.section, priority: item.priority }
  }))
}

async function fetchProjects() {
  const { data } = await supabase.from('projects').select('*').eq('published', true)
  return (data || []).map(p => {
    const end = p.ongoing ? 'present' : formatDate(p.ended_at)
    return {
      id: p.id,
      source: 'projects',
      title: p.title,
      text: `Dinesh worked on the project "${p.title}" from ${formatDate(p.started_at)} to ${end}.
Status: ${p.ongoing ? 'Ongoing' : 'Completed'}.
Technologies used: ${Array.isArray(p.tech) ? p.tech.join(', ') : p.tech}.
Summary: ${p.short}.
Details: ${p.long || ''}`,
      metadata: { tech: p.tech, status: p.ongoing ? 'ongoing' : 'completed' }
    }
  })
}

async function fetchTimeline() {
  const { data } = await supabase.from('timeline').select('*').eq('published', true)
  return (data || []).map(t => ({
    id: t.id,
    source: 'timeline',
    title: t.title,
    text: `On ${formatDate(t.date)}, Dinesh ${t.title}.
Details: ${t.description}`,
    metadata: { date: t.date }
  }))
}

async function fetchAchievements() {
  const { data } = await supabase.from('achievements').select('*').eq('published', true)
  return (data || []).map(a => ({
    id: a.id,
    source: 'achievements',
    title: a.title,
    text: `On ${formatDate(a.achieved_at)}, Dinesh achieved: ${a.title}.
Type: ${a.type}.
Summary: ${a.short}.
${a.long || ''}`,
    metadata: { type: a.type, date: a.achieved_at }
  }))
}

async function fetchUpdates() {
  const { data, error } = await supabase.from('dinesh_updates').select('*').eq('published', true)
  if (error) return []
  return (data || []).map(u => ({
    id: u.id,
    source: 'updates', // standardized source name
    title: u.title,
    text: `Update from ${formatDate(u.published_at)}: "${u.title}".
${u.body || u.description || ''}`,
    metadata: { date: u.published_at }
  }))
}

async function fetchGallery() {
  const { data } = await supabase.from('gallery').select('*').eq('published', true)
  return (data || []).map(g => ({
    id: g.id,
    source: 'gallery',
    title: g.title,
    text: `Gallery Image: "${g.title}" (Published ${formatMonthYear(g.published_at)}).
Type: ${g.type}.
Description: ${g.description || ''}.
Tags: ${Array.isArray(g.tags) ? g.tags.join(', ') : g.tags}`,
    metadata: { type: g.type, tags: g.tags }
  }))
}

// ---------------- MAIN ----------------
async function main() {
  console.log('🚀 Starting Smart AI Reindex (OpenRouter + Chunking)...')

  // 1. Gather docs
  const allDocs = [
    ...(await fetchAiKnowledge()),
    ...(await fetchProjects()),
    ...(await fetchTimeline()),
    ...(await fetchAchievements()),
    ...(await fetchUpdates()),
    ...(await fetchGallery())
  ]

  console.log(`📄 Found ${allDocs.length} source records.`)

  // 2. Clear Documents
  console.log('🧹 Clearing old documents...')
  const sources = ['ai_knowledge', 'projects', 'timeline', 'achievements', 'updates', 'gallery', 'dinesh_updates']
  await supabase.from('documents').delete().in('source', sources)

  // 3. Process & Insert
  console.log('🧠 Generating embeddings...')
  let totalChunks = 0

  for (const doc of allDocs) {
    const chunks = chunkText(doc.text, 1000) // Chunk size ~1000 chars (~250 tokens)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk.trim()) continue

      const embedding = await embedText(chunk)

      const { error } = await supabase.from('documents').insert({
        source: doc.source,
        source_id: doc.id || null,
        title: doc.title,
        text_content: chunk,
        metadata: { ...doc.metadata, chunk_index: i },
        embedding
      })

      if (error) console.error('❌ Insert Error:', error.message)
      else process.stdout.write('.')
      totalChunks++
    }
  }

  console.log(`\n\n✅ Reindex Complete! stored ${totalChunks} chunks.`)
}

main().catch(err => {
  console.error('\n❌ Fatal Error:', err)
  process.exit(1)
})
