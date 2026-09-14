// server/utils/rag/intent.ts
// Deterministic intent detection + metadata extraction (guardrail #13).
// No LLM call is made for classification.

import type { DetectedIntent, RetrievalIntent, RagSource } from './types'

const ENTITY_SOURCES: RagSource[] = [
  'projects', 'achievements', 'timeline', 'gallery', 'ai_knowledge'
]

const SOURCE_HINTS: [RagSource, RegExp][] = [
  ['projects', /\bprojects?\b|\bapps?\b|\bwebsite\b|\bportfolio\b|\bbuilt\b/i],
  ['achievements', /\bachievements?\b|\bawards?\b|\bcertificat/i],
  ['timeline', /\btimeline\b|\bjourney\b|\bexperience\b|\bhistory\b|\bcareer\b/i],
  ['gallery', /\bgallery\b|\bimages?\b|\bpictures?\b|\bphotos?\b|\bvideos?\b/i],
  ['ai_knowledge', /\bskills?\b|\bknow\b|\bwho is dinesh\b|\babout dinesh\b|\bcontact\b|\bemail\b/i],
  ['resume', /\bresume\b|\bskills?\b|\beducation\b|\bexperience\b|\bcertifications?\b|\bvolunteer(?:ing)?\b/i],
  ['social_highlights', /\bsocial\b|\bposts?\b|\blinkedin\b|\btwitter\b|\binstagram\b|\byoutube\b/i]
  ,['ai_unanswered_questions', /\banswered question\b|\bq&a\b|\bquestion.*answer\b/i]
]

const COUNT_PATTERNS = [
  /\bhow many\b/i,
  /\bcount\b.*\b(projects?|achievements?|timeline|gallery|certificates?|awards?)\b/i,
  /\bnumber of\b/i,
  /^(?:what|which)\b.*\ball\b.*\b(projects?|achievements?)\b.*\bcount\b/i
]

const LIST_PATTERNS = [
  /\b(list|show|give|tell|name|what are|which are)\b.*\b(all|every|each)\b/i,
  /\ball (his |the )?(projects?|achievements?|timeline|certificates?|awards?)\b/i,
  /\b(projects?|achievements?|highlights?)\b.*\blist\b/i
]

const TECH_PATTERNS = /\b(built with|using|uses?|uses\b|uses\b|made with|written in|developed with|involves|technolog(y|ies)|tech stack|stack|framework)\b/i
const YEAR_PATTERN = /\b(19|20)\d{2}\b/g
const LATEST_PATTERNS = /\b(latest|recent|newest|last)\b/i

function normalizeKeyword(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function detectIntent(question: string): DetectedIntent {
  const q = question.trim()
  const lower = q.toLowerCase()
  const normalized = normalizeKeyword(q)

  const years = Array.from(lower.matchAll(YEAR_PATTERN)).map(m => Number(m[0]))
    .filter(y => y >= 2000 && y <= 2100)

  // Extract entity: strip question scaffolding words
  const entityPhrase = lower
    .replace(/^(who|what|which|when|where|tell me about|tell me|explain|describe|do you know about|do you know|how about)\b/i, '')
    .replace(/\b(is|are|was|were|the|a|an|dinesh'?s?|about|of|his)\b/g, ' ')
    .replace(/[?!.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Technology extraction: phrases like "projects using Java", "built with X and Y"
  const tech: string[] = []
  const techMatch = lower.match(/(?:using|use|uses|with|in|made with|built with|written in|developed with|knows)\s+([a-z0-9+#.\s-]+?)(?:\?|$|\.|,| and | projects| achievement)/)
  if (techMatch && techMatch[1]) {
    for (const word of techMatch[1].split(/\band\b|,/)) {
      const kw = normalizeKeyword(word)
      if (kw && kw.length > 1 && !['projects', 'project', 'technologies', 'technology', 'tech', 'stack'].includes(kw)) tech.push(kw)
    }
  }

  // Tag keywords
  const tagWords = lower.match(/\btagged? (?:with )?([a-z0-9\s,-]+)/)
  const tags = tagWords ? [normalizeKeyword(tagWords[1])] : []

  // --- Intent decision (ordered) ---
  let intent: RetrievalIntent = 'SEMANTIC'

  const isCount = COUNT_PATTERNS.some(p => p.test(q))
  const isList = LIST_PATTERNS.some(p => p.test(q))

  if (isCount) intent = 'COUNT'
  else if (isList) intent = 'LIST'
  else if (tags.length > 0) intent = 'FILTER'
  else if (years.length > 0 && /\b(in|during|from|year|what happened)\b/i.test(q)) intent = 'DATE_RANGE'
  else if (tech.length > 0 && TECH_PATTERNS.test(q)) intent = 'TECHNOLOGY'
  else if (LATEST_PATTERNS.test(q) && /\b(achievements?|gallery|social|posts?|what'?s new)\b/i.test(q)) intent = 'LATEST'
  else if (entityPhrase.length >= 3 && !isList) intent = 'EXACT_ENTITY'

  // Sources
  let sources: RagSource[] = []
  for (const [source, re] of SOURCE_HINTS) {
    if (re.test(q)) sources.push(source)
  }
    if (sources.length === 0) sources = ENTITY_SOURCES


  // Keywords for keyword search
  const keywords = normalized
    .split(' ')
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'what', 'which', 'who', 'his', 'her', 'about', 'tell', 'does', 'did', 'have', 'has', 'using', 'built', 'there', 'from', 'that', 'this', 'many', 'list', 'show', 'all', 'are', 'was', 'were', 'dinesh'].includes(w))

  return {
    intent,
    sources: Array.from(new Set(sources)),
    tech: Array.from(new Set(tech)),
    tags,
    years,
    entity: intent === 'EXACT_ENTITY' ? entityPhrase : null,
    keywords
  }
}
