<template>
<section class="min-h-screen py-10 md:py-14 bg-[#0b0f1a]">
    <div class="container mx-auto px-4 lg:px-8">

      <div class="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10 animate-fade-in-up gap-4 md:gap-6">
        <div class="text-center md:text-left">
          <h1 class="text-4xl md:text-5xl font-black text-slate-100 tracking-tight">Gallery</h1>
          <p class="mt-2 text-lg text-slate-300/95 max-w-2xl">
            A visual collection of highlights, prototypes, and moments.
          </p>
        </div>

        <button
          @click="openStory"
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500/[0.08] text-slate-100 border border-white/[0.06] backdrop-blur-sm shadow-[0_20px_80px_rgba(99,102,241,0.12)] hover:bg-indigo-500/[0.12] hover:scale-[1.02] transition-all duration-250 font-medium group"
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
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-indigo-500/70" />
      </div>

<div v-else-if="error" class="text-center py-12 text-slate-300/95 bg-white/[0.03] border border-white/[0.06] rounded-xl">
        Failed to load gallery: {{ error }}
      </div>

      <div v-else-if="items.length === 0" class="text-center py-20 text-slate-400">
        <div class="text-6xl mb-4">📷</div>
        <p>No photos yet.</p>
      </div>

      <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="tilt-card break-inside-avoid group cursor-pointer transform-gpu transition-all duration-400 hover:-translate-y-2 hover:rotate-[0.2deg] hover:scale-[1.01]"
          @click="openLightbox(item)"
        >
<div class="relative rounded-2xl overflow-hidden bg-white/[0.04] hover:shadow-xl transition-all duration-400 transform-gpu border border-white/10">
            <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-fuchsia-500/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            <img 
              :src="getThumbnail(item)" 
              loading="lazy"
              class="w-full h-auto object-cover transition-transform duration-600 group-hover:scale-[1.03]"
              :alt="item.title"
            />
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100 flex flex-col justify-end p-5 md:p-6">
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
          class="fixed inset-0 z-[100] overflow-y-auto bg-black/95 backdrop-blur-sm"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div class="min-h-full flex items-start lg:items-center justify-center p-3 md:p-6" @click.self="closeLightbox">
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

          <div class="relative w-full max-w-7xl lg:max-h-[92vh] min-h-0 pt-12 sm:pt-14">
            <div class="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] rounded-3xl lg:overflow-hidden border border-white/10 bg-white/5 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
              <div class="relative flex min-h-0 min-w-0 items-center justify-center bg-black/80 p-3 sm:p-5 lg:p-6 overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]"></div>
                <div class="relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.45)] transition-transform duration-400">
                  <div v-if="!activeMediaReady" class="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-pulse"></div>
                  <img 
                    v-if="active.type === 'image'" 
                    :src="active.src" 
                    class="max-w-full max-h-full w-auto h-auto rounded-xl object-contain transition-all duration-600"
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
                    class="max-w-full max-h-full w-auto h-auto rounded-xl object-contain transition-all duration-600"
                    @loadeddata="activeMediaReady = true"
                    :class="activeMediaReady ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-[1.02]'"
                  ></video>
                </div>
              </div>

              <aside class="flex min-h-0 flex-col border-t border-white/10 bg-slate-950/90 p-5 sm:p-6 lg:border-t-0 lg:border-l lg:p-7 text-white overflow-y-auto min-w-0">
                <div class="flex items-center justify-between gap-3">
                  <span class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-100/90">
                    {{ active.type }}
                  </span>

                  <div class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-100/90">
                    {{ activeIndex + 1 }} / {{ items.length }}
                  </div>

                </div>

                <div class="mt-5">
                  <h2 class="text-3xl sm:text-[2.1rem] font-black tracking-tight text-slate-100 leading-tight">
                    {{ active.title }}
                  </h2>
                  <p class="mt-4 text-sm sm:text-base leading-7 text-slate-300">
                    {{ active.description }}
                  </p>
                </div>

                <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Published</div>
                    <div class="mt-2 text-sm font-medium text-slate-100">
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
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Technologies / Tags</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span v-for="tag in active.tags" :key="tag" class="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100/90">#{{ tag }}</span>
                    </div>
                  </div>

                  <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 sm:col-span-2 lg:col-span-1">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Story</div>
                    <p class="mt-2 text-sm leading-7 text-slate-300">
                      {{ getStory(active) }}
                    </p>
                  </div>
                </div>


              </aside>

              <!-- Cinematic fixed overlay navigation (always visible above media) -->
              <div class="pointer-events-none fixed inset-0 z-[205]">
                <button
                  @click="prevItem"
                  class="pointer-events-auto fixed left-3 top-1/2 -translate-y-1/2 z-[206] flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.55)] hover:bg-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500/40 transition"
                  aria-label="Previous gallery item"
                >
                  <span class="text-xl leading-none" aria-hidden="true">←</span>
                </button>

                <button
                  @click="nextItem"
                  class="pointer-events-auto fixed right-3 top-1/2 -translate-y-1/2 z-[206] flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.55)] hover:bg-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500/40 transition"
                  aria-label="Next gallery item"
                >
                  <span class="text-xl leading-none" aria-hidden="true">→</span>
                </button>
              </div>



            </div>
          </div>
          </div><!-- /inner center wrapper -->
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