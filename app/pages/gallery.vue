<template>
  <section class="min-h-screen py-12 bg-slate-50">
    <div class="container mx-auto px-4 lg:px-8">
      
      <div class="flex flex-col md:flex-row items-center justify-between mb-12 animate-fade-in-up gap-6">
        <div class="text-center md:text-left">
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Gallery</h1>
            <p class="mt-2 text-lg text-slate-600 max-w-2xl">
            A visual collection of highlights, prototypes, and moments.
            </p>
        </div>

        <button 
            @click="openStory"
            class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-300 font-medium group"
        >
            <span class="text-lg group-hover:animate-pulse">▶</span>
            <span>Watch Gallery</span>
        </button>
      </div>

      <Teleport to="body">
        <Transition name="fade">
            <StoryPlayer 
                v-if="showStory"
                :model-value="showStory" 
                :events="storyEvents" 
                audio-mode="gallery"
                @close="showStory = false" 
            />
        </Transition>
      </Teleport>

      <div v-if="loading" class="flex justify-center py-20">
         <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-600 bg-red-50 rounded-lg">
        Failed to load gallery: {{ error }}
      </div>

      <div v-else-if="items.length === 0" class="text-center py-20 text-slate-400">
        <div class="text-6xl mb-4">📷</div>
        <p>No photos yet.</p>
      </div>

      <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="tilt-card break-inside-avoid group cursor-pointer transform-gpu transition-all duration-500 hover:-translate-y-3 hover:rotate-[0.3deg] hover:scale-[1.02]"
          @click="openLightbox(item)"
        >
          <div class="relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 transform-gpu border border-white/60">
            <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-fuchsia-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

            <img 
              :src="getThumbnail(item)" 
              loading="lazy"
              class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              :alt="item.title"
            />
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
              <span v-if="item.type === 'video'" class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                 ▶ Video
              </span>
              <div class="text-white/60 text-xs font-medium mb-1" v-if="item.date">
                {{ new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </div>
              <h3 class="text-white font-bold text-lg leading-tight">{{ item.title }}</h3>
              <p class="text-slate-300 text-sm mt-1 line-clamp-2" v-if="item.description">{{ item.description }}</p>
              <div class="mt-4 inline-flex max-w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                AI Insight:
                <span class="normal-case tracking-normal text-white/90">{{ getInsight(item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Transition name="fade">
        <div 
          v-if="active" 
          class="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-sm p-4 md:p-8"
          @click.self="closeLightbox"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <div class="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl animate-pulse"></div>
            <div class="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse [animation-delay:900ms]"></div>
            <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"></div>
          </div>

          <div class="fixed right-4 top-4 z-[101] flex flex-col items-end gap-2 sm:right-6 sm:top-6">
            <button 
              @click="closeLightbox"
              class="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:bg-white/15 hover:text-white"
              aria-label="Close gallery item"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55 backdrop-blur-xl">
              ESC
            </div>
          </div>

          <div class="relative w-full max-w-7xl h-full max-h-[86vh] transform-gpu perspective-[2000px] pt-14 sm:pt-16">
            <div class="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_360px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
              <div class="relative flex items-center justify-center bg-black/80 p-3 sm:p-5 lg:p-6">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]"></div>
                <div class="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:scale-[1.02] hover:rotate-[0.2deg]">
                  <div v-if="!activeMediaReady" class="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-pulse"></div>
                  <img 
                    v-if="active.type === 'image'" 
                    :src="active.src" 
                    class="max-h-[76vh] w-full rounded-xl object-contain transition-all duration-700"
                    :alt="active.title"
                    @load="activeMediaReady = true"
                    :class="activeMediaReady ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-[1.02]'"
                  />
                  <video 
                    v-else 
                    :src="active.src" 
                    :poster="active.poster" 
                    controls 
                    autoplay
                    class="max-h-[76vh] w-full rounded-xl object-contain transition-all duration-700"
                    @loadeddata="activeMediaReady = true"
                    :class="activeMediaReady ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-[1.02]'"
                  ></video>
                </div>
              </div>

              <aside class="flex min-h-0 flex-col border-t border-white/10 bg-slate-950/75 p-5 sm:p-6 lg:border-t-0 lg:border-l lg:p-7 text-white overflow-y-auto">
                <div class="flex items-center justify-between gap-3">
                  <span class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    {{ active.type }}
                  </span>

                  <div class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    {{ activeIndex + 1 }} / {{ items.length }}
                  </div>

                </div>

                <div class="mt-5">
                  <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {{ active.title }}
                  </h2>
                  <p class="mt-4 text-sm sm:text-base leading-7 text-slate-300">
                    {{ active.description }}
                  </p>
                </div>

                <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Published</div>
                    <div class="mt-2 text-sm font-medium text-white">
                      {{
                        active.date
                          ? new Date(active.date).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Unknown'
                      }}
                    </div>
                  </div>

                  <div v-if="active.tags && active.tags.length" class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Technologies / Tags</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span v-for="tag in active.tags" :key="tag" class="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">#{{ tag }}</span>
                    </div>
                  </div>

                  <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 sm:col-span-2 lg:col-span-1">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Story</div>
                    <p class="mt-2 text-sm leading-7 text-slate-300">
                      {{ getStory(active) }}
                    </p>
                  </div>
                </div>

                <div class="mt-6 flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    @click="prevItem"
                    class="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <span aria-hidden="true">←</span>
                    Previous
                  </button>
                  <button
                    @click="nextItem"
                    class="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Next
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import VanillaTilt from 'vanilla-tilt'
import StoryPlayer from '~/components/StoryPlayer.vue'
import { useCinematicAudio } from '~/composables/useCinematicAudio'

const { initAudio, playSfx } = useCinematicAudio()

// Fetch Data
const { data: itemsData, pending: loading, error: fetchError } = await useAsyncData('public-gallery', () => $fetch('/api/public/gallery'))

const items = computed(() => Array.isArray(itemsData.value) ? itemsData.value : [])
const error = computed(() => fetchError.value?.message || null)

// 🎬 Story Mode Logic
const showStory = ref(false)

const storyEvents = computed(() => {
    if (!items.value) return []
    
    // Sort chronological (Oldest -> Newest) so the story builds up
    const sorted = [...items.value].sort((a, b) => new Date(a.date) - new Date(b.date))

    return sorted.map(item => ({
        // Map API fields to Story Props
        date: new Date(item.date).getFullYear().toString(), 
        title: item.title,
        description: item.description || item.short || '', 
        
        // Visuals
        image: item.type === 'video' ? item.poster : item.src,
        media: item.type === 'video' ? { type: 'video', src: item.src, poster: item.poster } : { type: 'image', src: item.src }
    }))
})

function openStory() {
    playSfx('ui') // Unlock Audio Context
    showStory.value = true
}

// ---------------------------------------------------------
// Lightbox Logic
// ---------------------------------------------------------
const active = ref(null)
const activeMediaReady = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)

const activeIndex = computed(() => {
  if (!active.value) return -1
  return items.value.findIndex(item => item.id === active.value.id)
})

function getThumbnail(item) {
    if (item.type === 'image') return item.src
    return item.poster || item.src 
}

function getInsight(item) {
  if (!item) return 'A memory node from the portfolio journey.'

  const title = String(item.title || 'this moment').toLowerCase()
  if (item.type === 'video') return `A moving chapter around ${title}.`
  if (item.description) return item.description.split('.')[0].slice(0, 88)
  return `A visual memory node for ${title}.`
}

function getStory(item) {
  if (!item) {
    return 'This moment captures an important milestone in Dinesh’s creative and technical journey.'
  }

  if (item.story) return item.story

  const year = item.date ? new Date(item.date).getFullYear() : null
  const title = item.title || 'this moment'

  if (item.description) {
    return `${item.description} This chapter reflects how ${title.toLowerCase()} helped shape the portfolio story${year ? ` in ${year}` : ''}.`
  }

  return `This moment captures an important milestone in Dinesh’s creative and technical journey${year ? ` in ${year}` : ''}.`
}

function preloadImage(src) {
  if (!src) return
  const image = new Image()
  image.src = src
}

function openLightbox(item) {
  active.value = item
  activeMediaReady.value = false
  const currentIndex = items.value.findIndex(candidate => candidate.id === item.id)
  const next = items.value[(currentIndex + 1) % items.value.length]
  const prev = items.value[(currentIndex - 1 + items.value.length) % items.value.length]

  preloadImage(next?.src || next?.poster)
  preloadImage(prev?.src || prev?.poster)
  document.body.style.overflow = 'hidden' 
}

function closeLightbox() {
  active.value = null
  activeMediaReady.value = false
  document.body.style.overflow = ''
}

function nextItem() {
  if (!items.value.length || activeIndex.value < 0) return
  const next = items.value[(activeIndex.value + 1) % items.value.length]
  openLightbox(next)
}

function prevItem() {
  if (!items.value.length || activeIndex.value < 0) return
  const prev = items.value[(activeIndex.value - 1 + items.value.length) % items.value.length]
  openLightbox(prev)
}

function onTouchStart(event) {
  touchStartX.value = event.changedTouches?.[0]?.clientX ?? 0
}

function onTouchEnd(event) {
  touchEndX.value = event.changedTouches?.[0]?.clientX ?? 0
  const delta = touchEndX.value - touchStartX.value
  if (Math.abs(delta) < 50) return
  if (delta < 0) nextItem()
  else prevItem()
}

// Initialize
onMounted(() => {
    initAudio()
    VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
      max: 6,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      scale: 1.02
    })
    window.addEventListener('keydown', (e) => {
        if (!active.value && !showStory.value) return

        if (e.key === 'Escape') {
          closeLightbox()
          showStory.value = false
        }

        if (e.key === 'ArrowRight') {
          nextItem()
        }

        if (e.key === 'ArrowLeft') {
          prevItem()
        }
    })
})
</script>

<style scoped>
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.92) rotateX(-4deg) translateY(20px);
  filter: blur(12px);
}

.fade-leave-to {
  transform: scale(0.96);
}

/* Animations */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
}
</style>