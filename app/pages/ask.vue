<!-- app/pages/ask.vue -->
<template>
  <section class="prose lg:prose-xl">
    <h2>Ask Dinesh</h2>
    <p>Public AI chat (stub) — the real AI will be integrated later.</p>

    <div class="mt-4">
      <textarea v-model="q" class="w-full border rounded p-2" rows="4" placeholder="Ask a question..."></textarea>
      <div class="mt-2 flex gap-2">
        <button @click="ask" class="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
        <button @click="clear" class="px-4 py-2 border rounded">Clear</button>
      </div>

      <div v-if="loading" class="mt-4">Thinking…</div>
      <div v-if="answer" class="mt-4 p-4 bg-white/80 rounded">
        <strong>Answer:</strong>
        <p class="mt-2 whitespace-pre-wrap">{{ answer }}</p>
      </div>
      <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const q = ref('')
const answer = ref('')
const loading = ref(false)
const error = ref('')

async function ask() {
  if (!q.value.trim()) {
    error.value = 'Please type a question.'
    return
  }
  error.value = ''
  loading.value = true
  answer.value = ''
  try {
    // Call Nuxt server API endpoint /api/chat
    const res = await $fetch('/api/chat', {
      method: 'POST',
      body: { question: q.value }
    })
    // support both { answer } and raw responses
    answer.value = res?.answer ?? JSON.stringify(res)
  } catch (err) {
    error.value = 'API error — check console or server logs.'
    // optional: print detailed error to console for debugging
    console.error(err)
  } finally {
    loading.value = false
  }
}

function clear() {
  q.value = ''
  answer.value = ''
  error.value = ''
}
</script>

<style scoped>
/* small local styles if needed */
</style>
