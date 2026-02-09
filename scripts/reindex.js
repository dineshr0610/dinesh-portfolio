// scripts/reindex.js
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { pipeline } from '@xenova/transformers'

// ---------------- CONFIG ----------------
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

// ---------------- EMBEDDING MODEL ----------------
console.log('🔌 Loading embedding model...')
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

async function embedText(text) {
  const output = await embedder(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

// ---------------- HELPERS ----------------
function formatDate(dateStr) {
  if (!dateStr) return 'Unknown Date'
  return new Date(dateStr).toISOString().split('T')[0] // YYYY-MM-DD
}

function formatMonthYear(dateStr) {
  if (!dateStr) return 'Unknown Date'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ---------------- SOURCES ----------------

async function fetchAiKnowledge() {
  const { data } = await supabase
    .from('ai_knowledge')
    .select('*')
    .order('priority', { ascending: false })
    .order('section', { ascending: true })

  return (data || []).map(item => ({
    source: 'ai_knowledge',
    title: `${item.section}: ${item.title || ''}`,
    text: `${item.section}: ${item.title || ''}\n${item.content}`
  }))
}

async function fetchProjects() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('ongoing', { ascending: false })
    .order('ended_at', { ascending: false, nullsFirst: false }) // Postgres specific, but JS sort backup if needed
    .order('started_at', { ascending: false })

  return (data || []).map(p => {
    const end = p.ongoing ? 'Present' : formatDate(p.ended_at)
    const status = p.ongoing ? 'Ongoing' : 'Completed'
    const tech = Array.isArray(p.tech) ? p.tech.join(', ') : p.tech

    return {
      source: 'projects',
      title: `Project: ${p.title}`,
      text: `Project: ${p.title}
Duration: ${formatDate(p.started_at)} to ${end}
Status: ${status}
Technologies: ${tech}
Summary: ${p.short}
Details: ${p.long || ''}`
    }
  })
}

async function fetchTimeline() {
  const { data } = await supabase
    .from('timeline')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .order('order_index', { ascending: true })

  return (data || []).map(t => ({
    source: 'timeline',
    title: `Timeline: ${t.title}`,
    text: `On ${formatDate(t.date)}, Dinesh ${t.title}.\n${t.description}`
  }))
}

async function fetchAchievements() {
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .eq('published', true)
    .order('achieved_at', { ascending: false })

  return (data || []).map(a => ({
    source: 'achievements',
    title: `Achievement: ${a.title}`,
    text: `Achievement (${formatDate(a.achieved_at)}):
${a.title} (${a.type})
${a.short}
${a.long || ''}`
  }))
}

async function fetchUpdates() {
  // Check if table exists or handle error purely
  const { data, error } = await supabase
    .from('dinesh_updates')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.warn('⚠️ Could not fetch dinesh_updates (table might be missing or empty)')
    return []
  }

  return (data || []).map(u => ({
    source: 'dinesh_updates',
    title: `Update: ${u.title}`,
    text: `As of ${formatDate(u.published_at)}, Dinesh is working on ${u.title}.\n${u.body || u.description || ''}`
  }))
}

async function fetchGallery() {
  const { data } = await supabase
    .from('gallery')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (data || []).map(g => {
    const tags = Array.isArray(g.tags) ? g.tags.join(', ') : (g.tags || '')
    return {
      source: 'gallery',
      title: `Gallery: ${g.title}`,
      text: `In ${formatMonthYear(g.published_at)}, Dinesh published a ${g.type} titled "${g.title}".
Description: ${g.description || ''}
Tags: ${tags}`
    }
  })
}

// ---------------- MAIN ----------------
async function main() {
  console.log('🚀 Starting Database -> AI Reindexing...')

  // 1. Gather all docs
  const allDocs = [
    ...(await fetchAiKnowledge()),
    ...(await fetchProjects()),
    ...(await fetchTimeline()),
    ...(await fetchAchievements()),
    ...(await fetchUpdates()),
    ...(await fetchGallery())
  ]

  console.log(`📄 Generated ${allDocs.length} knowledge documents.`)

  // 2. Clear old data (delete everything to be safe and clean)
  // We can delete by source, or just truncate. Supabase-js doesn't have truncate easily without RPC.
  // We'll delete by source since we know the keys.
  const sources = ['ai_knowledge', 'projects', 'timeline', 'achievements', 'dinesh_updates', 'gallery']
  console.log('🧹 Clearing old documents...')
  await supabase.from('documents').delete().in('source', sources)

  // 3. Embed and Insert
  console.log('🧠 Generating embeddings and saving...')

  for (const doc of allDocs) {
    // Simple splitting if text is huge?
    // For now we assume records aren't massive.
    // If strict chunking needed, we can stick to previous logic, but structured records usually fit in context.
    // Let's stick to 1:1 mapping for purity of "Atomic Knowledge", unless > 1000 chars.

    // Safety check for empty text
    if (!doc.text.trim()) continue

    const embedding = await embedText(doc.text)

    const { error } = await supabase.from('documents').insert({
      source: doc.source,
      title: doc.title,
      text_content: doc.text,
      embedding
    })

    if (error) console.error(`❌ Error saving ${doc.title}:`, error.message)
    else process.stdout.write('.')
  }

  console.log('\n🎉 Reindexing Complete!')
}

main().catch(err => {
  console.error('\n❌ Fatal Error:', err)
  process.exit(1)
})
