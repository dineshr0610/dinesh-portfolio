<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const route = useRoute()
const id = route.params.id as string

const title = ref('')
const short = ref('')
const body = ref('')
const image = ref('')
const tagsInput = ref('')
const published = ref(false)
const publishedAt = ref(new Date().toISOString().split('T')[0])

const loading = ref(false)
const error = ref('')
const initialLoaded = ref(false)

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

// -----------------------------
// Load existing update
// -----------------------------
async function loadUpdate() {
  try {
    const data: any = await $fetch('/api/admin/updates', {
      query: { id }
    })

    title.value = data.title
    short.value = data.short
    body.value = data.body
    image.value = data.image || ''
    tagsInput.value = (data.tags || []).join(', ')
    published.value = data.published
    publishedAt.value = data.published_at
      ? String(data.published_at).split('T')[0]
      : new Date().toISOString().split('T')[0]

    initialLoaded.value = true
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load update.'
  }
}

onMounted(loadUpdate)

// -----------------------------
// Save changes
// -----------------------------
async function saveUpdate() {
  if (!title.value.trim() || !short.value.trim() || !body.value.trim()) {
    error.value = 'Title, short summary, and body are required.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/admin/updates/update', {
      method: 'PUT',
      body: {
        id,
        title: title.value.trim(),
        short: short.value.trim(),
        body: body.value,
        image: image.value.trim() || null,
        tags: parseTags(tagsInput.value),
        published: published.value,
        published_at: published.value ? publishedAt.value : null
      }
    })

    navigateTo('/admin/updates')
  } catch (e) {
    console.error(e)
    error.value = 'Failed to save update.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Edit Dinesh Now Update</h1>

    <div v-if="!initialLoaded" class="text-gray-500">
      Loading…
    </div>

    <div v-else class="space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium mb-1">Title</label>
        <input
          v-model="title"
          type="text"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <!-- Short -->
      <div>
        <label class="block text-sm font-medium mb-1">Short summary</label>
        <input
          v-model="short"
          type="text"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <!-- Body -->
      <div>
        <label class="block text-sm font-medium mb-1">
          Full content (Markdown)
        </label>
        <textarea
          v-model="body"
          rows="8"
          class="w-full border rounded px-3 py-2 font-mono"
        />
      </div>

      <!-- Media -->
      <div>
        <label class="block text-sm font-medium mb-1">
          Image / Video URL
        </label>
        <input
          v-model="image"
          type="url"
          class="w-full border rounded px-3 py-2"
        />
        <div v-if="image" class="mt-2 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
           <img :src="image" class="w-full h-full object-contain" />
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-sm font-medium mb-1">Tags</label>
        <input
          v-model="tagsInput"
          type="text"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <!-- Publish -->
      <div class="flex items-center gap-3">
        <input
          id="published"
          type="checkbox"
          v-model="published"
          class="h-4 w-4"
        />
        <label for="published" class="text-sm">
          Published
        </label>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Published Date</label>
        <input
          v-model="publishedAt"
          type="date"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <button
          @click="saveUpdate"
          :disabled="loading"
          class="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ loading ? 'Saving…' : 'Save Changes' }}
        </button>

        <NuxtLink
          to="/admin/updates"
          class="px-5 py-2 rounded border"
        >
          Cancel
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
