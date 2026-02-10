<!-- app/pages/timeline.vue -->
<template>
  <section>
    <h2 class="text-2xl font-semibold">Timeline</h2>
    <p class="mt-2 text-slate-600">Life / career timeline will appear here.</p>

    <div class="mt-6">
      <div v-if="pending" class="py-8 text-center text-slate-500">Loading timeline…</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">Failed to load timeline: {{ error }}</div>
      
      <div v-else class="space-y-12">
        <section v-for="[year, items] in grouped" :key="year">
          <h2 class="text-2xl font-bold mb-6 text-slate-400 stick top-20">{{ year }}</h2>
          
          <div class="space-y-8 pl-4 border-l-2 border-slate-100">
            <article
              v-for="item in items"
              :key="item.id"
              class="relative"
              :aria-labelledby="'tl-'+item.id"
            >
              <div class="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-slate-200 border-4 border-white"></div>
              
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                  <div>
                    <strong :id="'tl-'+item.id" class="block text-lg text-slate-900">{{ item.title }}</strong>
                    <div v-if="item.subtitle" class="text-sm text-indigo-600 font-medium mt-0.5">{{ item.subtitle }}</div>
                  </div>
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {{ formatDate(item.date) }}
                  </div>
                </div>

                <p v-if="item.description" class="text-slate-600 leading-relaxed" v-html="item.description"></p>

                <!-- media block -->
                <div class="mt-6" v-if="item.media || item.image">
                  <!-- VIDEO -->
                  <template v-if="item.media && item.media.type === 'video'">
                    <div class="relative rounded-xl overflow-hidden bg-slate-100 shadow-inner" style="max-width:100%;">
                      <template v-if="playing[item.id]">
                        <video
                          class="w-full h-auto rounded-xl"
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
                          class="w-full object-cover"
                          loading="lazy"
                        />
                        <button
                          @click="play(item.id)"
                          class="absolute inset-0 flex items-center justify-center focus:outline-none group"
                          :aria-label="`Play video for ${item.title}`"
                        >
                          <span
                            class="flex items-center justify-center w-16 h-16 rounded-full bg-black/50 text-white text-2xl group-hover:bg-indigo-600/90 transition-all backdrop-blur-sm"
                            aria-hidden="true"
                          >
                            ▶
                          </span>
                        </button>
                      </template>
                    </div>
                  </template>

                  <!-- IMAGE / FALLBACK -->
                  <template v-else>
                    <img
                      :src="(item.media && item.media.src) || item.image || placeholder"
                      :alt="item.title"
                      class="w-full object-cover rounded-xl shadow-sm"
                      loading="lazy"
                    />
                  </template>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div v-if="grouped.length === 0" class="text-center text-slate-500 py-12">
          No timeline items yet
        </div>
      </div>
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

function groupByYear(items) {
  if (!items) return []
  const map = {}

  for (const item of items) {
    const year = new Date(item.date).getFullYear()
    if (!map[year]) map[year] = []
    map[year].push(item)
  }

  return Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0])) // newest year first
}

const grouped = computed(() => groupByYear(timeline.value))

function formatDate(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
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
