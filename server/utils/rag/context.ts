import type { RetrievalMatch } from './retrieval'
import type { DetectedIntent } from './types'

/** Builds an intent-aware, grounded prompt payload without a fixed tiny cap. */
export function buildRagContext(matches: RetrievalMatch[], intent: DetectedIntent): string {
  const grouped = new Map<string, RetrievalMatch[]>()
  for (const match of matches) {
    const entries = grouped.get(match.source) || []
    if (!entries.some(item => item.source_id === match.source_id && item.text_content === match.text_content)) entries.push(match)
    grouped.set(match.source, entries)
  }
  const chronological = intent.intent === 'DATE_RANGE'
  const sections = [...grouped.entries()].map(([source, entries]) => {
    if (chronological) entries.sort((a, b) => String(a.metadata.date || '').localeCompare(String(b.metadata.date || '')))
    return `## ${source.toUpperCase()}\n${entries.map(item => item.text_content).join('\n---\n')}`
  })
  const limit = ['LIST', 'FILTER', 'TECHNOLOGY', 'DATE_RANGE', 'LATEST'].includes(intent.intent) ? 30000 : 14000
  return sections.join('\n\n').slice(0, limit)
}
