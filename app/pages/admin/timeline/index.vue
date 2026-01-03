<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data, pending, refresh } = await useFetch<any[]>('/api/admin/timeline')

async function remove(id: string) {
  if (!confirm('Delete this timeline entry?')) return

  await $fetch('/api/admin/timeline/delete', {
    method: 'POST',
    body: { id }
  })

  refresh()
}
</script>

<template>
  <section>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Timeline</h1>
      <NuxtLink
        to="/admin/timeline/create"
        class="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        + Add Entry
      </NuxtLink>
    </div>

    <div v-if="pending">Loading…</div>

    <table
      v-else
      class="w-full border text-sm"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">Date</th>
          <th class="p-2 text-left">Title</th>
          <th class="p-2">Status</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in data"
          :key="item.id"
          class="border-t"
        >
          <td class="p-2">{{ item.date }}</td>
          <td class="p-2">{{ item.title }}</td>
          <td class="p-2 text-center">
            <span
              class="px-2 py-1 rounded text-xs"
              :class="item.published ? 'bg-green-100 text-green-700' : 'bg-gray-200'"
            >
              {{ item.published ? 'Published' : 'Draft' }}
            </span>
          </td>
          <td class="p-2 text-center space-x-2">
            <NuxtLink
              :to="`/admin/timeline/${item.id}`"
              class="text-blue-600"
            >
              Edit
            </NuxtLink>
            <button
              class="text-red-600"
              @click="remove(item.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
