// server/utils/rag/indexer.ts
// THE ONE AUTHORITATIVE INDEXER.
// Every path that converts portfolio sources into RAG documents goes through
// this module: admin CRUD, admin full reindex, CLI reindex, answer workflow,
// resume indexing. No endpoint may insert/delete `documents` rows directly.
//
// Guarantees:
// - Idempotent: indexOne deletes existing (source, source_id) docs before insert.
// - Embedding failures are NEVER silent: no row is inserted without a verified
//   embedding, failures are returned structured and can be retried.
// - Soft-deleted / unpublished content is REMOVED from the public index.
// - Content mutation is never rolled back because of an indexing failure.

import type { RagSource } from './types'
import { RAG_SOURCES, LEGACY_SOURCE_NAMES } from './types'
import { NORMALIZERS, normalizeResumeSections } from './normalizers'
import { chunkText } from './chunk'
import { embedBatch } from './embeddings'

import { SupabaseClient } from '@supabase/supabase-js'
type SupabaseLike = SupabaseClient<any, any>
type EmbedConfig = { OPENROUTER_API_KEY?: string } | undefined

export interface IndexResult {
  ok: boolean
  source: string
  source_id: string | null
  /** what happened to the index for this record */
  action: 'indexed' | 'updated' | 'removed' | 'unchanged' | 'failed' | 'skipped'
  documents_deleted: number
  documents_inserted: number
  error?: string
}

// ---------------------------------------------------------------------------
// Visibility rules (guardrail #7) — each canonical source's "public" condition
// ---------------------------------------------------------------------------
const VISIBILITY_COLUMN: Partial<Record<RagSource, string>> = {
  projects: 'published',
  timeline: 'published',
  achievements: 'published',
  gallery: 'published',
  ai_knowledge: 'published',
  social_highlights: 'published',
  ai_unanswered_questions: 'status',
  resume: 'published',
  static_content: 'published',
  dinesh_updates: 'published'
}

async function fetchSourceRecord(supabase: SupabaseLike, source: RagSource, sourceId: string) {
  if (source === 'resume') return null // handled separately
  
  // Ensure source is a valid table name
  if (!RAG_SOURCES.includes(source)) {
    throw new Error(`Invalid source: ${source}`);
  }
  
  const query = supabase.from(source).select('*').eq('id', sourceId).limit(1)
  const { data, error } = await (source === 'ai_unanswered_questions'
    ? query.eq('status', 'answered')
    : query)
  if (error) throw new Error(`fetch ${source}/${sourceId}: ${error.message}`)
  return data?.[0] ?? null
}

// ---------------------------------------------------------------------------
// deleteOne — remove all documents for a logical record
// ---------------------------------------------------------------------------
export async function deleteOne(
  supabase: SupabaseLike,
  source: string,
  sourceId: string
): Promise<IndexResult> {
  const { data: existing, error: selErr } = await supabase
    .from('documents')
    .select('id')
    .eq('source', source)
    .eq('source_id', sourceId)
  if (selErr) {
    return { ok: false, source, source_id: sourceId, action: 'failed', documents_deleted: 0, documents_inserted: 0, error: selErr.message }
  }
  const existingIds = (existing || []).map((r: any) => r.id)
  if (existingIds.length === 0) {
    return { ok: true, source, source_id: sourceId, action: 'unchanged', documents_deleted: 0, documents_inserted: 0 }
  }
  const { error } = await supabase.from('documents').delete().in('id', existingIds)
  if (error) {
    return { ok: false, source, source_id: sourceId, action: 'failed', documents_deleted: 0, documents_inserted: 0, error: error.message }
  }
  return { ok: true, source, source_id: sourceId, action: 'removed', documents_deleted: existingIds.length, documents_inserted: 0 }
}

