<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const items = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  items.value = await $fetch('/api/admin/gallery') as any[]
  loading.value = false
}

async function togglePublish(item: any) {
  await $fetch('/api/admin/gallery/publish', {
    method: 'POST',
    body: { id: item.id, published: !item.published }
  })
  load()
}

async function remove(id: string) {
  if (!confirm('Delete this item?')) return
  await $fetch('/api/admin/gallery/delete', {
    method: 'POST',
    body: { id }
  })
  load()
}

onMounted(load)
</script>

<template>
  <section>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gallery</h1>
      <NuxtLink
        to="/admin/gallery/create"
        class="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        + New Item
      </NuxtLink>
    </div>

    <div v-if="loading">Loading…</div>

    <table v-else class="w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">Title</th>
          <th class="p-2">Type</th>
          <th class="p-2">Published</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in items" :key="item.id" class="border-t">
          <td class="p-2">{{ item.title }}</td>
          <td class="p-2 text-center">
            <span
              class="px-2 py-1 rounded text-xs"
              :class="item.type === 'video'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'"
            >
              {{ item.type }}
            </span>
          </td>
          <td class="p-2 text-center">
            <button
              @click="togglePublish(item)"
              class="text-sm"
              :class="item.published ? 'text-green-600' : 'text-gray-400'"
            >
              {{ item.published ? 'Published' : 'Draft' }}
            </button>
          </td>
          <td class="p-2 flex gap-2 justify-center">
            <NuxtLink
              :to="`/admin/gallery/${item.id}`"
              class="text-indigo-600"
            >
              Edit
            </NuxtLink>
            <button class="text-red-600" @click="remove(item.id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
