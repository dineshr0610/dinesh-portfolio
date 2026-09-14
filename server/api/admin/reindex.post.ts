import { requireAdmin } from './_guard'
import { indexAll } from '../../utils/rag/indexer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const config = useRuntimeConfig()
  const resumeMarkdown = await readFile(resolve(process.cwd(), 'public/resume.md'), 'utf8')
  const health = await indexAll(getServerSupabase(), config, { resumeMarkdown })
  return { success: health.ok, ...health }
})
