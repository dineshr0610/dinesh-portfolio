<script setup>
import StoryPlayer from '~/components/StoryPlayer.vue'
import { useCinematicAudio } from '~/composables/useCinematicAudio'

const { initAudio, playSfx } = useCinematicAudio()

const { data: timeline, pending, error } = await useAsyncData(
  'public-timeline',
  async () => {
    const data = await $fetch('/api/public/timeline')
    return data
  }
)

// Preload Audio on Mount
onMounted(() => {
    initAudio()
})

// Story Mode Logic
const showStory = ref(false)
const storyEvents = computed(() => {
    if (!timeline.value) return []
    // Create a copy and sort by date ascending (Oldest first) for the story
    return [...timeline.value].sort((a, b) => new Date(a.date) - new Date(b.date))
})

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

function openStory() {
    playSfx('ui') // Unlock Audio Context & Feedback
    showStory.value = true
}
</script>

<template>
  <section class="relative">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h2 class="text-2xl font-semibold">Timeline</h2>
            <p class="mt-2 text-slate-600">Life / career timeline.</p>
        </div>
        
        <button 
            @click="openStory"
            class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-300 font-medium group"
        >
            <span class="text-lg group-hover:animate-pulse">▶</span>
            <span>Play My Story</span>
        </button>
    </div>

    <!-- Story Player Component -->
    <!-- Story Player Component (Teleported to break out of stacking contexts) -->
    <Teleport to="body">
        <Transition name="fade">
            <StoryPlayer 
                v-if="showStory"
                :model-value="showStory" 
                :events="storyEvents" 
                @close="showStory = false" 
            />
        </Transition>
    </Teleport>

    <div class="mt-6">
      <div v-if="pending" class="py-8 text-center text-slate-500">Loading timeline…</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">Failed to load timeline: {{ error }}</div>
      
      <div v-else class="space-y-12">
        <section v-for="[year, items] in grouped" :key="year">
          <h2 class="text-2xl font-bold mb-6 text-slate-400 sticky top-20">{{ year }}</h2>
          
          <div class="space-y-8 pl-4 border-l-2 border-slate-100">
            <article
              v-for="item in items"
              :key="item.id"
              class="relative"
              :aria-labelledby="'tl-'+item.id"
            >
              <div class="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-slate-200 border-4 border-white"></div>
              
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div class="flex flex-col md:flex-row gap-6">
                  <!-- Content Side -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                      <div>
                        <strong :id="'tl-'+item.id" class="block text-lg font-bold text-slate-900 leading-tight">{{ item.title }}</strong>
                        <div v-if="item.subtitle" class="text-sm text-indigo-600 font-medium mt-1">{{ item.subtitle }}</div>
                      </div>
                      <div class="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap pt-1">
                        {{ formatDate(item.date) }}
                      </div>
                    </div>

                    <p v-if="item.description" class="text-slate-600 leading-relaxed text-sm mb-4" v-html="item.description"></p>
                  </div>

                  <!-- Media Side -->
                  <div v-if="item.media || item.image" class="w-full md:w-64 flex-shrink-0">
                     <!-- VIDEO -->
                    <template v-if="item.media && item.media.type === 'video'">
                      <div class="relative rounded-lg overflow-hidden bg-gray-900 shadow-sm aspect-video">
                        <template v-if="playing[item.id]">
                          <video
                            class="w-full h-full object-contain"
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
                            class="w-full h-full object-cover opacity-80"
                            loading="lazy"
                          />
                          <button
                            @click="play(item.id)"
                            class="absolute inset-0 flex items-center justify-center focus:outline-none group"
                            :aria-label="`Play video for ${item.title}`"
                          >
                            <span
                              class="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white text-xl backdrop-blur-md border border-white/30 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all shadow-lg"
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
                      <div class="rounded-lg overflow-hidden border border-slate-100 shadow-sm aspect-video md:aspect-[4/3] bg-slate-50 group cursor-zoom-in">
                          <img
                            :src="(item.media && item.media.src) || item.image || placeholder"
                            :alt="item.title"
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                      </div>
                    </template>
                  </div>
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

<style scoped>
/* keep layout tidy */
section { min-height: 60vh; }

/* play overlay styling handled inline with utility classes, but ensure pointer events on button */
.relative button { cursor: pointer; }

/* Transition Wrapper */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* small responsive caps */
@media (min-width: 768px) {
  .timeline-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
}
</style>
