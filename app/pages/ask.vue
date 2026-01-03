<!-- app/pages/ask.vue -->
<template>
  <section class="prose lg:prose-xl">
    <h2>Ask Dinesh</h2>
    <p>Ask questions about me — answers come only from my data.</p>

    <div class="mt-4">
      <!-- Question Input -->
      <textarea
        v-model="q"
        :disabled="needsEmail"
        class="w-full border rounded p-2"
        rows="4"
        placeholder="Ask a question..."
      />

      <!-- Email input (only when AI asks for it) -->
      <input
        v-if="needsEmail"
        v-model="email"
        type="email"
        class="w-full border rounded p-2 mt-2"
        placeholder="Your email (so I can reply personally)"
      />

      <div class="mt-2 flex gap-2">
        <!-- Ask button -->
        <button
          v-if="!needsEmail"
          @click="askQuestion"
          class="px-4 py-2 bg-indigo-600 text-white rounded"
          :disabled="loading"
        >
          Send
        </button>

        <!-- Submit Email button -->
        <button
          v-else
          @click="submitEmail"
          class="px-4 py-2 bg-indigo-600 text-white rounded"
          :disabled="loading"
        >
          Submit Email
        </button>

        <button
          @click="clear"
          class="px-4 py-2 border rounded"
          :disabled="loading"
        >
          Clear
        </button>
      </div>

      <div v-if="loading" class="mt-4">Thinking…</div>

      <div v-if="answer" class="mt-4 p-4 bg-white/80 rounded">
        <strong>Answer:</strong>
        <div
          class="mt-2 prose prose-indigo max-w-none"
          v-html="renderedAnswer"
        />
      </div>

      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'

const q = ref('')
const email = ref('')
const answer = ref('')
const loading = ref(false)
const error = ref('')
const needsEmail = ref(false)

const renderedAnswer = computed(() =>
  answer.value ? marked.parse(answer.value) : ''
)

// ----------------------------
// 1️⃣ ASK QUESTION
// ----------------------------
async function askQuestion() {
  if (!q.value.trim()) {
    error.value = 'Please type a question.'
    return
  }

  loading.value = true
  error.value = ''
  answer.value = ''
  needsEmail.value = false

  try {
    const res: any = await $fetch('/api/ask', {
      method: 'POST',
      body: { question: q.value }
    })

    if (res.type === 'need_email') {
      needsEmail.value = true
      answer.value = res.message
      return
    }

    if (res.type === 'answer') {
      answer.value = res.message
      return
    }
  } catch (e) {
    error.value = 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

// ----------------------------
// 2️⃣ SUBMIT EMAIL
// ----------------------------
async function submitEmail() {
  if (!email.value.trim()) {
    error.value = 'Please enter your email.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res: any = await $fetch('/api/ask', {
      method: 'POST',
      body: {
        question: q.value,
        email: email.value,
        intent: 'submit_email'
      }
    })

    if (res.type === 'fallback_saved') {
      answer.value = res.message
      needsEmail.value = false
      email.value = ''
    }
  } catch (e) {
    error.value = 'Failed to submit email.'
  } finally {
    loading.value = false
  }
}

function clear() {
  q.value = ''
  email.value = ''
  answer.value = ''
  error.value = ''
  needsEmail.value = false
}
</script>
