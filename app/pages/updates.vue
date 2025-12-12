<template>
  <section class="prose mx-auto py-8">
    <h1>Dinesh Now</h1>
    <p class="text-slate-600">This feed shows daily / weekly updates. Admin can post updates by editing <code>/data/updates.json</code>.</p>

    <div class="mt-6 space-y-6">
      <div v-if="loading" class="text-center text-slate-500 py-8">Loading updates…</div>
      <div v-else-if="error" class="text-center text-red-600 py-8">Failed to load updates: {{ error }}</div>
      <div v-else-if="updates.length === 0" class="text-center text-slate-500 py-8">No updates yet — add items to <code>/data/updates.json</code>.</div>

      <article
        v-for="u in sorted"
        :key="u.id"
        class="bg-white rounded-lg shadow p-4"
        role="article"
        :aria-labelledby="`upd-${u.id}-title`"
      >
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="flex items-baseline justify-between">
              <h2 :id="`upd-${u.id}-title`" class="font-semibold text-lg">{{ u.title }}</h2>
              <time class="text-sm text-slate-500">{{ formatDate(u.date) }}</time>
            </div>

            <p v-if="u.short" class="mt-2 text-slate-700" v-html="u.short"></p>
            <div v-else-if="u.body" class="mt-2 text-slate-700" v-html="u.body"></div>

            <div v-if="u.tags?.length" class="mt-3 text-xs text-slate-500">
              <span v-for="t in u.tags" :key="t" class="inline-block mr-2 px-2 py-0.5 bg-slate-100 rounded">{{ t }}</span>
            </div>
          </div>

          <!-- media column -->
          <div class="w-full md:w-44 flex-shrink-0">
            <div v-if="u.media?.type === 'video'" class="aspect-video bg-slate-100 rounded overflow-hidden">
              <video
                :src="u.media.src"
                :poster="u.media.poster"
                controls
                preload="metadata"
                class="w-full h-full object-cover"
              >
                Sorry, your browser doesn't support embedded videos.
              </video>
            </div>

            <div v-else-if="u.image" class="h-28 md:h-24 w-full overflow-hidden rounded">
              <img :src="u.image" :alt="u.title" class="w-full h-full object-cover" loading="lazy" />
            </div>

            <div v-else class="h-28 md:h-24 w-full rounded bg-slate-50 flex items-center justify-center text-slate-400">
              No media
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type UpdateItem = {
  id: string
  title: string
  date?: string
  short?: string
  body?: string
  image?: string
  media?: { type: 'video' | 'audio'; src: string; poster?: string } | null
  tags?: string[]
}

const updates = ref<UpdateItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

function formatDate(d?: string) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

const sorted = computed(() => {
  return [...updates.value].sort((a, b) => {
    const da = a.date ? +new Date(a.date) : 0
    const db = b.date ? +new Date(b.date) : 0
    return db - da
  })
})

async function loadUpdates() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/data/updates.json', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json)) throw new Error('updates.json is not an array')
    updates.value = json
  } catch (err: any) {
    console.error('loadUpdates error', err)
    error.value = err?.message ?? String(err)
    updates.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUpdates()
})
</script>

<style scoped>
/* keep small spacing tweaks */
</style>
