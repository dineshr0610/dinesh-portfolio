import type { DetectedIntent, RagSource } from './types'
import { embedText } from './embeddings'
import { NORMALIZERS, normalizeResumeSections } from './normalizers'

export interface RetrievalMatch {
  source: RagSource
  source_id: string | null
  title: string
  text_content: string
  metadata: Record<string, any>
  score: number
}

const PUBLIC_SOURCES: RagSource[] = ['projects', 'timeline', 'achievements', 'gallery', 'ai_knowledge', 'social_highlights', 'resume']
const TABLE_SOURCES = new Set<RagSource>([...PUBLIC_SOURCES, 'ai_unanswered_questions'])

function rowsToMatches(source: RagSource, rows: any[]): RetrievalMatch[] {
  return rows.map(row => {
    const record = NORMALIZERS[source]?.(row)
    return record && {
      source, source_id: record.source_id, title: record.title, text_content: record.text,
      metadata: record.metadata, score: 1
    }
  }).filter(Boolean) as RetrievalMatch[]
}

async function directRows(supabase: any, source: RagSource, intent: DetectedIntent): Promise<any[]> {
  if (!TABLE_SOURCES.has(source)) return []
  let query = supabase.from(source).select('*')
  if (source === 'ai_unanswered_questions') query = query.eq('status', 'answered')
  else query = query.eq('published', true)
  // Date ranges are applied in JS below because source date columns differ.
  const { data, error } = await query
  if (error) throw new Error(`Direct retrieval failed for ${source}: ${error.message}`)
  let rows = data || []

  if (intent.years.length) rows = rows.filter((r: any) => {
    const value = r.date || r.achieved_at || r.published_at || r.started_at
    return value && intent.years.includes(new Date(value).getUTCFullYear())
  })
  if (intent.tech.length && source === 'projects') rows = rows.filter((r: any) =>
    (Array.isArray(r.tech) ? r.tech : []).some((t: any) => intent.tech.some(tech => String(t).toLowerCase().includes(tech)))
  )
  if (intent.tags.length) rows = rows.filter((r: any) =>
    (Array.isArray(r.tags) ? r.tags : []).some((tag: any) => intent.tags.some(t => String(tag).toLowerCase().includes(t)))
  )
  if (intent.intent === 'LATEST') rows.sort((a: any, b: any) =>
    new Date(b.published_at || b.updated_at || 0).getTime() - new Date(a.published_at || a.updated_at || 0).getTime())
  else if (intent.intent === 'DATE_RANGE' && source === 'timeline') rows.sort((a: any, b: any) =>
    new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
  return rows
}

function merge(matches: RetrievalMatch[]): RetrievalMatch[] {
  const found = new Map<string, RetrievalMatch>()
  for (const match of matches) {
    const key = `${match.source}:${match.source_id}:${match.metadata.chunk_index ?? 0}`
    const old = found.get(key)
    if (!old || match.score > old.score) found.set(key, match)
  }
  return [...found.values()].sort((a, b) => b.score - a.score)
}

/** Hybrid retrieval: deterministic records first, then title/keyword/vector candidates. */
export async function retrievePortfolio(supabase: any, config: { OPENROUTER_API_KEY?: string }, question: string, intent: DetectedIntent): Promise<RetrievalMatch[]> {
  const sources = intent.sources.length ? intent.sources : PUBLIC_SOURCES
  const directIntent = ['LIST', 'COUNT', 'FILTER', 'TECHNOLOGY', 'DATE_RANGE', 'LATEST'].includes(intent.intent)
  if (directIntent) {
    // Preserve source identity; UUIDs can overlap across tables in test data.
    const perSource = await Promise.all(sources.filter(TABLE_SOURCES.has.bind(TABLE_SOURCES)).map(async source => rowsToMatches(source, await directRows(supabase, source, intent))))
    return merge(perSource.flat())
  }

  const candidates: RetrievalMatch[] = []
  // Exact title matching has priority over all fuzzy approaches.
  const keywordSearch = async (query: string, matchCount: number, score: number) => {
    // The deployed search_documents_keyword RPC only accepts (p_query,
    // p_match_count) — no p_sources parameter. Filter in JS instead.
    const { data, error } = await supabase.rpc('search_documents_keyword', { p_query: query, p_match_count: matchCount })
    if (error) {
      // Keyword RPC may be missing (migration not applied) — degrade to vector-only.
      console.error('RAG keyword retrieval unavailable:', error.message)
      return
    }
    const filtered = sources.length ? (data || []).filter((row: any) => sources.includes(row.source)) : (data || [])
    for (const row of filtered) candidates.push({ ...row, score: score === 100 && row.title?.toLowerCase() === query.toLowerCase() ? 100 : score })
  }
  const entity = intent.entity || question.trim()
  if (entity.length >= 3) await keywordSearch(entity, 20, 80)
  for (const keyword of intent.keywords.slice(0, 4)) {
    await keywordSearch(keyword, 12, 30)
  }
  try {
    const embedding = await embedText(question, config)
    // The deployed match_documents RPC signature is
    // (query_embedding, match_count, match_threshold) — it has no p_sources
    // parameter. Passing p_sources (even as an array) makes PostgREST return
    // PGRST202. Filter by source in JS instead.
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding, match_count: 48, match_threshold: 0.2
    })
    if (error) throw new Error(error.message)
    const filtered = sources.length ? (data || []).filter((row: any) => sources.includes(row.source)) : (data || [])
    for (const row of filtered) candidates.push({ ...row, score: Number(row.similarity || 0) * 20 })
  } catch (error) {
    // Keyword/title retrieval remains useful if embeddings are temporarily unavailable.
    console.error('RAG vector retrieval unavailable:', error)
  }
  return merge(candidates).slice(0, 24)
}
