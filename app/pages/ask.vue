<!-- app/pages/ask.vue -->
<template>
  <section class="prose lg:prose-xl">
    <h2>Ask Dinesh</h2>
    <p>Ask questions about me — answers come only from my data.</p>

    <div class="mt-4">
      <textarea
        v-model="q"
        class="w-full border rounded p-2"
        rows="4"
        placeholder="Ask a question..."
      />

      <div class="mt-2 flex gap-2">
        <button
          @click="ask"
          class="px-4 py-2 bg-indigo-600 text-white rounded"
          :disabled="loading"
        >
          Send
        </button>

        <button @click="clear" class="px-4 py-2 border rounded">
          Clear
        </button>
      </div>

      <div v-if="loading" class="mt-4">Thinking…</div>

      <div v-if="answer" class="mt-4 p-4 bg-white/80 rounded">
        <strong>Answer:</strong>
        <p class="mt-2 whitespace-pre-wrap">{{ answer }}</p>
      </div>

      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>
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

  loading.value = true
  error.value = ''
  answer.value = ''

  try {
    const res = await $fetch('/api/ask', {
      method: 'POST',
      body: { question: q.value }
    })

    answer.value = res.answer
  } catch (e) {
    console.error(e)
    error.value = 'Something went wrong. Check server logs.'
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
