// Thin CLI adapter: all indexing behavior lives in server/utils/rag/indexer.ts.
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { createJiti } from 'jiti'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
if (!url || !key || !process.env.OPENROUTER_API_KEY) throw new Error('SUPABASE_URL, a service-role key, and OPENROUTER_API_KEY are required')
const jiti = createJiti(import.meta.url)
const { indexAll } = await jiti.import('../server/utils/rag/indexer.ts')
const supabase = createClient(url, key, { auth: { persistSession: false } })
const resumeMarkdown = await readFile(resolve(process.cwd(), 'public/resume.md'), 'utf8')
const result = await indexAll(supabase, { OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY }, { resumeMarkdown })
console.log(JSON.stringify(result, null, 2))
if (!result.ok) process.exitCode = 1