// ---------------------------------------------------------------------------
// indexOne — idempotent: call it 10 times, you still get 1 set of documents.
// Sequence: fetch live record -> apply visibility -> delete old docs ->
// normalize -> chunk -> EMBED (verify!) -> insert.
// ---------------------------------------------------------------------------
export async function indexOne(
  supabase: SupabaseLike,
  embedConfig: EmbedConfig,
  source: string,
  sourceId: string,
  opts: { prefetchedRecord?: any } = {}
): Promise<IndexResult> {
  const fail = (error: string): IndexResult =>
    ({ ok: false, source, source_id: sourceId, action: 'failed', documents_deleted: 0, documents_inserted: 0, error })

  try {
    let record = opts.prefetchedRecord
    if (record === undefined) record = await fetchSourceRecord(supabase, source as RagSource, sourceId)

    // Record gone or not publicly visible -> remove from the public index.
    if (!record) {
      return deleteOne(supabase, source, sourceId)
    }
    if (source === 'ai_unanswered_questions' && record.status !== 'answered') {
      return deleteOne(supabase, source, sourceId)
    }
    const visCol = VISIBILITY_COLUMN[source as RagSource]
    if (visCol && record[visCol] !== true) {
      return deleteOne(supabase, source, sourceId)
    }

    // Normalize + chunk
    let ragRecord
    if (source === 'resume') {
      const recs = normalizeResumeSections(record.content || record.markdown || '')
      // For resume sections, we need to match by the section name, not source_id
      const sectionName = sourceId.replace('section-', '')
      ragRecord = recs.find(r => r.metadata.section === sectionName) || recs[0]
      if (!ragRecord) return deleteOne(supabase, source, sourceId)
    } else {
      ragRecord = NORMALIZERS[source as RagSource]?.(record)
    }
    if (!ragRecord || !ragRecord.text) {
      return { ok: true, source, source_id: sourceId, action: 'skipped', documents_deleted: 0, documents_inserted: 0 }
    }

    const chunks = chunkText(ragRecord.text)
    if (chunks.length === 0) {
      return { ok: true, source, source_id: sourceId, action: 'skipped', documents_deleted: 0, documents_inserted: 0 }
    }

    // Idempotency: drop the previous representation BEFORE inserting the new one.
    const prev = await deleteOne(supabase, source, sourceId)
    if (!prev.ok) return { ...prev, action: 'failed' }

    // EMBED — failures here are hard failures (guardrail #3). No row is
    // inserted without a verified embedding vector.
    let embeddings: number[][]
    try {
      embeddings = await embedBatch(chunks, embedConfig)
    } catch (e: any) {
      // Retryable: caller (admin/CLI) gets a structured failure including source ids.
      return {
        ok: false, source, source_id: sourceId, action: 'failed',
        documents_deleted: prev.documents_deleted, documents_inserted: 0,
        error: `embedding failed: ${e?.message || String(e)}`
      }
    }

    const rows = chunks.map((text, i) => ({
      source,
      source_id: sourceId,
      title: ragRecord.title,
      text_content: text,
      metadata: {
        ...ragRecord.metadata,
        chunk_index: i,
        chunk_count: chunks.length
      },
      embedding: embeddings[i]
    }))

    const { error: insertError } = await supabase.from('documents').insert(rows)
    if (insertError) {
      return {
        ok: false, source, source_id: sourceId, action: 'failed',
        documents_deleted: prev.documents_deleted, documents_inserted: 0,
        error: insertError.message
      }
    }

    return {
      ok: true, source, source_id: sourceId,
      action: prev.documents_deleted > 0 ? 'updated' : 'indexed',
      documents_deleted: prev.documents_deleted,
      documents_inserted: rows.length
    }
  } catch (e: any) {
    return fail(e?.message || String(e))
  }
}

