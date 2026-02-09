<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const loading = ref(false)
const logs = ref<string[]>([])
const success = ref(false)
const error = ref('')

async function startReindex() {
  if (loading.value) return
  if (!confirm('This will wipe the AI brain and rebuild it from your database. Proceed?')) return

  loading.value = true
  logs.value = ['Initiating request...']
  success.value = false
  error.value = ''

  try {
    const res = await $fetch<any>('/api/admin/reindex', { method: 'POST' })
    
    if (res.log && Array.isArray(res.log)) {
        logs.value = res.log
    }

    if (res.success) {
        success.value = true
        logs.value.push('🎉 Done!')
    } else {
        error.value = res.error || 'Unknown error'
        logs.value.push(`❌ Failed: ${error.value}`)
    }
  } catch (e: any) {
    error.value = e.message || 'Network error'
    logs.value.push(`❌ Fatal: ${error.value}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-2">Reindex AI Brain 🧠</h1>
    <p class="text-gray-600 mb-8">
        This process reads all your <strong>Publised</strong> content (Projects, Timeline, Knowledge, etc.)
        and updates the AI's vector database.
    </p>

    <div class="bg-white p-8 rounded-lg shadow-sm border text-center">
        <div class="mb-6">
            <div class="text-5xl mb-4">🤖</div>
            <h3 class="text-lg font-medium">Ready to Synchronization</h3>
            <p class="text-sm text-gray-500 mt-1">Updates generic knowledge, skills, and portfolio data.</p>
        </div>

        <button
          @click="startReindex"
          :disabled="loading"
          class="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Reindexing...
          </span>
          <span v-else>Start Reindex Process</span>
        </button>
    </div>

    <!-- Logs -->
    <div v-if="logs.length" class="mt-8">
        <h4 class="font-semibold mb-2">Process Log:</h4>
        <div class="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg shadow-inner overflow-y-auto max-h-64">
            <div v-for="(line, i) in logs" :key="i" class="mb-1 border-b border-gray-800 pb-1 last:border-0">
                <span class="opacity-50 mr-2">>></span> {{ line }}
            </div>
        </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="mt-4 bg-red-50 text-red-700 p-4 rounded border border-red-200">
        <strong>Error:</strong> {{ error }}
    </div>

  </section>
</template>
