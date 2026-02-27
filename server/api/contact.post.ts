import { sendAutoReply, sendContactToAdmin } from '../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const message = (body.message || '').trim()
  const title = (body.title || 'Contact Form Message').trim()

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, and message are required' })
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }

  await sendContactToAdmin({
    title,
    name,
    email,
    message
  })

  await sendAutoReply({
    to: email,
    subject: 'Thank you for contacting me!',
    name,
    intro: 'I have received your message:',
    content: message,
    footer: 'I will respond within 24–48 hours.'
  })

  return { success: true }
})
