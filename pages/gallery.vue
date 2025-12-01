<template>
  <section class="py-8">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Gallery</h1>
        <p class="text-sm text-slate-500">Photos, event highlights, screenshots and notes.</p>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-500">Loading gallery…</div>
      <div v-else-if="error" class="text-center py-12 text-red-600">Failed to load gallery: {{ error }}</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GalleryCard v-for="g in items" :key="g.id" :item="g" @open="openModal" />
      </div>

      <div v-if="active" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white max-w-3xl w-full rounded shadow-lg p-6 overflow-auto max-h-[90vh]">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold">{{ active.title }}</h2>
              <p class="text-sm text-slate-500 mt-1">{{ formatDate(active.date) }}</p>
            </div>
            <button @click="active = null" class="text-slate-500">Close</button>
          </div>

          <img v-if="active.image" :src="active.image" alt="" class="mt-4 w-full h-64 object-cover rounded" />
          <div class="mt-4 text-slate-700" v-html="active.long || active.short"></div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="t in active.tags || []" :key="t" class="px-2 py-1 bg-slate-100 rounded text-xs">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import GalleryCard from '~/components/GalleryCard.vue'
import { ref, onMounted } from 'vue'

const items = ref([])
const loading = ref(true)
const error = ref(null)
const active = ref(null)

async function loadGallery(){
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/data/gallery.json', { cache: 'no-store' })
    if (!res.ok) throw new Error(HTTP )
    const json = await res.json()
    if (!Array.isArray(json)) throw new Error('gallery JSON is not an array')
    items.value = json
    console.log('gallery loaded:', items.value) // debug
  } catch (err) {
    console.error('Failed to load gallery.json', err)
    error.value = err.message || String(err)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadGallery())

function openModal(item){
  active.value = item
}

function formatDate(d){
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}
</script>
