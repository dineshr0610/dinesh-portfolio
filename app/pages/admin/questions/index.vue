<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const loading = ref(true)
const error = ref('')

const pending = ref<any[]>([])
const answered = ref<any[]>([])

const activeTab = ref<'pending' | 'answered'>('pending')

async function loadQuestions() {
  loading.value = true
  error.value = ''

  try {
    const data: any = await $fetch('/api/admin/questions')

    pending.value = data.pending || []
    answered.value = data.answered || []
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load questions.'
  } finally {
    loading.value = false
  }
}

onMounted(loadQuestions)
</script>

<template>
  <section class="max-w-5xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">AI Questions</h1>

    <!-- Tabs -->
    <div class="flex gap-3 mb-6">
      <button
        @click="activeTab = 'pending'"
        :class="[
          'px-4 py-2 rounded',
          activeTab === 'pending'
            ? 'bg-indigo-600 text-white'
            : 'border'
        ]"
      >
        Pending ({{ pending.length }})
      </button>

      <button
        @click="activeTab = 'answered'"
        :class="[
          'px-4 py-2 rounded',
          activeTab === 'answered'
            ? 'bg-indigo-600 text-white'
            : 'border'
        ]"
      >
        Answered ({{ answered.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-500">
      Loading questions…
    </div>

    <!-- Error -->
    <div v-if="error" class="text-red-600">
      {{ error }}
    </div>

    <!-- Pending -->
    <div v-if="!loading && activeTab === 'pending'">
      <div
        v-if="pending.length === 0"
        class="text-gray-500"
      >
        No pending questions 🎉
      </div>

      <ul class="space-y-3">
        <li
          v-for="q in pending"
          :key="q.id"
          class="border rounded p-4 hover:bg-gray-50"
        >
          <NuxtLink
            :to="`/admin/questions/${q.id}`"
            class="block"
          >
            <p class="font-medium">
              {{ q.question }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              {{ q.user_email || 'No email provided' }}
            </p>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Answered -->
    <div v-if="!loading && activeTab === 'answered'">
      <div
        v-if="answered.length === 0"
        class="text-gray-500"
      >
        No answered questions yet.
      </div>

      <ul class="space-y-3">
        <li
          v-for="q in answered"
          :key="q.id"
          class="border rounded p-4 bg-green-50"
        >
          <NuxtLink
            :to="`/admin/questions/${q.id}`"
            class="block"
          >
            <p class="font-medium">
              {{ q.question }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              Answered
            </p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
