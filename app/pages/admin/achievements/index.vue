<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, pending, error, refresh } =
  await useFetch('/api/admin/achievements')

async function togglePublish(item: any) {
  await $fetch('/api/admin/achievements/publish', {
    method: 'POST',
    body: { id: item.id, published: !item.published }
  })
  refresh()
}

async function remove(id: string) {
  if (!confirm('Delete this achievement?')) return
  await $fetch('/api/admin/achievements/delete', {
    method: 'POST',
    body: { id }
  })
  refresh()
}
</script>

<template>
  <section class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Achievements</h1>
      <NuxtLink
        to="/admin/achievements/create"
        class="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        + New
      </NuxtLink>
    </div>

    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Failed to load.</div>

    <table v-else class="w-full border">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2">Title</th>
          <th class="p-2">Type</th>
          <th class="p-2">Year</th>
          <th class="p-2">Status</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in data" :key="item.id" class="border-t">
          <td class="p-2 font-medium">{{ item.title }}</td>
          <td class="p-2 capitalize">{{ item.type }}</td>
          <td class="p-2">{{ item.year }}</td>
          <td class="p-2">
            <span
              class="px-2 py-1 text-xs rounded"
              :class="item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            >
              {{ item.published ? 'Published' : 'Draft' }}
            </span>
          </td>
          <td class="p-2 space-x-2">
            <NuxtLink
              :to="`/admin/achievements/${item.id}`"
              class="text-indigo-600 hover:underline"
            >
              Edit
            </NuxtLink>
            <button
              class="text-sm hover:underline"
              @click="togglePublish(item)"
            >
              {{ item.published ? 'Unpublish' : 'Publish' }}
            </button>
            <button
              class="text-red-600 text-sm hover:underline"
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
