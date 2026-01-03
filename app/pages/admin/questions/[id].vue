<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const question = ref<any>(null)
const answer = ref('')

async function loadQuestion() {
  loading.value = true
  try {
    const res: any = await $fetch('/api/admin/questions')
    const all = [...res.pending, ...res.answered]
    question.value = all.find((q: any) => q.id === id)

    if (!question.value) {
      error.value = 'Question not found'
      return
    }

    answer.value = question.value.admin_answer || '' // DB field is admin_answer
  } catch (e) {
    error.value = 'Failed to load question'
  } finally {
    loading.value = false
  }
}

async function submitAnswer() {
  if (!answer.value.trim()) {
    error.value = 'Answer cannot be empty'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    await $fetch('/api/admin/answer', {
      method: 'POST',
      body: {
        id,
        answer: answer.value
      }
    })

    success.value = 'Answer sent successfully'
    await loadQuestion()
  } catch (e) {
    error.value = 'Failed to send answer'
  } finally {
    saving.value = false
  }
}

async function reopenQuestion() {
  saving.value = true
  try {
    await $fetch('/api/admin/answer', {
      method: 'POST',
      body: {
        id,
        answer: null,
        reopen: true
      }
    })
    await loadQuestion()
  } catch (e) {
    error.value = 'Failed to reopen question'
  } finally {
    saving.value = false
  }
}

async function handleAction(action: 'reopen' | 'delete') {
  if (action === 'reopen') {
      return reopenQuestion()
  }

  if (action === 'delete') {
      if (!confirm('Delete this question permanently from AI flow?')) return

      saving.value = true
      try {
        await $fetch('/api/admin/questions/delete', {
            method: 'POST',
            body: { id } // Use the route param 'id'
        })
        router.push('/admin/questions')
      } catch (e) {
        error.value = 'Failed to delete question'
        saving.value = false
      }
  }
}

onMounted(loadQuestion)
</script>

<template>
  <section class="max-w-3xl border p-6 rounded-lg bg-white shadow-sm mx-auto mt-6">
    <button @click="router.push('/admin/questions')" class="text-sm text-indigo-600 hover:underline mb-4">
      ← Back to Questions
    </button>

    <div v-if="loading">Loading…</div>

    <div v-else-if="question">
      <div class="mb-6">
          <span v-if="question.status === 'pending'" class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">PENDING</span>
          <span v-else class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">ANSWERED</span>
      </div>

      <h1 class="text-xl font-bold mb-2">{{ question.question }}</h1>

      <p class="text-sm text-gray-500 mb-6">
        From: {{ question.user_email || 'Anonymous' }} • Created: {{ new Date(question.created_at).toLocaleString() }}
      </p>

      <div class="border-t pt-4">
          <h2 class="font-semibold mb-2">Answer</h2>

          <textarea
            v-model="answer"
            rows="6"
            class="w-full border rounded p-3"
            :disabled="saving"
            placeholder="Type your answer here..."
          />

          <div class="flex gap-3 mt-4">
            <button
              @click="submitAnswer"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              :disabled="saving"
            >
              {{ question.status === 'answered' ? 'Update Answer' : 'Send Answer' }}
            </button>

            <!-- Admin Tools -->
            <div class="flex gap-4 ml-auto">
                 <button 
                    v-if="question.status === 'answered'" 
                    @click="handleAction('reopen')" 
                    class="text-orange-600 hover:underline text-sm font-medium"
                    :disabled="saving"
                >
                    Reopen Question
                </button>
                
                 <button 
                    @click="handleAction('delete')" 
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                    :disabled="saving"
                >
                    Delete Question
                </button>
            </div>
          </div>

          <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
          <p v-if="success" class="text-green-600 mt-3">{{ success }}</p>
      </div>
    </div>
  </section>
</template>
