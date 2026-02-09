<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const loading = ref(true)
const saving = ref(false)

const form = ref({
  section: '',
  title: '',
  content: '',
  priority: 0,
  published: true
})

const sections = ['profile','summary', 'skills', 'education', 'experience', 'about']

type Knowledge = {
  section: string
  title: string | null
  content: string
  priority: number
  published: boolean
}

onMounted(async () => {
  try {
    const data = await $fetch<Knowledge>(`/api/admin/ai-knowledge?id=${id}`)
    form.value = {
        section: data.section,
        title: data.title || '',
        content: data.content,
        priority: data.priority,
        published: data.published
    }
  } catch (e) {
    alert('Failed to load entry')
    router.push('/admin/ai-knowledge')
  } finally {
    loading.value = false
  }
})

async function handleUpdate() {
  saving.value = true
  try {
    await $fetch('/api/admin/ai-knowledge/update', {
      method: 'PUT',
      body: {
        id,
        ...form.value
      }
    })
    router.push('/admin/ai-knowledge')
  } catch (e: any) {
    alert(e.statusMessage || 'Failed to update entry')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Edit Knowledge</h1>
        <NuxtLink to="/admin/ai-knowledge" class="text-gray-600 hover:underline">
          &larr; Back
        </NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <form v-else @submit.prevent="handleUpdate" class="space-y-6 bg-white p-6 rounded-lg shadow border">
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
      </div>

      <!-- Title -->
      <div>
        <label class="block text-sm font-medium mb-1">Title</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full border rounded p-2"
        />
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium mb-1">Content</label>
        <textarea
          v-model="form.content"
          rows="10"
          class="w-full border rounded p-2 font-mono text-sm"
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
          :disabled="saving"
          class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ saving ? 'Updating...' : 'Update' }}
        </button>
      </div>
    </form>
  </section>
</template>
