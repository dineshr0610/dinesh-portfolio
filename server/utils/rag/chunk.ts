// server/utils/rag/chunk.ts
// Sentence-aware chunking shared by every indexing path.

export function chunkText(text: string, maxLength = 1000): string[] {
  const clean = (text || '').trim()
  if (!clean) return []
  if (clean.length <= maxLength) return [clean]

  const chunks: string[] = []
  let start = 0

  while (start < clean.length) {
    let end = Math.min(start + maxLength, clean.length)
    if (end < clean.length) {
      const window = clean.slice(start, end)
      const sentenceBreak = window.lastIndexOf('. ')
      if (sentenceBreak > maxLength * 0.5) {
        end = start + sentenceBreak + 1
      } else {
        const space = window.lastIndexOf(' ')
        if (space > maxLength * 0.5) end = start + space
      }
    }
    const piece = clean.slice(start, end).trim()
    if (piece) chunks.push(piece)
    start = end
  }
  return chunks
}
