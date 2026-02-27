// server/utils/email.ts
import emailjs from '@emailjs/nodejs'

type EmailVariables = Record<string, any>

export async function sendEmail({
  templateId,
  to,
  variables
}: {
  templateId: string
  to: string
  variables: EmailVariables
}) {
  const config = useRuntimeConfig()

  if (
    !config.EMAILJS_SERVICE_ID ||
    !config.EMAILJS_PUBLIC_KEY ||
    !config.EMAILJS_PRIVATE_KEY
  ) {
    throw new Error('EmailJS config missing')
  }

  return await emailjs.send(
    config.EMAILJS_SERVICE_ID,
    templateId,
    {
      ...variables,
      email: to
    },
    {
      publicKey: config.EMAILJS_PUBLIC_KEY,
      privateKey: config.EMAILJS_PRIVATE_KEY
    }
  )
}

export const sendContactToAdmin = async (params: {
  title: string
  name: string
  email: string
  message: string
}) => {
  const config = useRuntimeConfig()

  return sendEmail({
    templateId: config.EMAILJS_TEMPLATE_CONTACT,
    to: config.CONTACT_RECEIVER_EMAIL,
    variables: {
      title: params.title,
      name: params.name,
      email: params.email,
      message: params.message
    }
  })
}

export const sendAutoReply = async (params: {
  to: string
  subject: string
  name: string
  intro: string
  content: string
  footer: string
}) => {
  const config = useRuntimeConfig()

  return sendEmail({
    templateId: config.EMAILJS_TEMPLATE_AUTOREPLY,
    to: params.to,
    variables: {
      subject: params.subject,
      name: params.name,
      intro: params.intro,
      content: params.content,
      footer: params.footer,
      to_email: params.to
    }
  })
}

