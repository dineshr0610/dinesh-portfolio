// server/utils/rag/types.ts
// Canonical type + metadata contract for the RAG index.
// Every indexed document — regardless of indexing path — must conform to this.

export const RAG_SCHEMA_VERSION = 1

/** Canonical source names. Do NOT introduce aliases. */
export const RAG_SOURCES = [
  'projects',
  'timeline',
  'achievements',
  'gallery',
  'ai_knowledge',
  'social_highlights',
  'ai_unanswered_questions',
  'resume',
  'static_content',
  'dinesh_updates'
] as const

export type RagSource = (typeof RAG_SOURCES)[number]

/**
 * Legacy/alias source names that may exist in old rows.
 * Used ONLY during full reindex cleanup so they never get re-embedded.
 */
// Removed sources are retained here solely so a full reindex deletes stale docs.
export const LEGACY_SOURCE_NAMES = ['updates', 'q_and_a', 'dinesh_updates']

/**
 * One predictable metadata shape for every document.
 * Fields that do not apply to a source are null / empty — never absent.
 */
export interface RagMetadata {
  schema_version: number
  source: RagSource
  source_id: string | null
  record_type: string
  title: string
  published: boolean
  tech: string[]
  tags: string[]
  date: string | null      // primary date ISO (or YYYY-MM-DD)
  year: number | null
  order_index: number | null
  urls: Record<string, string | null>   // demo, repo, link, image... metadata only
  media: Record<string, unknown> | null
  chunk_index: number
  chunk_count: number
  [key: string]: unknown   // source-specific extras (section, priority, platform, type, status...)
}

/** A normalized, unchunked searchable record produced by normalizers. */
export interface RagRecord {
  source: RagSource
  source_id: string | null
  title: string
  text: string
  metadata: RagMetadata
  /** Records that are not publicly visible (drafts/unpublished) are not indexed. */
  indexable: boolean
}

/** A chunk stored in the documents table. */
export interface RagDocument {
  source: RagSource
  source_id: string | null
  title: string
  text_content: string
  metadata: RagMetadata
  embedding: number[]
}

/** Retrieval intent types (see rag/intent.ts). */
export type RetrievalIntent =
  | 'LIST'
  | 'COUNT'
  | 'EXACT_ENTITY'
  | 'FILTER'
  | 'DATE_RANGE'
  | 'TECHNOLOGY'
  | 'SEMANTIC'
  | 'GENERAL'
  | 'LATEST'

export interface DetectedIntent {
  intent: RetrievalIntent
  /** canonical source names the question is most likely about (may be empty = all) */
  sources: RagSource[]
  /** extracted tech keywords e.g. ["java"] */
  tech: string[]
  /** extracted tag keywords */
  tags: string[]
  /** extracted years e.g. [2025] */
  years: number[]
  /** extracted entity phrase e.g. "vibesync" */
  entity: string | null
  /** normalized keywords for keyword search */
  keywords: string[]
}
