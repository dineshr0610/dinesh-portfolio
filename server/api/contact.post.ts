export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    // TODO: validate & send email here
    return { ok: true, message: 'Message received' }
  } catch (err) {
    console.error(err)
    return createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
