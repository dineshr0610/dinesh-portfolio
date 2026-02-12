<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: items, pending, refresh } = await useFetch('/api/admin/social-highlights')

async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this highlight?')) return

  try {
    await $fetch(`/api/admin/social-highlights/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e) {
    alert('Failed to delete')
  }
}


</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Social Highlights</h1>
      <NuxtLink to="/admin/social-highlights/create" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
        + Add New
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-gray-500">Loading...</div>

    <!-- Empty State -->
    <div v-else-if="!items?.length" class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
      <p class="text-gray-500 mb-4">No highlights found.</p>
      <NuxtLink to="/admin/social-highlights/create" class="text-indigo-600 font-medium hover:underline">Create your first highlight</NuxtLink>
    </div>

    <!-- List -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Platform</th>
              <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap w-20">Preview</th>
              <th class="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th class="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50/50">
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {{ item.platform }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="w-24 h-16 bg-white rounded overflow-hidden border border-gray-200 flex items-center justify-center text-xs text-gray-400 relative">
                   <!-- 
                      Review Fix: 
                      Embeds often need substantial width to render (e.g. >300px). 
                      We set the inner container to 500px width and scale it down to fit the 96px (w-24) container.
                      Scale = 96 / 500 ~= 0.192. Let's use 0.2 approx.
                   -->
                   <div v-if="item.embed_html" class="absolute top-0 left-0 origin-top-left w-[500px] h-[400px] pointer-events-none" style="transform: scale(0.192);" v-html="item.embed_html"></div>
                   <span v-else class="text-[10px] text-center px-1">No Embed</span>
                </div>
              </td>
              <td class="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                {{ item.title || '—' }}
              </td>
              <td class="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                <NuxtLink :to="`/admin/social-highlights/${item.id}`" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</NuxtLink>
                <button @click="deleteItem(item.id)" class="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
