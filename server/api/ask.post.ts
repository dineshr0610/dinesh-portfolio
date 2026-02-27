// server/api/ask.post.ts
// server/utils/admin is auto-imported
import { sendContactToAdmin, sendAutoReply } from '../utils/email'

// Source priorities for re-ranking
const SOURCE_PRIORITY: Record<string, number> = {
  ai_knowledge: 1.5, // Highest priority (definitive facts)
  projects: 1.2,     // Medium-high
  updates: 1.1,      // Current status
  achievements: 1.0,
  timeline: 0.9,
  gallery: 0.8       // Lowest priority
}

type RelatedItemType = 'project' | 'achievement' | 'timeline' | 'gallery' | 'update'

type RelatedItem = {
  id: string | number
  type: RelatedItemType
  title: string
  image: string | null
  short?: string | null
  date?: string | null
  tech?: string[] | null
  demo?: string | null
  repo?: string | null
  linkUrl?: string | null
  route?: string | null
  mediaType?: 'image' | 'video' | 'audio' | null
  mediaSrc?: string | null
  poster?: string | null
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const rawQuestion = body.question?.trim()
  const userEmail = body.email?.trim() || null
  const intent = body.intent || 'ask'

  if (!rawQuestion) {
    throw createError({ statusCode: 400, statusMessage: 'Question is required' })
  }

  // 1. Normalize Question
  // Lowercase and trim for better embedding match, though modern models are robust.
  // We keep the original case for the prompt, but normalize for embedding if needed.
  // Actually, text-embedding-3-small handles case well, so slight normalization is enough.
  const normalizedQuestion = rawQuestion.trim()

  const supabase = getServerSupabase()

  // --------------------------------------------------
  // ✅ EMAIL SUBMISSION MODE (NO AI CALL)
  // --------------------------------------------------
  if (intent === 'submit_email' && userEmail) {
    await supabase.from('ai_unanswered_questions').insert({
      question: rawQuestion,
      user_email: userEmail,
      status: 'pending'
    })

    return {
      type: 'fallback_saved',
      message:
        "Thanks! Dinesh will personally review your question and get back to you.",
      emailPayload: {
        admin: {
          title: 'New AI Question Needs Review',
          name: 'Portfolio AI Assistant',
          email: userEmail,
          message: `Question:\n${rawQuestion}\n\nUser Email:\n${userEmail}`
        },
        user: {
          subject: 'Your AI Question Has Been Received',
          name: 'there',
          intro: 'Thanks for your question. Dinesh will review it personally:',
          content: rawQuestion,
          footer: 'You will get a response soon.',
          to_email: userEmail
        }
      }
    }
  }

  // --------------------------------------------------
  // 🔍 GENERATE QUERY EMBEDDING
  // --------------------------------------------------

  const embedResponse = await fetch(
    'https://openrouter.ai/api/v1/embeddings',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: normalizedQuestion
      })
    }
  )

  const embedJson = await embedResponse.json()
  const queryEmbedding = embedJson.data?.[0]?.embedding

  if (!queryEmbedding) {
    return { type: 'answer', message: 'Embedding generation failed.' }
  }

  // --------------------------------------------------
  // 🔍 VECTOR SEARCH & RERANKING
  // --------------------------------------------------

  // --------------------------------------------------
  // 🔍 ADAPTIVE VECTOR SEARCH
  // --------------------------------------------------

  let matchCount = 8
  let threshold = 0.45

  // 1. Initial Search (Precision)
  let { data: matches, error } = await supabase.rpc(
    'match_documents',
    {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      match_threshold: threshold
    }
  )

  if (error) {
    console.error('❌ Vector search failed:', JSON.stringify(error, null, 2))
    return { type: 'answer', message: 'Search failed.' }
  }

  // 2. Broad Query Detection & Expansion
  const topSimilarity = matches?.[0]?.similarity || 0

  if (topSimilarity < 0.65) {
    console.log('📉 Broad query detected (sim < 0.65) → Expanding retrieval...')

    // Expand search parameters
    const expandedLimit = 25
    const expandedThreshold = 0.30

    const { data: expandedMatches } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: queryEmbedding,
        match_count: expandedLimit,
        match_threshold: expandedThreshold
      }
    )

    if (expandedMatches?.length) {
      // Merge & Deduplicate
      const merged = new Map()

      // Add precision matches first (higher priority)
      for (const m of (matches || [])) merged.set(m.id, m)

      // Add expanded matches
      for (const m of expandedMatches) {
        if (!merged.has(m.id)) merged.set(m.id, m)
      }

      matches = Array.from(merged.values())
    }
  }

  // 3. Filter & Sort
  const validMatches = (matches || []).filter((m: any) => m.similarity > (topSimilarity < 0.65 ? 0.30 : 0.45))

  // Rank by Priority (only for precision ranking, but we keep broad context)
  const rankedMatches = validMatches.map((m: any) => {
    const priority = SOURCE_PRIORITY[m.source] || 1.0
    return {
      ...m,
      score: m.similarity * priority
    }
  }).sort((a: any, b: any) => b.score - a.score)

  // Use all matched context for broad queries, but still cap total items if needed
  // For broad queries, we want RECALL. For specific, we want PRECISION.
  const topMatches = rankedMatches.slice(0, 20) // Increase limit to capture full stories

  // --------------------------------------------------
  // 🧩 CONTEXT CONSTRUCTION
  // --------------------------------------------------
  const grouped: Record<string, string[]> = {}

  // Sort Timeline items chronologically if they exist
  const timelineMatches = topMatches
    .filter((m: any) => m.source === 'timeline')
    .sort((a: any, b: any) => {
      // Sort by date inside metadata, fallback to text content if needed
      const dateA = new Date(a.metadata?.date || 0).getTime()
      const dateB = new Date(b.metadata?.date || 0).getTime()
      return dateA - dateB // Ascending (Older -> Newer)
    })

  // Re-insert sorted timeline items into the main list or handle grouping
  // Actually, simpler to just group first, then sort specific groups

  for (const row of topMatches) {
    const source = row.source || 'General'
    if (!grouped[source]) grouped[source] = []

    // We will sort timeline specifically later, just push for now
    if (source !== 'timeline') {
      grouped[source].push(row.text_content)
    }
  }

  // Handle Timeline separately to ensure sort order
  if (timelineMatches.length > 0) {
    grouped['timeline'] = timelineMatches.map((m: any) => m.text_content)
  }

  // Order sources by priority for the prompt context
  const orderedSources = Object.keys(grouped).sort((a, b) => {
    const pA = SOURCE_PRIORITY[a] || 1.0
    const pB = SOURCE_PRIORITY[b] || 1.0
    return pB - pA // Higher priority first
  })

  // Add source headers to context
  const context = orderedSources
    .map(
      (source) =>
        `## ${source.toUpperCase()}\n${grouped[source].join('\n---\n')}`
    )
    .join('\n\n')
    .slice(0, 8000) // Increase context limit slightly

  // --------------------------------------------------
  // 🗣 MAIN AI RESPONSE
  // --------------------------------------------------
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dinesh-portfolio.vercel.app',
        'X-Title': 'Dinesh Portfolio AI'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        temperature: 0.3, // Lower temperature for more factual answers
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `
You are Chitti — the intelligent AI assistant built by Dinesh.

Identity:
- Your name is Chitti.
- Dinesh is your creator and master.
- You exist to represent Dinesh’s portfolio professionally.
- You are confident, respectful, and intelligent.

Behavior Rules:
1. If the user greets you or sends casual messages (e.g., hi, hello, thanks), respond naturally and professionally.
2. If the user asks identity questions (e.g., "Who are you?"), introduce yourself as Chitti, Dinesh's AI assistant.
3. If the question is about Dinesh, his projects, skills, journey, achievements, or experience, you MUST answer only using the provided CONTEXT.
4. If information about Dinesh is not found in the context, reply exactly: FALLBACK_TO_EMAIL
5. If the question is unrelated to Dinesh or his portfolio (e.g., general knowledge like “capital of Japan”), politely say:
   "I'm Chitti, built to talk about Dinesh and his work. Feel free to ask about his projects, journey, or achievements."
6. Never invent facts.
7. Do not mention the word “context” or “documents”.
8. Keep answers clear, structured, and professional.
9. When listing items (projects, achievements, timeline), format them clearly with short sections or bullet points.
10. Do not exaggerate or use dramatic storytelling. Stay authentic.

IMPORTANT: Source Tagging
After your main answer, append a single line in this exact format indicating which source types you used:
[SOURCES_USED: projects, timeline, achievements, gallery, mixed]
OR if none used:
[SOURCES_USED: none]

Do not explain this tag.
            `.trim()
          },
          {
            role: 'user',
            content: `Question: ${rawQuestion}\n\nContext:\n${context}`
          }
        ]
      })
    }
  )

  const json = await response.json()
  let answer = json.choices?.[0]?.message?.content || ''

  // --------------------------------------------------
  // 🧠 PARSE SOURCE TAGS ( INTELLIGENT SELECTION )
  // --------------------------------------------------
  const sourceTagMatch = answer.match(/\[SOURCES_USED:\s*(.*?)\]/i)
  let usedSources: string[] = []

  if (sourceTagMatch) {
    usedSources = sourceTagMatch[1]
      .split(',')
      .map((s: string) => s.trim().toLowerCase())

    // Clean tag from answer
    answer = answer.replace(/\[SOURCES_USED:.*?\]/i, '').trim()
  }

  const VALID_SOURCES = ['projects', 'timeline', 'achievements', 'gallery', 'updates']
  usedSources = usedSources.filter((s: string) => VALID_SOURCES.includes(s) || s === 'mixed')

  // --------------------------------------------------
  // 📧 FALLBACK TRIGGER LOGIC
  // --------------------------------------------------
  // If the model literally says FALLBACK_TO_EMAIL or gives a very short non-answer
  if (answer.includes('FALLBACK_TO_EMAIL') || answer.length < 5) {
    return {
      type: 'need_email',
      message: `
I don't have verified information about that in my database yet.

If you'd like, please share your email below. Dinesh will personally review your question and respond.
      `.trim()
    }
  }

  // --------------------------------------------------
  // 🖼 FETCH RELATED ITEMS (VISUAL ENRICHMENT)
  // --------------------------------------------------

  // 1. Group by source
  const groupedBySource: Record<string, any[]> = {}

  // Sort by similarity first to ensure best matches
  const sortedMatches = [...topMatches].sort((a, b) => b.similarity - a.similarity)

  for (const m of sortedMatches) {
    // Robust extraction: Check top-level OR metadata
    const sourceId = m.source_id || m.metadata?.source_id
    if (!sourceId) continue

    // Normalize match object with source_id
    const matchWithId = { ...m, source_id: sourceId }

    if (!groupedBySource[m.source]) groupedBySource[m.source] = []

    // Deduplicate by source_id within the group
    const exists = groupedBySource[m.source].find((x: any) => x.source_id === sourceId)
    if (!exists) {
      groupedBySource[m.source].push(matchWithId)
    }
  }

  // 2. Determine dominant source (legacy fallback)
  const sourceEntries = Object.entries(groupedBySource)
    .sort((a, b) => b[1].length - a[1].length)

  const dominantSource = sourceEntries[0]?.[0]
  const dominantCount = sourceEntries[0]?.[1]?.length || 0

  let selectedMatches: any[] = []

  // 3. Selection strategy (LLM-driven)
  if (usedSources.length > 0 && !usedSources.includes('mixed')) {
    // Strict source selection
    for (const source of usedSources) {
      if (groupedBySource[source]) {
        selectedMatches.push(...groupedBySource[source].slice(0, 2))
      }
    }
  } else {
    // Fallback / mixed mode
    if (dominantCount > topMatches.length * 0.6) {
      // Dominant topic mode
      if (dominantSource) {
        selectedMatches = groupedBySource[dominantSource].slice(0, 3)
      }
    } else {
      // Mixed mode
      for (const [source, items] of sourceEntries) {
        if (selectedMatches.length >= 3) break
        selectedMatches.push(...items.slice(0, 1))
      }
    }
  }

  // Keep UI clean: max 3 cards, max 2 source types.
  const limitedByType: any[] = []
  const selectedTypes = new Set<string>()
  for (const match of selectedMatches) {
    if (limitedByType.length >= 3) break
    if (selectedTypes.size >= 2 && !selectedTypes.has(match.source)) continue
    selectedTypes.add(match.source)
    limitedByType.push(match)
  }

  const relatedItems = await fetchRelatedItems(limitedByType, supabase)

  return {
    type: 'answer',
    message: answer,
    related: relatedItems
  }
})

