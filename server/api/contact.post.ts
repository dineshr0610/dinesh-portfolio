// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // In production we'll send email; stub just returns ok
  return { ok: true, received: { name: body?.name, email: body?.email } }
})
