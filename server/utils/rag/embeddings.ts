// server/utils/rag/embeddings.ts
// THE single embedding implementation for the whole project.
// Both the admin reindex and the CLI reindex go through here.
// Model: OpenAI text-embedding-3-small via OpenRouter (1536 dims) — matches
// the query side in ask.post.ts and the vector dimension of documents.embedding.

export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

type RuntimeConfigLike = {
  OPENROUTER_API_KEY?: string
}

function getApiKey(explicitConfig?: RuntimeConfigLike): string {
  let apiKey = explicitConfig?.OPENROUTER_API_KEY
  if (!apiKey) {
    // CLI / script context: no Nitro runtime config — read env directly.
    // dotenv is loaded by scripts/reindex.js before calling this module.
    apiKey = process.env.OPENROUTER_API_KEY
  }
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY (runtime config or env)')
  return apiKey
}

/** Strip newlines — OpenAI embedding input guideline. */
function cleanInput(text: string): string {
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
}

export async function embedText(
  text: string,
  config?: RuntimeConfigLike
): Promise<number[]> {
  const input = cleanInput(text)
  if (!input) throw new Error('embedText: empty input')

  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey(config)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Embedding failed (${response.status}): ${errText.slice(0, 300)}`)
  }

  const json = await response.json()
  const embedding = json.data?.[0]?.embedding
  if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding response had ${Array.isArray(embedding) ? embedding.length : 0} dimensions; expected ${EMBEDDING_DIMENSIONS}`)
  }
  return embedding
}

/** Sequential batch embed with retry — keeps rate limits happy. */
export async function embedBatch(
  texts: string[],
  config?: RuntimeConfigLike,
  onProgress?: (done: number, total: number) => void
): Promise<number[][]> {
  const out: number[][] = []
  for (let i = 0; i < texts.length; i++) {
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        out.push(await embedText(texts[i], config))
        lastError = null
        break
      } catch (e) {
        lastError = e
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
    if (lastError) throw lastError
    onProgress?.(i + 1, texts.length)
  }
  return out
}
