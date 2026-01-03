// server/utils/email.ts

export const sendAdminEmail = async (params: {
  subject: string
  message: string
}) => {
  const config = useRuntimeConfig()

  if (
    !config.EMAILJS_SERVICE_ID ||
    !config.EMAILJS_ADMIN_TEMPLATE_ID ||
    !config.EMAILJS_PUBLIC_KEY
  ) {
    console.error('❌ EmailJS server config missing')
    return
  }

  const templateParams = {
    name: 'Portfolio AI Assistant',
    email: 'ai-system@dinesh-portfolio',
    message: params.message
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: config.EMAILJS_SERVICE_ID,
        template_id: config.EMAILJS_ADMIN_TEMPLATE_ID,
        user_id: config.EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    })

    if (!res.ok) {
      console.error('❌ EmailJS Error:', await res.text())
    }
  } catch (err) {
    console.error('❌ Failed to send admin email:', err)
  }
}

export const sendUserEmail = async (params: {
  to: string
  subject: string
  message: string
}) => {
  const config = useRuntimeConfig()

  if (
    !config.EMAILJS_SERVICE_ID ||
    !config.EMAILJS_ADMIN_TEMPLATE_ID ||
    !config.EMAILJS_PUBLIC_KEY
  ) {
    console.error('❌ EmailJS server config missing')
    return
  }

  const templateParams = {
    name: 'Dinesh R', // Verified Sender Name
    email: params.to,      // Used for Reply-To
    to_email: params.to,   // Actual recipient (mapped effectively in template or ignored if template hardcodes)
    // CRITICAL: We rely on the template logic to use `to_email` if possible, 
    // OR we are relying on 'email' being the Reply-To. 
    // The user said: "to_email: userEmail (actual recipient)".
    title: params.subject,
    message: params.message,
    source: 'admin'        // 🚫 Prevents auto-reply loop
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: config.EMAILJS_SERVICE_ID,
        template_id: config.EMAILJS_ADMIN_TEMPLATE_ID,
        user_id: config.EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    })

    if (!res.ok) {
      console.error('❌ EmailJS (User) Error:', await res.text())
    }
  } catch (err) {
    console.error('❌ Failed to send user email:', err)
  }
}
