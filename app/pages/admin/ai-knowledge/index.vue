<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

type Knowledge = {
  id: string
  section: string
  title: string | null
  content: string
  priority: number
  published: boolean
  updated_at: string
}

const loading = ref(true)
const items = ref<Knowledge[]>([])
const error = ref('')

async function fetchItems() {
  loading.value = true
  try {
    items.value = await $fetch('/api/admin/ai-knowledge')
  } catch (e) {
    error.value = 'Failed to load knowledge entries'
  } finally {
    loading.value = false
  }
}

async function togglePublish(item: Knowledge) {
  try {
    await $fetch('/api/admin/ai-knowledge/update', {
        method: 'PUT',
        body: {
            id: item.id,
            published: !item.published
        }
    })
    item.published = !item.published
  } catch (e) {
      alert('Failed to toggle publish')
  }
}

async function deleteItem(id: string) {
  if (!confirm('Delete this knowledge entry?')) return

  await $fetch('/api/admin/ai-knowledge/delete', {
    method: 'POST',
    body: { id }
  })

  await fetchItems()
}

onMounted(fetchItems)
</script>

<template>
  <section class="max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">AI Knowledge Core</h1>
      
      <NuxtLink
        to="/admin/ai-knowledge/create"
        class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        + Add Knowledge
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table
      v-if="!loading && items.length"
      class="w-full border rounded-lg overflow-hidden"
    >
      <thead class="bg-gray-100 text-left text-sm">
        <tr>
          <th class="p-3">Section</th>
          <th class="p-3">Title</th>
          <th class="p-3">Priority</th>
          <th class="p-3">Status</th>
          <th class="p-3">Updated</th>
          <th class="p-3">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
          class="border-t hover:bg-gray-50 bg-white"
        >
          <td class="p-3 font-medium capitalize">{{ item.section }}</td>
          <td class="p-3 text-gray-700">{{ item.title || '—' }}</td>
          <td class="p-3 text-gray-600">{{ item.priority }}</td>
          
          <td class="p-3">
             <span
                :class="item.published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'"
                class="px-2 py-1 rounded text-xs font-semibold"
              >
                {{ item.published ? 'Active' : 'Draft' }}
              </span>
          </td>

          <td class="p-3 text-sm text-gray-500">
            {{ new Date(item.updated_at).toLocaleDateString() }}
          </td>

          <td class="p-3 flex gap-3 text-sm">
            <NuxtLink
              :to="`/admin/ai-knowledge/${item.id}`"
              class="text-indigo-600 hover:underline"
            >
              Edit
            </NuxtLink>

            <button
              @click="togglePublish(item)"
              class="text-blue-600 hover:underline"
            >
              {{ item.published ? 'Disable' : 'Enable' }}
            </button>

            <button
              @click="deleteItem(item.id)"
              class="text-red-600 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="!loading && items.length === 0"
      class="text-gray-500 mt-4"
    >
      No knowledge entries found. AI is empty brained! 🧠
    </div>
  </section>
</template>
