// scripts/reindex.js
// Node 18+ recommended. Run with: node scripts/reindex.js
import 'dotenv/config'

import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

/**
 * ENV (required)
 * OPENAI_API_KEY
 * SUPABASE_URL
 * SUPABASE_KEY    (service role or anon with insert perms)
 *
 * Optional:
 * CHUNK_SIZE (default 800 chars)
 */

// ---- config ----
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 800)

// paths to scan (you confirmed these)
const JSON_DIR = path.resolve(process.cwd(), 'public', 'data')
const CONTENT_DIR = path.resolve(process.cwd(), 'content') // markdown or txt you put daily
const RESUME_FILE = path.resolve(process.cwd(), 'resume.md')

// also allow a daily freeform text file: content/daily.txt (create this file daily)
const DAILY_TEXT = path.join(CONTENT_DIR, 'daily.txt')

// ---- checks ----
if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars. Please set OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

/** Helper: aggregate object text */
function aggregateText(item) {
    const keys = ['title', 'short', 'long', 'description', 'body', 'content', 'summary']
    let out = ''
    for (const k of keys) {
        if (item[k]) out += `\n${String(item[k])}`
    }
    for (const k of Object.keys(item)) {
        if (!keys.includes(k) && typeof item[k] === 'string') out += `\n${item[k]}`
    }
    return out.trim()
}

function chunkText(text, size = CHUNK_SIZE) {
    const chunks = []
    let i = 0
    while (i < text.length) {
        const chunk = text.slice(i, i + size)
        chunks.push(chunk)
        i += size
    }
    return chunks
}

async function embedText(text) {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: text,
            // model choice: text-embedding-3-small or another model
            model: 'text-embedding-3-small'
        })
    })
    const js = await res.json().catch(() => null)
    if (!res.ok) throw new Error('OpenAI embedding error: ' + JSON.stringify(js))
    return js.data[0].embedding
}

async function upsertDocument(row) {
    // insert one row
    const { data, error } = await supabase
        .from('documents')
        .insert([row])
        .select()
    if (error) {
        console.error('Supabase insert error', error)
        throw error
    }
    return data
}

async function clearSources(sources) {
    for (const s of sources) {
        console.log('Removing old docs for source:', s)
        const { error } = await supabase.from('documents').delete().eq('source', s)
        if (error) console.warn('warning deleting old source', s, error)
    }
}

async function collectDocs() {
    const results = []

    // 1) JSON files
    try {
        const files = await fs.readdir(JSON_DIR)
        for (const file of files) {
            if (!file.endsWith('.json')) continue
            const full = path.join(JSON_DIR, file)
            try {
                const raw = await fs.readFile(full, 'utf8')
                const j = JSON.parse(raw)
                if (Array.isArray(j)) {
                    for (const item of j) {
                        const text = aggregateText(item)
                        if (!text) continue
                        results.push({
                            source: file,
                            source_id: item.id || item.title || item.name || null,
                            title: item.title || item.name || null,
                            text,
                            metadata: item
                        })
                    }
                } else if (typeof j === 'object' && j !== null) {
                    const items = j.items || j.data || (j.projects && Array.isArray(j.projects) ? j.projects : null)
                    if (Array.isArray(items)) {
                        for (const item of items) {
                            const text = aggregateText(item)
                            if (!text) continue
                            results.push({
                                source: file,
                                source_id: item.id || item.title || item.name || null,
                                title: item.title || item.name || null,
                                text,
                                metadata: item
                            })
                        }
                    } else {
                        const text = aggregateText(j)
                        if (text) results.push({ source: file, source_id: j.id || null, title: j.title || null, text, metadata: j })
                    }
                }
            } catch (e) {
                console.warn('Failed to parse JSON', full, e.message)
            }
        }
    } catch (e) {
        console.warn('No JSON dir found at', JSON_DIR)
    }

    // 2) resume.md
    try {
        const raw = await fs.readFile(RESUME_FILE, 'utf8')
        if (raw && raw.trim().length > 0) {
            results.push({
                source: path.basename(RESUME_FILE),
                source_id: path.basename(RESUME_FILE),
                title: 'Resume',
                text: raw,
                metadata: {}
            })
        }
    } catch (e) {
        console.warn('No resume.md found at', RESUME_FILE)
    }

    // 3) content/ markdown and daily.txt
    try {
        const entries = await fs.readdir(CONTENT_DIR)
        for (const file of entries) {
            const full = path.join(CONTENT_DIR, file)
            if (file.endsWith('.md') || file.endsWith('.txt')) {
                try {
                    const raw = await fs.readFile(full, 'utf8')
                    if (raw && raw.trim().length > 0) {
                        results.push({
                            source: file,
                            source_id: file,
                            title: file,
                            text: raw,
                            metadata: {}
                        })
                    }
                } catch (e) {
                    console.warn('Failed to read', full, e.message)
                }
            }
        }
    } catch (e) {
        console.warn('No content dir found at', CONTENT_DIR)
    }

    return results
}

async function main() {
    console.log('Starting reindex...')

    const docs = await collectDocs()
    console.log('Found', docs.length, 'documents to index')

    const sources = [...new Set(docs.map(d => d.source))]
    await clearSources(sources)

    for (const d of docs) {
        const chunks = chunkText(d.text, CHUNK_SIZE)
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            try {
                const embedding = await embedText(chunk)
                await upsertDocument({
                    source: d.source,
                    source_id: d.source_id ? `${d.source_id}::${i}` : `${d.source}::${i}`,
                    title: d.title,
                    text_content: chunk,
                    metadata: d.metadata || {},
                    embedding
                })
                console.log(`Indexed ${d.source} [${d.source_id}] chunk ${i + 1}/${chunks.length}`)
                // small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 150))
            } catch (err) {
                console.error('Error embedding/uploading chunk', err)
            }
        }
    }

    console.log('Reindex finished.')
    process.exit(0)
}

main().catch(err => {
    console.error('Fatal reindex error', err)
    process.exit(1)
})
