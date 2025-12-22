<!-- app/pages/achievements.vue -->
<template>
  <section>
    <h1 class="text-3xl font-bold">Achievements</h1>
    <p class="mt-2 text-slate-600">Certifications, awards and hackathons are listed below.</p>

    <div class="mt-6">
      <div v-if="loading" class="py-8 text-center text-slate-500">Loading achievements…</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">Failed to load achievements: {{ error }}</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-lg shadow overflow-hidden"
          :aria-labelledby="'ach-'+item.id"
        >
          <!-- media block -->
          <div class="relative bg-slate-100" style="min-height:160px;">
            <!-- video -->
            <template v-if="item.media && item.media.type === 'video'">
              <template v-if="playing[item.id]">
                <video
                  class="w-full h-auto block"
                  controls
                  :poster="item.media.poster || item.image || placeholder"
                  preload="metadata"
                >
                  <source :src="item.media.src" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </template>

              <template v-else>
                <img
                  :src="item.media.poster || item.image || placeholder"
                  :alt="item.title"
                  class="w-full h-40 object-cover"
                  loading="lazy"
                />
                <button
                  @click="play(item.id)"
                  class="absolute inset-0 flex items-center justify-center focus:outline-none"
                  :aria-label="`Play video for ${item.title}`"
                >
                  <span class="flex items-center justify-center w-14 h-14 rounded-full bg-black/60 text-white text-2xl">▶</span>
                </button>
              </template>
            </template>

            <!-- image -->
            <template v-else-if="item.media && item.media.type === 'image'">
              <img
                :src="item.media.src || item.image || placeholder"
                :alt="item.title"
                class="w-full h-40 object-cover"
                loading="lazy"
              />
            </template>

            <!-- fallback image -->
            <template v-else>
              <img
                :src="item.image || placeholder"
                :alt="item.title"
                class="w-full h-40 object-cover"
                loading="lazy"
              />
            </template>
          </div>

          <!-- content -->
          <div class="p-4">
            <h3 :id="'ach-'+item.id" class="font-semibold text-lg">{{ item.title }}</h3>
            <div class="text-sm text-slate-500 mt-1">{{ formatDate(item.date) }}</div>

            <p v-if="item.short" class="mt-2 text-slate-700">{{ item.short }}</p>
            <div v-if="item.long" class="mt-2 text-slate-700 prose" v-html="item.long"></div>

            <div class="mt-4 flex items-center justify-between gap-3">
              <div class="text-xs text-slate-600 flex flex-wrap gap-2">
                <span v-for="t in (item.tags || [])" :key="t" class="px-2 py-1 bg-slate-100 rounded">{{ t }}</span>
              </div>

              <div class="text-right">
                <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="text-sm underline">View</a>
              </div>
            </div>
          </div>
        </article>

        <div v-if="items.length === 0" class="col-span-full text-center text-slate-500 py-12 bg-white rounded shadow">
          No achievements found — add entries to <code>/public/data/achievements.json</code>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const playing = reactive({})
const placeholder = '/gallery/placeholder.svg'

const { data: itemsData, pending: loading, error: fetchError } = await useFetch('/data/achievements.json')
const items = computed(() => Array.isArray(itemsData.value) ? itemsData.value : [])
const error = computed(() => fetchError.value?.message || null)

function formatDate(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

function play(id) {
  playing[id] = true
  // optional: scroll video into view
  requestAnimationFrame(() => {
    const el = document.querySelector(`[data-ach-id="${id}"] video`)
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
</script>

<style scoped>
/* small layout niceties */
section { min-height: 60vh; }
.prose { max-width: none; }

/* ensure play overlay is clickable */
.relative button { cursor: pointer; }

/* maintain consistent card heights on grid */
@media (min-width: 1024px) {
  article { display: flex; flex-direction: column; height: 100%; }
  article > .p-4 { flex: 1; }
}
</style>
