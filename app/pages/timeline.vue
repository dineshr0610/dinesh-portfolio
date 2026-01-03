<!-- app/pages/timeline.vue -->
<template>
  <section>
    <h2 class="text-2xl font-semibold">Timeline</h2>
    <p class="mt-2 text-slate-600">Life / career timeline will appear here.</p>

    <div class="mt-6">
      <div v-if="pending" class="py-8 text-center text-slate-500">Loading timeline…</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">Failed to load timeline: {{ error }}</div>

      <ul v-else class="mt-6 space-y-6">
        <li
          v-for="item in timeline"
          :key="item.id"
          class="bg-white p-4 rounded shadow overflow-hidden"
          :aria-labelledby="'tl-'+item.id"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <strong :id="'tl-'+item.id" class="block text-slate-800">{{ item.title }}</strong>
              <div v-if="item.subtitle" class="text-sm text-slate-500 mt-1">{{ item.subtitle }}</div>
            </div>

            <div class="text-sm text-slate-500 whitespace-nowrap">
              {{ formatDate(item.date) }}
            </div>
          </div>

          <p v-if="item.description" class="mt-3 text-slate-700" v-html="item.description"></p>

          <!-- media block -->
          <div class="mt-4">
            <!-- VIDEO: show poster with play overlay until user clicks to load video -->
            <template v-if="item.media && item.media.type === 'video'">
              <div class="relative rounded overflow-hidden bg-slate-100" style="max-width:920px;">
                <template v-if="playing[item.id]">
                  <video
                    class="w-full h-auto rounded"
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
                    :alt="item.title + ' poster'"
                    class="w-full object-cover rounded"
                    loading="lazy"
                    width="1024"
                    height="360"
                  />

                  <!-- play button overlay -->
                  <button
                    @click="play(item.id)"
                    class="absolute inset-0 flex items-center justify-center focus:outline-none"
                    :aria-label="`Play video for ${item.title}`"
                  >
                    <span
                      class="flex items-center justify-center w-16 h-16 rounded-full bg-black/60 text-white text-2xl"
                      aria-hidden="true"
                    >
                      ▶
                    </span>
                  </button>
                </template>
              </div>
            </template>

            <!-- IMAGE: directly show image -->
            <template v-else-if="item.media && item.media.type === 'image'">
              <img
                :src="item.media.src || item.image || placeholder"
                :alt="item.title"
                class="w-full object-cover rounded"
                loading="lazy"
              />
            </template>

            <!-- fallback: use item.image or placeholder -->
            <template v-else-if="item.image">
              <img
                :src="item.image || placeholder"
                :alt="item.title"
                class="w-full object-cover rounded"
                loading="lazy"
              />
            </template>

            <!-- nothing available -->
            <template v-else>
              <div class="text-sm text-slate-500">No media available</div>
            </template>
          </div>
        </li>

        <li v-if="timeline?.length === 0" class="text-center text-slate-500 py-12 bg-white rounded shadow">
          No timeline items yet — add entries to <code>/public/data/timeline.json</code>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
const { data: timeline, pending, error } = await useAsyncData(
  'public-timeline',
  async () => {
    const data = await $fetch('/api/public/timeline')
    return data
  }
)

// track which items are currently playing (video loaded)
const playing = reactive({})

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
  // flip playing state so template swaps in <video>
  playing[id] = true
  // optional: scroll video into view after it's injected
  requestAnimationFrame(() => {
    const el = document.querySelector(`[data-tl-id="${id}"] video`)
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
</script>

<style scoped>
/* keep layout tidy */
section { min-height: 60vh; }

/* play overlay styling handled inline with utility classes, but ensure pointer events on button */
.relative button { cursor: pointer; }

/* small responsive caps */
@media (min-width: 768px) {
  .timeline-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
}
</style>
