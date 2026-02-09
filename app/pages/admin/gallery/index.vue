<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const loading = ref(true)
const items = ref<any[]>([])
const filter = ref('all') // all | image | video

// Fetch data
async function load() {
  loading.value = true
  try {
    items.value = await $fetch('/api/admin/gallery') as any[]
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Computed filtered items
const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  return items.value.filter(i => i.type === filter.value)
})

// Validation helper for images
function getThumbnail(item: any) {
    if (item.type === 'image') return item.src
    if (item.type === 'video') return item.poster || item.src // src might not work for video thumb but better than nothing
    return ''
}

async function togglePublish(item: any) {
  try {
    const newVal = !item.published
    await $fetch('/api/admin/gallery/publish', {
        method: 'POST',
        body: { id: item.id, published: newVal }
    })
    item.published = newVal
  } catch (e) {
    alert('Failed to update status')
  }
}

async function remove(id: string) {
  if (!confirm('Permanently delete this item?')) return
  await $fetch('/api/admin/gallery/delete', {
    method: 'POST',
    body: { id }
  })
  load()
}

onMounted(load)
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Gallery Manager</h1>
        <p class="text-gray-500 mt-1">Curate your visual portfolio</p>
      </div>
      
      <div class="flex gap-3">
         <select v-model="filter" class="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Media</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
         </select>

        <NuxtLink
          to="/admin/gallery/create"
          class="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition flex items-center gap-2"
        >
          <span>+</span> Add Media
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-gray-500 animate-pulse">
        Loading gallery...
    </div>

    <div v-else-if="filteredItems.length === 0" class="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500">No media found matching your filter.</p>
    </div>

    <!-- Grid Layout for Gallery Items -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group"
        >
            <!-- Media Preview Area -->
            <div class="aspect-video bg-gray-100 relative overflow-hidden group">
                <img 
                    v-if="getThumbnail(item)" 
                    :src="getThumbnail(item)" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    No Preview
                </div>

                <!-- Overlay Type Badge -->
                <div class="absolute top-2 right-2">
                    <span 
                        class="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide backdrop-blur-md bg-black/40 text-white"
                    >
                        {{ item.type }}
                    </span>
                </div>
            </div>

            <!-- Content Area -->
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-900 truncate pr-2" :title="item.title">
                        {{ item.title || 'Untitled' }}
                    </h3>
                    <button 
                        @click="togglePublish(item)"
                        class="shrink-0 w-3 h-3 rounded-full mt-1.5 ring-2 ring-offset-1 transition-colors"
                        :class="item.published ? 'bg-green-500 ring-green-500' : 'bg-gray-300 ring-gray-300 hover:bg-gray-400'"
                        :title="item.published ? 'Published' : 'Draft'"
                    >
                    </button>
                </div>
                
                <p class="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-4">
                    {{ item.description || 'No description provided.' }}
                </p>

                <!-- Actions -->
                <div class="flex gap-2 pt-3 border-t">
                    <NuxtLink 
                        :to="`/admin/gallery/${item.id}`"
                        class="flex-1 text-center py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100 transition"
                    >
                        Edit
                    </NuxtLink>
                    <button 
                        @click="remove(item.id)"
                        class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>
