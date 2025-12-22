// scripts/reindex.js
import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { pipeline } from '@xenova/transformers'

// ---------------- CONFIG ----------------
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const CHUNK_SIZE = 800

const JSON_DIR = path.resolve('public/data')
const CONTENT_DIR = path.resolve('content')
const RESUME_FILE = path.resolve('resume.md')

// ---------------- CHECK ----------------
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

// ---------------- HELPERS ----------------
function chunkText(text, size = CHUNK_SIZE) {
  const chunks = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

function aggregateText(obj) {
  return Object.values(obj)
    .filter(v => typeof v === 'string')
    .join('\n')
}

// ---------------- EMBEDDING MODEL ----------------
const embedder = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
)

// ---------------- EMBED FUNCTION ----------------
async function embedText(text) {
  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true
  })
  return Array.from(output.data)
}

// ---------------- LOAD CONTENT ----------------
async function collectDocs() {
  const docs = []

  // ---------- JSON FILES ----------
  const files = await fs.readdir(JSON_DIR)
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const raw = await fs.readFile(path.join(JSON_DIR, file), 'utf8')
    const data = JSON.parse(raw)

    if (Array.isArray(data)) {
      for (const item of data) {
        const text = aggregateText(item)
        if (!text) continue
        docs.push({
          source: file,
          title: item.title || item.name || null,
          text
        })
      }
    }
  }

  // ---------- RESUME ----------
  try {
    const resume = await fs.readFile(RESUME_FILE, 'utf8')
    if (resume.trim()) {
      docs.push({
        source: 'resume.md',
        title: 'Resume',
        text: resume
      })
    }
  } catch {}

  // ---------- CONTENT (daily.txt, faq.md, etc.) ----------
  try {
    const contentFiles = await fs.readdir(CONTENT_DIR)
    for (const file of contentFiles) {
      if (!file.endsWith('.txt') && !file.endsWith('.md')) continue

      const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf8')
      if (!raw.trim()) continue

      docs.push({
        source: file,
        title: file.replace(/\.(md|txt)$/, ''),
        text: raw
      })
    }
  } catch {}

  return docs
}


// ---------------- MAIN ----------------
async function main() {
  console.log('🚀 Reindex started')

  const docs = await collectDocs()
  console.log(`📄 Found ${docs.length} documents`)

  // Clear old docs
  const sources = [...new Set(docs.map(d => d.source))]
  for (const s of sources) {
    await supabase.from('documents').delete().eq('source', s)
  }

  for (const doc of docs) {
    const chunks = chunkText(doc.text)
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i])

      await supabase.from('documents').insert({
        source: doc.source,
        source_id: `${doc.source}:${i}`,
        title: doc.title,
        text_content: chunks[i],
        embedding
      })

      console.log(`✅ ${doc.source} chunk ${i + 1}/${chunks.length}`)
    }
  }

  console.log('🎉 Reindex completed successfully')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Fatal error', err)
  process.exit(1)
})