// ---------------------------------------------------------------------------
// indexResume — index public/resume.md section-aware
// ---------------------------------------------------------------------------
export async function indexResume(
  supabase: SupabaseLike,
  embedConfig: EmbedConfig,
  markdown: string,
  opts: { replaceAll?: boolean } = {}
): Promise<IndexResult[]> {
  const records = normalizeResumeSections(markdown).filter(r => r.indexable && r.text)
  
  // Ensure all records have a source_id
  const processedRecords = records.map(r => ({
    ...r,
    source_id: r.source_id || `section-${r.metadata.section?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  }))

  if (opts.replaceAll) {
    await supabase.from('documents').delete().eq('source', 'resume')
  }

  const results: IndexResult[] = []
  for (const rec of processedRecords) {
    // Insert section documents directly through the same idempotent path.
    const chunks = chunkText(rec.text)
    if (!chunks.length) continue
    const prev = await deleteOne(supabase, 'resume', rec.source_id!)

    let embeddings: number[][]
    try {
      embeddings = await embedBatch(chunks, embedConfig)
    } catch (e: any) {
      results.push({
        ok: false, source: 'resume', source_id: rec.source_id, action: 'failed',
        documents_deleted: prev.documents_deleted, documents_inserted: 0,
        error: `embedding failed: ${e?.message || String(e)}`
      })
      continue
    }

    const rows = chunks.map((text, i) => ({
      source: 'resume' as const,
      source_id: rec.source_id,
      title: rec.title,
      text_content: text,
      metadata: { ...rec.metadata, chunk_index: i, chunk_count: chunks.length },
      embedding: embeddings[i]
    }))
    const { error } = await supabase.from('documents').insert(rows)
    results.push(error
      ? { ok: false, source: 'resume', source_id: rec.source_id, action: 'failed', documents_deleted: prev.documents_deleted, documents_inserted: 0, error: error.message }
      : { ok: true, source: 'resume', source_id: rec.source_id, action: prev.documents_deleted ? 'updated' : 'indexed', documents_deleted: prev.documents_deleted, documents_inserted: rows.length })
  }
  return results
}

// ---------------------------------------------------------------------------
// indexAll — full reindex with a complete health report (guardrail #28)
// ---------------------------------------------------------------------------
export interface SourceReport {
  source: string
  records_scanned: number
  documents_deleted: number
  documents_inserted: number
  documents_updated: number
  failed: { source_id: string; error: string }[]
}

export interface ReindexHealth {
  ok: boolean
  sources_scanned: string[]
  records_scanned: number
  documents_deleted: number
  documents_inserted: number
  documents_updated: number
  embedding_failures: number
  orphan_documents_deleted: number
  null_embeddings: number
  duplicate_logical_documents: number
  per_source: SourceReport[]
  failures: { source: string; source_id: string; error: string }[]
  log: string[]
}

const INDEXABLE_SOURCES: RagSource[] = [
  'projects', 'timeline', 'achievements', 'gallery',
  'ai_knowledge', 'social_highlights', 'ai_unanswered_questions', 'resume', 'dinesh_updates'
]

export async function indexAll(
  supabase: SupabaseLike,
  embedConfig: EmbedConfig,
  opts: { resumeMarkdown?: string } = {}
): Promise<ReindexHealth> {
  const log: string[] = []
  const push = (m: string) => { log.push(m) }

  const health: ReindexHealth = {
    ok: true,
    sources_scanned: [],
    records_scanned: 0,
    documents_deleted: 0,
    documents_inserted: 0,
    documents_updated: 0,
    embedding_failures: 0,
    orphan_documents_deleted: 0,
    null_embeddings: 0,
    duplicate_logical_documents: 0,
    per_source: [],
    failures: [],
    log
  }

  // 1. Fetch all live public records (visibility applied at query time too)
  const fetchers: Record<string, Promise<any[]>> = {
    projects: supabase.from('projects').select('*').eq('published', true),
    timeline: supabase.from('timeline').select('*').eq('published', true),
    achievements: supabase.from('achievements').select('*').eq('published', true),
    gallery: supabase.from('gallery').select('*').eq('published', true),
    ai_knowledge: supabase.from('ai_knowledge').select('*').eq('published', true),
    social_highlights: supabase.from('social_highlights').select('*').eq('published', true),
    ai_unanswered_questions: supabase.from('ai_unanswered_questions').select('*').eq('status', 'answered')
  }

  const fetched: Record<string, any[]> = {}
  const fetchFailures: Record<string, string> = {}
  for (const [source, p] of Object.entries(fetchers)) {
    const { data, error } = await p
    if (error) {
      push(`⚠ ${source}: fetch failed — ${error.message} (source skipped)`)
      fetched[source] = []
      fetchFailures[source] = error.message
      continue
    }
    fetched[source] = data || []
  }

  // 2. Delete stale documents: anything whose (source, source_id) is no longer
  //    a live public record, plus legacy-named sources.
  const liveKeys = new Set<string>()
  for (const [source, rows] of Object.entries(fetched)) {
    for (const row of rows) liveKeys.add(`${source}:${row.id}`)
  }

  for (const source of [...INDEXABLE_SOURCES, ...LEGACY_SOURCE_NAMES]) {
    // Never interpret a failed source query as "all records were deleted".
    if (fetchFailures[source]) {
      push(`Skipping stale cleanup for ${source} because its source query failed`)
      continue
    }
    const { data: stale, error } = await supabase
      .from('documents')
      .select('id, source, source_id, embedding')
      .eq('source', source)
    if (error) { push(`⚠ stale scan ${source}: ${error.message}`); continue }
    const staleIds = (stale || [])
      .filter((d: any) => d.source_id == null || !liveKeys.has(`${d.source}:${d.source_id}`))
      .map((d: any) => d.id)
    if (staleIds.length) {
      const { error: delErr } = await supabase.from('documents').delete().in('id', staleIds)
      if (!delErr) {
        health.orphan_documents_deleted += staleIds.length
        health.documents_deleted += staleIds.length
        push(`🧹 removed ${staleIds.length} stale/orphan documents from ${source}`)
      } else {
        push(`⚠ stale delete ${source}: ${delErr.message}`)
      }
    }
  }

  // 3. Index each record through indexOne (the single authority)
  for (const source of INDEXABLE_SOURCES) {
    const rows = fetched[source] || []
    const report: SourceReport = {
      source, records_scanned: rows.length, documents_deleted: 0,
      documents_inserted: 0, documents_updated: 0,
      failed: fetchFailures[source] ? [{ source_id: '*', error: `fetch failed: ${fetchFailures[source]}` }] : []
    }
    health.sources_scanned.push(source)
    health.records_scanned += rows.length

    for (const row of rows) {
      // CRITICAL: pass the record that was JUST fetched so CRUD timing races
      // can't serve a half-updated row — indexOne still re-verifies on retry.
      const r = await indexOne(supabase, embedConfig, source, String(row.id), { prefetchedRecord: row })
      report.documents_deleted += r.documents_deleted
      report.documents_inserted += r.documents_inserted
      if (r.action === 'updated') report.documents_updated++
      if (!r.ok || r.action === 'failed') {
        report.failed.push({ source_id: String(row.id), error: r.error || 'unknown' })
      }
    }

    health.documents_deleted += report.documents_deleted
    health.documents_inserted += report.documents_inserted
    health.documents_updated += report.documents_updated
    health.embedding_failures += report.failed.filter(f => f.error.includes('embedding')).length
    health.per_source.push(report)
    push(`${source}: ${rows.length} records → ${report.documents_inserted} documents (${report.failed.length} failures)`)
  }

  // 4. Resume (canonical: public/resume.md)
  if (opts.resumeMarkdown) {
    const resumeResults = await indexResume(supabase, embedConfig, opts.resumeMarkdown, { replaceAll: true })
    const report: SourceReport = {
      source: 'resume',
      records_scanned: resumeResults.length,
      documents_deleted: 0,
      documents_inserted: resumeResults.reduce((a, r) => a + r.documents_inserted, 0),
      documents_updated: resumeResults.filter(r => r.action === 'updated').length,
      failed: resumeResults.filter(r => !r.ok).map(r => ({ source_id: r.source_id || '', error: r.error || 'unknown' }))
    }
    health.sources_scanned.push('resume')
    health.records_scanned += report.records_scanned
    health.documents_inserted += report.documents_inserted
    health.embedding_failures += report.failed.filter(f => f.error.includes('embedding')).length
    health.per_source.push(report)
    push(`resume: ${report.records_scanned} sections → ${report.documents_inserted} documents`)
  }

  // 5. Health audit: NULL embeddings + duplicate logical identity
  const { data: nullRows, count: nullCount } = await supabase
    .from('documents').select('id', { count: 'exact' }).is('embedding', null)
  if (!nullRows) { /* count-only */ }
  health.null_embeddings = nullCount ?? (nullRows?.length ?? 0)

  const { data: allDocs, error: allErr } = await supabase
    .from('documents').select('source, source_id, metadata')
  if (!allErr && allDocs) {
    const counts = new Map<string, number>()
    for (const d of allDocs) {
      const chunk = d.metadata?.chunk_index ?? 0
      counts.set(`${d.source}:${d.source_id}:${chunk}`, (counts.get(`${d.source}:${d.source_id}:${chunk}`) || 0) + 1)
    }
    for (const [, c] of counts) if (c > 1) health.duplicate_logical_documents += c - 1
  }

  health.failures = health.per_source.flatMap(r => r.failed.map(f => ({ source: r.source, source_id: f.source_id, error: f.error })))
  health.ok = health.failures.length === 0 && health.null_embeddings === 0 && health.duplicate_logical_documents === 0
  return health
}
