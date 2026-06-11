<script setup lang="ts">
import { ref } from 'vue'

// NOTE: Footer is already rendered by layouts/default.vue — removed duplicate import

const { show } = useToast()

const name = ref('')
const email = ref('')
const message = ref('')
const company = ref('') // honeypot

const loading = ref(false)

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

async function handleSubmit() {
  const v = validate()
  if (!v.ok) {
    if (v.msg === 'spam') return
    show('error', v.msg as string)
    return
  }

  loading.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        title: 'Portfolio Contact',
        name: name.value.trim(),
        email: email.value.trim(),
        message: message.value.trim()
      }
    })
  } catch (err) {
    console.error('Contact API failed:', err)
    loading.value = false
    show('error', 'Failed to send message. Please try again later.')
    return
  }

  name.value = ''
  email.value = ''
  message.value = ''
  company.value = ''

  show('success', 'Message sent. Thank you!')
  loading.value = false
}
</script>

<template>
  <section class="min-h-screen py-16 bg-[#0b0f1a]">
    <div class="container mx-auto px-4 lg:px-8 max-w-2xl">

      <!-- Page Header -->
      <div class="mb-12 animate-fade-in-up">
        <div class="inline-block px-3 py-1 bg-white/[0.03] text-slate-400 rounded-full text-sm font-semibold tracking-wide uppercase border border-white/[0.06] mb-4">
          Get In Touch
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-100 leading-tight">Contact Me</h1>
        <p class="mt-3 text-slate-400 text-lg leading-relaxed">
          Have a question or want to work together? Send me a message and I'll get back to you shortly.
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-8">
        <form @submit.prevent="handleSubmit" class="space-y-5">

          <label class="block">
            <span class="text-sm font-medium text-slate-300">Name</span>
            <input
              v-model="name"
              type="text"
              class="mt-1.5 block w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              placeholder="Your name"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-300">Email</span>
            <input
              v-model="email"
              type="email"
              class="mt-1.5 block w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              placeholder="you@example.com"
            />
          </label>

          <!-- honeypot: visually hidden -->
          <label style="display:none">
            <span>Company (leave empty)</span>
            <input v-model="company" type="text" autocomplete="off" tabindex="-1" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-300">Message</span>
            <textarea
              v-model="message"
              rows="6"
              class="mt-1.5 block w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
              placeholder="Write your message..."
            />
          </label>

          <div class="flex items-center gap-4 pt-2">
            <button
              :disabled="loading"
              type="submit"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-lg shadow-indigo-900/30"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /></svg>
              <span>{{ loading ? 'Sending…' : 'Send Message' }}</span>
            </button>
            <p v-if="!loading" class="text-sm text-slate-500">I'll reply as soon as possible.</p>
          </div>

        </form>
      </div>

    </div>
  </section>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.7s ease-out both;
}
</style>