<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: items, pending: loading, error, refresh } =
  await useFetch<any[]>('/api/admin/achievements')

const filter = ref('all') // all | certificate | award | hackathon | competition

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  return items.value?.filter(i => i.type === filter.value) || []
})

async function togglePublish(item: any) {
  try {
    const newVal = !item.published
    await $fetch('/api/admin/achievements/publish', {
        method: 'POST',
        body: { id: item.id, published: newVal }
    })
    item.published = newVal
  } catch (e) {
    alert('Failed to update status')
  }
}

async function remove(id: string) {
  if (!confirm('Permanently delete this achievement?')) return
  await $fetch('/api/admin/achievements/delete', {
    method: 'POST',
    body: { id }
  })
  refresh()
}

function getTypeIcon(type: string) {
    switch(type) {
        case 'certificate': return '📜'
        case 'award': return '🏆'
        case 'hackathon': return '💻'
        case 'competition': return '🥇'
        default: return '📌'
    }
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Achievements</h1>
        <p class="text-gray-500 mt-1">Manage your awards, certificates, and wins.</p>
      </div>

      <div class="flex gap-3">
         <select v-model="filter" class="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none capitalize">
            <option value="all">All Types</option>
            <option value="certificate">Certificates</option>
            <option value="award">Awards</option>
            <option value="hackathon">Hackathons</option>
            <option value="competition">Competitions</option>
         </select>

        <NuxtLink
          to="/admin/achievements/create"
          class="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition flex items-center gap-2"
        >
          <span>+</span> Add New
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-gray-500 animate-pulse">
        Loading achievements...
    </div>

     <div v-else-if="!filteredItems?.length" class="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p class="text-gray-500">No achievements found matching your filter.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
            v-for="item in filteredItems" 
            :key="item.id"
            class="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col"
        >
            <!-- Cover / Header -->
            <div class="h-32 bg-gray-100 relative overflow-hidden">
                <img 
                    v-if="item.image_url" 
                    :src="item.image_url" 
                    class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                    <span class="text-4xl filter grayscale opacity-30">{{ getTypeIcon(item.type) }}</span>
                </div>

                <!-- Status Badge -->
                 <div class="absolute top-2 right-2 flex gap-2">
                    <span class="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-white/90 shadow-sm text-gray-700">
                        {{ item.year }}
                    </span>
                 </div>
            </div>

            <!-- Content -->
            <div class="p-5 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                     <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
                        {{ getTypeIcon(item.type) }} {{ item.type }}
                    </span>
                     <button 
                        @click="togglePublish(item)"
                        class="shrink-0 w-3 h-3 rounded-full mt-1 ring-2 ring-offset-1 transition-colors"
                        :class="item.published ? 'bg-green-500 ring-green-500' : 'bg-gray-300 ring-gray-300 hover:bg-gray-400'"
                        :title="item.published ? 'Published' : 'Draft'"
                    >
                    </button>
                </div>
               
                <h3 class="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2" :title="item.title">
                    {{ item.title }}
                </h3>
                
                <p class="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {{ item.short }}
                </p>

                <!-- Actions -->
                <div class="flex gap-2 pt-4 border-t mt-auto">
                    <NuxtLink 
                        :to="`/admin/achievements/${item.id}`"
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
