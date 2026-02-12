<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const title = ref('')
const short = ref('')
const body = ref('') // MARKDOWN
const image = ref('') // image or video URL
const tagsInput = ref('')
const published = ref(false)

const loading = ref(false)
const error = ref('')

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

async function createUpdate() {
  if (!title.value.trim() || !short.value.trim() || !body.value.trim()) {
    error.value = 'Title, short summary, and body are required.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/admin/updates/create', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        short: short.value.trim(),
        body: body.value,
        image: image.value.trim() || null,
        tags: parseTags(tagsInput.value),
        published: published.value,
        published_at: published.value ? new Date().toISOString() : null
      }
    })

    navigateTo('/admin/updates')
  } catch (e) {
    console.error(e)
    error.value = 'Failed to create update.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Create Dinesh Now Update</h1>

    <div class="space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium mb-1">Title</label>
        <input
          v-model="title"
          type="text"
          class="w-full border rounded px-3 py-2"
          placeholder="What are you working on?"
        />
      </div>

      <!-- Short -->
      <div>
        <label class="block text-sm font-medium mb-1">Short summary</label>
        <input
          v-model="short"
          type="text"
          class="w-full border rounded px-3 py-2"
          placeholder="One-line preview shown publicly"
        />
      </div>

      <!-- Body (Markdown) -->
      <div>
        <label class="block text-sm font-medium mb-1">
          Full content (Markdown)
        </label>
        <textarea
          v-model="body"
          rows="8"
          class="w-full border rounded px-3 py-2 font-mono"
          placeholder="Write the full update here (Markdown supported)…"
        />
      </div>

      <!-- Media -->
      <div>
        <label class="block text-sm font-medium mb-1">
          Image / Video URL (optional)
        </label>
        <input
          v-model="image"
          type="url"
          class="w-full border rounded px-3 py-2"
          placeholder="https://res.cloudinary.com/... or YouTube URL"
        />
        <p class="text-xs text-gray-500 mt-1">
          Paste an image or video URL. Uploads are not required.
        </p>
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
          placeholder="ai, nuxt, learning, project"
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
          Publish immediately
        </label>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <button
          @click="createUpdate"
          :disabled="loading"
          class="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ loading ? 'Saving…' : 'Create Update' }}
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
