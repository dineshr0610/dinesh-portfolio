<script setup lang="ts">
import { ref, onMounted } from 'vue'
import emailjs from '@emailjs/browser'

// EmailJS public config (safe on client)
const config = useRuntimeConfig()
// Access keys via config.public.emailjsPublic, etc.

onMounted(() => {
  try { emailjs.init(config.public.emailjsPublic) } catch (e) { console.warn('EmailJS init:', e) }
})

const name = ref('')
const email = ref('')
const message = ref('')
const company = ref('') // honeypot

const loading = ref(false)
const toast = ref<{ type: 'success'|'error'|'info', text: string } | null>(null)

function validate() {
  if (company.value.trim() !== '') return { ok: false, msg: 'spam' }
  if (!name.value.trim()) return { ok: false, msg: 'Please enter your name.' }
  const e = email.value.trim(); if (!e) return { ok: false, msg: 'Please enter your email.' }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(e)) return { ok: false, msg: 'Please enter a valid email.' }
  if (!message.value.trim()) return { ok: false, msg: 'Please write a message.' }
  if (message.value.trim().length < 10) return { ok: false, msg: 'Message too short.' }
  return { ok: true }
}

async function sendWithRetry(sendFn: () => Promise<any>, attempts = 2, delays = [200, 500]) {
  for (let i = 0; i <= attempts; i++) {
    try {
      const res = await sendFn()
      return { ok: true, res }
    } catch (err) {
      console.warn(`sendWithRetry attempt ${i + 1} failed`, err)
      if (i < attempts) {
        const delay = delays[i] ?? 300
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      return { ok: false, err }
    }
  }
  return { ok: false, err: new Error('Unknown sendWithRetry failure') }
}

async function handleSubmit() {
  const v = validate()
  if (!v.ok) {
    if (v.msg === 'spam') return
    toast.value = { type: 'error', text: v.msg as string }
    setTimeout(() => (toast.value = null), 4000)
    return
  }

  loading.value = true
  toast.value = null

  const paramsForAdmin = {
    name: name.value.trim(),
    email: email.value.trim(),
    message: message.value.trim()
  }

  // 1) Send admin email (critical)
  try {
    await emailjs.send(config.public.emailjsService, config.public.emailjsAdminTemplate, paramsForAdmin)
  } catch (err: any) {
    console.error('Admin email failed:', err)
    loading.value = false
    toast.value = { type: 'error', text: 'Failed to send message. Please try again later.' }
    setTimeout(() => (toast.value = null), 5000)
    return
  }

  // 2) Admin succeeded — schedule auto-reply attempts in background (non-blocking)
  const paramsForUser = {
    name: name.value.trim(),
    message: message.value.trim(),
    reply_to: email.value.trim()
  }

  // fire-and-forget: attempt retries but do NOT show failure to user
  sendWithRetry(
    () => emailjs.send(config.public.emailjsService, config.public.emailjsUserTemplate, paramsForUser),
    2,
    [200, 500]
  ).then(result => {
    if (!result.ok) {
      // log for your debugging only; do not inform user
      console.error('Auto-reply failed after retries:', result.err)
      // optionally: send failure info to your server logging endpoint here
    } else {
      console.debug('Auto-reply sent successfully.')
    }
  }).catch(err => {
    console.error('Auto-reply unexpected error:', err)
  })

  // 3) Reset form & show confident success to visitor
  name.value = ''
  email.value = ''
  message.value = ''
  company.value = ''

  toast.value = { type: 'success', text: 'Message sent. Thank you!' }
  loading.value = false
  setTimeout(() => (toast.value = null), 5000)
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">Contact Me</h1>
    <p class="mb-6 text-muted">Have a question or want to work together? Send me a message and I’ll get back to you shortly.</p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <label class="block">
        <span class="text-sm font-medium">Name</span>
        <input v-model="name" type="text" class="mt-1 block w-full rounded-md border px-3 py-2" placeholder="Your name" />
      </label>

      <label class="block">
        <span class="text-sm font-medium">Email</span>
        <input v-model="email" type="email" class="mt-1 block w-full rounded-md border px-3 py-2" placeholder="you@example.com" />
      </label>

      <!-- honeypot: visually hidden -->
      <label style="display:none">
        <span>Company (leave empty)</span>
        <input v-model="company" type="text" autocomplete="off" tabindex="-1" />
      </label>

      <label class="block">
        <span class="text-sm font-medium">Message</span>
        <textarea v-model="message" rows="6" class="mt-1 block w-full rounded-md border px-3 py-2" placeholder="Write your message..." />
      </label>

      <div class="flex items-center gap-3">
        <button
          :disabled="loading"
          type="submit"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /></svg>
          <span>{{ loading ? 'Sending...' : 'Send Message' }}</span>
        </button>
        <p v-if="!loading" class="text-sm text-gray-600">I'll reply as soon as possible.</p>
      </div>
    </form>

    <!-- toast -->
    <div v-if="toast" class="fixed bottom-6 right-6 max-w-xs">
      <div v-if="toast.type === 'success'" class="bg-green-600 text-white px-4 py-3 rounded-md shadow">
        {{ toast.text }}
      </div>
      <div v-else-if="toast.type === 'error'" class="bg-red-600 text-white px-4 py-3 rounded-md shadow">
        {{ toast.text }}
      </div>
      <div v-else class="bg-slate-600 text-white px-4 py-3 rounded-md shadow">
        {{ toast.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-muted { color: #6b7280; }
</style>