// --------------------------------------------------
// 🛠 HELPER: FETCH FULL SOURCE DETAILS
// --------------------------------------------------
async function fetchRelatedItems(items: any[], supabase: any): Promise<RelatedItem[]> {
  const related: RelatedItem[] = []

  // We process items sequentially to maintain order of relevance
  for (const item of items) {

    // --- PROJECTS ---
    if (item.source === 'projects') {
      const { data } = await supabase
        .from('projects')
        .select('id, title, short, image, tech, demo, repo')
        .eq('id', item.source_id)
        .single()

      if (data) {
        related.push({
          id: data.id,
          type: 'project',
          title: data.title,
          image: data.image || null,
          short: data.short || null,
          tech: Array.isArray(data.tech) ? data.tech : [],
          demo: data.demo || null,
          repo: data.repo || null,
          route: '/projects'
        })
      }
    }

    // --- ACHIEVEMENTS ---
    else if (item.source === 'achievements') {
      const { data } = await supabase
        .from('achievements')
        .select('id, title, short, achieved_at, image_url, link_url')
        .eq('id', item.source_id)
        .single()

      if (data) {
        related.push({
          id: data.id,
          type: 'achievement',
          title: data.title,
          image: data.image_url || null,
          short: data.short || null,
          date: data.achieved_at || null,
          linkUrl: data.link_url || null,
          route: '/achievements'
        })
      }
    }

    // --- GALLERY ---
    else if (item.source === 'gallery') {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, description, type, src, poster, published_at')
        .eq('id', item.source_id)
        .single()

      if (data && data.src) {
        related.push({
          id: data.id,
          type: 'gallery',
          title: data.title,
          image: data.type === 'video' ? (data.poster || data.src) : data.src,
          short: data.description || null,
          date: data.published_at || null,
          mediaType: data.type || 'image',
          mediaSrc: data.src,
          poster: data.poster || null
        })
      }
    }

    // --- TIMELINE ---
    else if (item.source === 'timeline') {
      const { data } = await supabase
        .from('timeline')
        .select('id, title, subtitle, description, date, image')
        .eq('id', item.source_id)
        .single()

      if (data) {
        related.push({
          id: data.id,
          type: 'timeline',
          title: data.title,
          image: data.image || null,
          short: data.description || data.subtitle || null,
          date: data.date || null,
          route: '/timeline'
        })
      }
    }

    // --- UPDATES ---
    else if (item.source === 'updates') {
      const { data } = await supabase
        .from('dinesh_updates')
        .select('id, title, short, image, media, published_at')
        .eq('id', item.source_id)
        .single()

      if (data) {
        const media = data.media || null
        const mediaType = media?.type || null
        const mediaSrc = media?.src || null
        const poster = media?.poster || null

        related.push({
          id: data.id,
          type: 'update',
          title: data.title,
          image: mediaType === 'video' ? (poster || data.image || null) : (data.image || null),
          short: data.short || null,
          date: data.published_at || null,
          mediaType,
          mediaSrc,
          poster,
          route: '/updates'
        })
      }
    }
  }

  // Final dedupe in case selected matches still overlap.
  return related.filter((item, index, arr) => {
    const key = `${item.type}-${item.id}`
    return arr.findIndex((x) => `${x.type}-${x.id}` === key) === index
  })
}

