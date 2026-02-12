<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'] // User used array, keeping it. Added layout: 'admin' for consistency.
})

type Update = {
  id: string
  title: string
  short: string | null
  published: boolean
  created_at: string
}

const loading = ref(true)
const updates = ref<Update[]>([])
const error = ref('')

async function fetchUpdates() {
  loading.value = true
  try {
    updates.value = await $fetch('/api/admin/updates')
  } catch (e) {
    error.value = 'Failed to load updates'
  } finally {
    loading.value = false
  }
}

async function togglePublish(update: Update) {
  try {
    await $fetch('/api/admin/updates/update', {
        method: 'PUT',
        body: {
        id: update.id,
        published: !update.published
        }
    })
    // Optimistic update or refresh
    update.published = !update.published
    // Alternatively refresh all: await fetchUpdates()
    // User code used: await fetchUpdates()
    await fetchUpdates()
  } catch (e) {
      alert('Failed to toggle publish')
  }
}

async function deleteUpdate(id: string) {
  const ok = confirm('Delete this update permanently?')
  if (!ok) return

  await $fetch('/api/admin/updates/delete', {
    method: 'POST',
    body: { id }
  })

  await fetchUpdates()
}

onMounted(fetchUpdates)
</script>

<template>
  <section class="max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Dinesh Now Updates</h1>

      <NuxtLink
        to="/admin/updates/create"
        class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        + New Update
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500">Loading…</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table
      v-if="!loading && updates.length"
      class="w-full border rounded-lg overflow-hidden"
    >
      <thead class="bg-gray-100 text-left text-sm">
        <tr>
          <th class="p-3 w-20">Image</th>
          <th class="p-3">Title</th>
          <th class="p-3">Summary</th>
          <th class="p-3">Status</th>
          <th class="p-3">Created</th>
          <th class="p-3">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="u in updates"
          :key="u.id"
          class="border-t hover:bg-gray-50 bg-white"
        >
          <td class="p-3">
             <div class="w-12 h-12 bg-slate-100 rounded overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img v-if="u.image" :src="u.image" class="w-full h-full object-cover" />
                  <span v-else class="text-xs text-slate-300">No Img</span>
             </div>
          </td>
          <td class="p-3 font-medium">{{ u.title }}</td>
          <td class="p-3 text-sm text-gray-600">
            {{ u.short || '—' }}
          </td>

          <td class="p-3">
            <span
              :class="u.published
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'"
              class="px-2 py-1 rounded text-xs font-semibold"
            >
              {{ u.published ? 'Published' : 'Draft' }}
            </span>
          </td>

          <td class="p-3 text-sm text-gray-500">
            {{ new Date(u.created_at).toLocaleDateString() }}
          </td>

          <td class="p-3 flex gap-3 text-sm">
            <NuxtLink
              :to="`/admin/updates/${u.id}`"
              class="text-indigo-600 hover:underline"
            >
              Edit
            </NuxtLink>

            <button
              @click="togglePublish(u)"
              class="text-blue-600 hover:underline"
            >
              {{ u.published ? 'Unpublish' : 'Publish' }}
            </button>

            <button
              @click="deleteUpdate(u.id)"
              class="text-red-600 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="!loading && updates.length === 0"
      class="text-gray-500"
    >
      No updates yet.
    </div>
  </section>
</template>
