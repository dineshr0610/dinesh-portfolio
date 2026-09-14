// server/utils/rag/normalizers.ts
// Pure normalizers: DB record -> RagRecord (searchable text + metadata).
// Schema fields below are taken from the actual codebase usage (verified):
//   projects:            id,title,short,long,tech[],demo,repo,image,started_at,ended_at,ongoing,published
//   timeline:            id,title,subtitle,description,date,image,published
//   achievements:        id,title,short,long,type,achieved_at,image_url,link_url,tags[],media,published
//   gallery:             id,title,description,type,src,poster,tags[],order_index,published,published_at
//   ai_knowledge:        id,section,title,content,priority,published
//   ai_unanswered_questions: id,question,admin_answer,status (answered/pending/deleted/reopened)
//   social_highlights:   id,platform,title,embed_html,published
// NO user_email / admin workflow fields ever reach the searchable text.

import type { RagRecord, RagMetadata, RagSource } from './types'
import { RAG_SCHEMA_VERSION } from './types'

function cleanText(text: unknown): string {
  if (!text) return ''
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isoDate(value: unknown): string | null {
  if (!value) return null
  const d = new Date(String(value))
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function yearOf(value: unknown): number | null {
  const iso = isoDate(value)
  return iso ? Number(iso.slice(0, 4)) : null
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => cleanText(v)).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

/** Extract human-visible social copy without embedding markup, scripts, or CSS. */
function htmlText(value: unknown): string {
  return cleanText(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' '))
}

function baseMeta(
  source: RagSource,
  source_id: string | null,
  record_type: string,
  title: string,
  published: boolean,
  extras: Partial<RagMetadata> = {}
): RagMetadata {
  return {
    schema_version: RAG_SCHEMA_VERSION,
    source,
    source_id,
    record_type,
    title,
    published,
    tech: [],
    tags: [],
    date: null,
    year: null,
    order_index: null,
    urls: {},
    media: null,
    chunk_index: 0,
    chunk_count: 1,
    ...extras
  }
}

function makeRecord(
  source: RagSource,
  source_id: string | null,
  title: string,
  text: string,
  metadata: RagMetadata
): RagRecord {
  return { source, source_id, title, text: text.trim(), metadata, indexable: true }
}

// ---------------------------------------------------------------------------
// projects
// ---------------------------------------------------------------------------
export function normalizeProject(p: any): RagRecord {
  const tech = toArray(p.tech)
  const end = p.ongoing ? 'present' : isoDate(p.ended_at) || 'unknown'
  const text = [
    `PROJECT: ${p.title}`,
    `STATUS: ${p.ongoing ? 'Ongoing' : `Completed (${end})`}`,
    `PERIOD: ${isoDate(p.started_at) || 'unknown'} to ${end}`,
    tech.length ? `TECHNOLOGIES: ${tech.join(', ')}` : '',
    p.short ? `SUMMARY: ${cleanText(p.short)}` : '',
    p.long ? `DETAILS: ${cleanText(p.long)}` : ''
  ].filter(Boolean).join('\n')

  return makeRecord('projects', String(p.id), p.title || 'Untitled project', text, baseMeta(
    'projects', String(p.id), 'project', p.title || 'Untitled project', p.published === true,
    {
      tech,
      date: isoDate(p.started_at),
      year: yearOf(p.started_at),
      urls: { demo: p.demo || null, repo: p.repo || null, image: p.image || null },
      status: p.ongoing ? 'ongoing' : 'completed',
      started_at: isoDate(p.started_at), ended_at: isoDate(p.ended_at)
    }
  ))
}

// ---------------------------------------------------------------------------
// timeline
// ---------------------------------------------------------------------------
export function normalizeTimeline(t: any): RagRecord {
  const date = isoDate(t.date)
  const year = yearOf(t.date)
  const text = [
    `TIMELINE EVENT${date ? ` (${date})` : ''}: ${t.title}`,
    t.subtitle ? `SUBTITLE: ${cleanText(t.subtitle)}` : '',
    t.description ? `DESCRIPTION: ${cleanText(t.description)}` : ''
  ].filter(Boolean).join('\n')

  return makeRecord('timeline', String(t.id), t.title || 'Timeline event', text, baseMeta(
    'timeline', String(t.id), 'event', t.title || 'Timeline event', t.published === true,
    { date, year, tags: toArray(t.tags), order_index: typeof t.order_index === 'number' ? t.order_index : null,
      urls: { image: t.image || null }, media: t.media || null }
  ))
}

// ---------------------------------------------------------------------------
// achievements
// ---------------------------------------------------------------------------
export function normalizeAchievement(a: any): RagRecord {
  const date = isoDate(a.achieved_at)
  const year = a.year ? Number(a.year) : yearOf(a.achieved_at)
  const tags = toArray(a.tags)
  const text = [
    `ACHIEVEMENT${a.type ? ` (${a.type})` : ''}${date ? ` — ${date}` : ''}: ${a.title}`,
    a.short ? `SUMMARY: ${cleanText(a.short)}` : '',
    a.long ? `DETAILS: ${cleanText(a.long)}` : '',
    tags.length ? `TAGS: ${tags.join(', ')}` : ''
  ].filter(Boolean).join('\n')

  return makeRecord('achievements', String(a.id), a.title || 'Achievement', text, baseMeta(
    'achievements', String(a.id), 'achievement', a.title || 'Achievement', a.published === true,
    {
      tags, date, year,
      urls: { link: a.link_url || null, image: a.image_url || null },
      media: a.media || null, type: a.type || null
    }
  ))
}

// ---------------------------------------------------------------------------
// gallery (image metadata retrieval — text describes the item, NOT pixels)
// ---------------------------------------------------------------------------
export function normalizeGallery(g: any): RagRecord {
  const tags = toArray(g.tags)
  const date = isoDate(g.published_at)
  const text = [
    `GALLERY ITEM (${g.type || 'image'}): ${g.title || 'Untitled'}`,
    g.description ? `DESCRIPTION: ${cleanText(g.description)}` : '',
    tags.length ? `TAGS: ${tags.join(', ')}` : '',
    date ? `PUBLISHED: ${date}` : ''
  ].filter(Boolean).join('\n')

  return makeRecord('gallery', String(g.id), g.title || 'Gallery item', text, baseMeta(
    'gallery', String(g.id), 'gallery_item', g.title || 'Gallery item', g.published === true,
    {
      tags, date, year: yearOf(g.published_at),
      order_index: typeof g.order_index === 'number' ? g.order_index : null,
      urls: { image: g.type === 'video' ? (g.poster || g.src) : g.src || null },
      media: { type: g.type || 'image', src: g.src || null, poster: g.poster || null },
      type: g.type || 'image', src: g.src || null, poster: g.poster || null
    }
  ))
}

// ---------------------------------------------------------------------------
// dinesh_updates — verified real fields
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ai_knowledge
// ---------------------------------------------------------------------------
export function normalizeKnowledge(k: any): RagRecord {
  const titlePart = k.title ? ` — ${k.title}` : ''
  const text = [
    `KNOWLEDGE (${String(k.section || 'general').toUpperCase()}${titlePart}):`,
    cleanText(k.content),
    typeof k.priority === 'number' && k.priority > 0 ? `PRIORITY: ${k.priority}` : ''
  ].filter(Boolean).join('\n')

  const title = `${k.section || 'Knowledge'}${titlePart}`
  return makeRecord('ai_knowledge', String(k.id), title, text, baseMeta(
    'ai_knowledge', String(k.id), 'knowledge', title, k.published === true,
    { section: k.section || 'general', priority: typeof k.priority === 'number' ? k.priority : null }
  ))
}

// ---------------------------------------------------------------------------
// ai_unanswered_questions — ONLY answered Q&A is indexable, and NEVER any
// private workflow fields (user_email, status pipeline, etc.)
// ---------------------------------------------------------------------------
export function normalizeAnsweredQuestion(q: any): RagRecord {
  const text = [
    `Question:\n${cleanText(q.question)}`,
    `Verified answer:\n${cleanText(q.admin_answer || q.answer || '')}`
  ].join('\n\n')

  return makeRecord('ai_unanswered_questions', String(q.id), cleanText(q.question) || 'Answered question', text, baseMeta(
    'ai_unanswered_questions', String(q.id), 'answered_question', cleanText(q.question) || 'Answered question', true,
    { verified: true }
  ))
}

// ---------------------------------------------------------------------------
// social_highlights — embed_html is markup; store src URL as metadata only
// ---------------------------------------------------------------------------
export function normalizeSocialHighlight(s: any): RagRecord {
  let embedSrc: string | null = null
  if (s.embed_html) {
    const m = String(s.embed_html).match(/src=["']([^"']+)["']/i)
    embedSrc = m ? m[1] : null
  }
  const visibleEmbedText = htmlText(s.embed_html)
  const text = [
    `SOCIAL HIGHLIGHT (${s.platform || 'social'}): ${s.title || 'Highlight'}`,
    visibleEmbedText ? `POST CONTENT: ${visibleEmbedText}` : '',
    embedSrc ? `LINK: ${embedSrc}` : ''
  ].filter(Boolean).join('\n')

  return makeRecord('social_highlights', String(s.id), s.title || `${s.platform} highlight`, text, baseMeta(
    'social_highlights', String(s.id), 'social_highlight', s.title || `${s.platform || 'Social'} highlight`, s.published === true,
    { platform: s.platform || null, urls: { link: embedSrc }, embed_html: s.embed_html || null }
  ))
}

// ---------------------------------------------------------------------------
// resume.md — section-aware (canonical public resume; PDF is NOT re-indexed
// unless it contains materially different info, which it does not)
// ---------------------------------------------------------------------------
export function normalizeResumeSections(md: string): RagRecord[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const sections: { name: string; body: string[] }[] = []
  let current: { name: string; body: string[] } | null = null

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    const h1 = line.match(/^#\s+(.+)/)
    if (h2) {
      current = { name: h2[1].trim(), body: [] }
      sections.push(current)
    } else if (h1) {
      current = { name: 'profile', body: [line.replace(/^#\s+/, '').trim()] }
      sections.push(current)
    } else if (current) {
      current.body.push(line)
    }
  }

  return sections
    .filter(s => s.body.some(l => l.trim()))
    .map(s => {
      const body = s.body.join('\n').trim()
      const title = s.name === 'profile' ? 'Profile / Summary' : s.name
      const record = makeRecord(
        'resume', `section-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, title, body,
        baseMeta('resume', `section-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 'resume_section', title, true,
          { section: s.name })
      )
      // Ensure all resume sections are indexable
      record.indexable = true
      return record
    })
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
export const NORMALIZERS: Record<RagSource, (row: any) => RagRecord> = {
  projects: normalizeProject,
  timeline: normalizeTimeline,
  achievements: normalizeAchievement,
  gallery: normalizeGallery,
  ai_knowledge: normalizeKnowledge,
  ai_unanswered_questions: normalizeAnsweredQuestion,
  social_highlights: normalizeSocialHighlight,
  dinesh_updates: () => { throw new Error('dinesh_updates is intentionally not auto-indexed') },
  resume: () => { throw new Error('resume is indexed via normalizeResumeSections') },
  static_content: () => { throw new Error('static_content is intentionally not auto-indexed') }
}

