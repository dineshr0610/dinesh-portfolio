// server/api/resume.get.ts
import { promises as fs } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const file = resolve(process.cwd(), 'content', 'resume.md')
    const txt = await fs.readFile(file, 'utf-8')
    return { ok: true, data: txt }
  } catch (err) {
    console.error('server/api/resume.get error', err)
    return createError({ statusCode: 404, statusMessage: 'Resume not found' })
  }
})
