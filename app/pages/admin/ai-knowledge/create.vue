<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const loading = ref(false)

const form = ref({
  section: 'skills',
  title: '',
  content: '',
  priority: 0,
  published: true
})

const sections = ['profile', 'summary', 'skills', 'education', 'experience', 'about']

async function handleSubmit() {
  loading.value = true
  try {
    await $fetch('/api/admin/ai-knowledge/create', {
      method: 'POST',
      body: form.value
    })
    router.push('/admin/ai-knowledge')
  } catch (e: any) {
    alert(e.statusMessage || 'Failed to create entry')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Add AI Knowledge</h1>
      <NuxtLink to="/admin/ai-knowledge" class="text-gray-600 hover:underline">
        &larr; Back
      </NuxtLink>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-6 rounded-lg shadow border">
      
      <!-- Section -->
      <div>
        <label class="block text-sm font-medium mb-1">Section</label>
        <select
          v-model="form.section"
          class="w-full border rounded p-2 bg-white"
        >
          <option v-for="s in sections" :key="s" :value="s" class="capitalize">
            {{ s }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
            Where does this data belong in the Resume structure?
        </p>
      </div>

      <!-- Title (Optional) -->
      <div>
        <label class="block text-sm font-medium mb-1">Title (Optional)</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="e.g. Frontend Tech Stack"
          class="w-full border rounded p-2"
        />
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium mb-1">Content (AI Knowledge)</label>
        <textarea
          v-model="form.content"
          rows="8"
          class="w-full border rounded p-2 font-mono text-sm"
          placeholder="Enter the raw text data the AI should know..."
          required
        ></textarea>
      </div>

      <!-- Priority -->
      <div class="flex gap-6">
        <div class="w-32">
            <label class="block text-sm font-medium mb-1">Priority</label>
            <input
            v-model="form.priority"
            type="number"
            class="w-full border rounded p-2"
            />
        </div>

        <div class="flex items-center pt-6">
            <input
            id="pub"
            v-model="form.published"
            type="checkbox"
            class="w-5 h-5 mr-2"
            />
            <label for="pub" class="text-sm font-medium">Published (Active)</label>
        </div>
      </div>

      <div class="pt-4 border-t">
        <button
          type="submit"
          :disabled="loading"
          class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : 'Save Knowledge' }}
        </button>
      </div>

    </form>
  </section>
</template>
