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

onMounted(() => {
  initAudio()
})

const showStory = ref(false)
const storyEvents = computed(() => {
  if (!timeline.value) return []
  return [...timeline.value].sort((a, b) => new Date(a.date) - new Date(b.date))
})

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
    .sort((a, b) => Number(b[0]) - Number(a[0]))
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
  playing[id] = true
  requestAnimationFrame(() => {
    const el = document.querySelector(`[data-tl-id="${id}"] video`)
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function openStory() {
  playSfx('ui')
  showStory.value = true
}
</script>

<template>
<section class="min-h-screen py-16 bg-[#0b0f1a] text-ctext">
  <div class="container mx-auto px-4 lg:px-8 max-w-4xl">

    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-up">
      <div>
        <div class="inline-block px-3 py-1 bg-white/[0.03] text-slate-400 rounded-full text-sm font-semibold tracking-wide uppercase border border-white/[0.06] mb-4">
          Journey
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-100 leading-tight">Timeline</h1>
        <p class="mt-2 text-slate-400 text-lg">Life and career, chapter by chapter.</p>
      </div>

      <button
        @click="openStory"
        class="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500/[0.10] text-slate-100 border border-indigo-500/20 hover:bg-indigo-500/[0.16] hover:scale-[1.02] transition-all duration-200 font-medium group flex-shrink-0"
      >
        <span class="text-lg group-hover:animate-pulse">▶</span>
        <span>Play My Story</span>
      </button>
    </div>

    <!-- Story Player -->
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

    <!-- Content -->
    <div>
      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-white/[0.08] border-t-indigo-500"></div>
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-400 bg-red-900/10 border border-red-500/20 rounded-xl">
        Failed to load timeline: {{ error }}
      </div>

      <div v-else class="space-y-14">
        <section v-for="[year, items] in grouped" :key="year">
          <!-- Year heading -->
          <div class="flex items-center gap-4 mb-8 sticky top-20 z-10">
            <span class="text-2xl font-black text-slate-100">{{ year }}</span>
            <div class="flex-1 h-px bg-white/[0.06]"></div>
          </div>

          <div class="space-y-6 pl-5 border-l border-white/[0.08]">
            <article
              v-for="item in items"
              :key="item.id"
              class="relative animate-fade-in-up"
              :aria-labelledby="'tl-'+item.id"
              :data-tl-id="item.id"
            >
              <!-- Timeline dot -->
              <div class="absolute -left-[25px] top-5 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-[#0b0f1a]"></div>

              <div class="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 hover:bg-white/[0.05] transition-colors">
                <div class="flex flex-col md:flex-row gap-6">
                  <!-- Content Side -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                      <div>
                        <strong :id="'tl-'+item.id" class="block text-lg font-bold text-slate-100 leading-tight">{{ item.title }}</strong>
                        <div v-if="item.subtitle" class="text-sm text-indigo-400 font-medium mt-1">{{ item.subtitle }}</div>
                      </div>
                      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap pt-1">
                        {{ formatDate(item.date) }}
                      </div>
                    </div>

                    <p v-if="item.description" class="text-slate-300 leading-relaxed text-sm" v-html="item.description"></p>
                  </div>

                  <!-- Media Side -->
                  <div v-if="item.media || item.image" class="w-full md:w-64 flex-shrink-0">
                    <!-- VIDEO -->
                    <template v-if="item.media && item.media.type === 'video'">
                      <div class="relative rounded-xl overflow-hidden bg-black/60 border border-white/[0.06] aspect-video">
                        <template v-if="playing[item.id]">
                          <video
                            class="w-full h-full object-contain"
                            controls
                            :poster="item.media.poster || item.image"
                            preload="metadata"
                          >
                            <source :src="item.media.src" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </template>
                        <template v-else>
                          <img
                            :src="item.media.poster || item.image"
                            :alt="item.title + ' poster'"
                            class="w-full h-full object-cover opacity-70"
                            loading="lazy"
                          />
                          <button
                            @click="play(item.id)"
                            class="absolute inset-0 flex items-center justify-center focus:outline-none group"
                            :aria-label="`Play video for ${item.title}`"
                          >
                            <span class="flex items-center justify-center w-12 h-12 rounded-full bg-white/15 text-white text-xl backdrop-blur-md border border-white/20 group-hover:bg-indigo-600/80 group-hover:border-indigo-500 transition-all shadow-lg">
                              ▶
                            </span>
                          </button>
                        </template>
                      </div>
                    </template>

                    <!-- IMAGE -->
                    <template v-else>
                      <div class="rounded-xl overflow-hidden border border-white/[0.06] aspect-video bg-black/30 group cursor-zoom-in">
                        <img
                          :src="(item.media && item.media.src) || item.image"
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

        <div v-if="grouped.length === 0" class="text-center text-slate-500 py-20">
          <div class="text-5xl mb-4">📅</div>
          <p>No timeline items yet.</p>
        </div>
      </div>
    </div>

  </div>
</section>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>