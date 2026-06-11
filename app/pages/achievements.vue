<script setup lang="ts">
import { marked } from 'marked'

interface Achievement {
  id: number | string
  title: string | null
  short: string | null
  long: string | null
  type: string | null
  achieved_at: string | null
  year: string | number | null
  image_url: string | null
  link_url: string | null
  tags: string[] | null
  media: {
    type: 'image' | 'video'
    src: string
    poster?: string
  } | null
}

const { data: achievements, pending, error } = await useFetch<Achievement[]>('/api/achievements')
const selectedAchievement = ref<Achievement | null>(null)

const safeAchievements = computed(() => {
  if (!Array.isArray(achievements.value)) return []
  return achievements.value.filter(Boolean)
})

function toSafeTime(value: string | null | undefined) {
  if (!value) return Number.NEGATIVE_INFINITY
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time
}

function toYear(item: Achievement) {
  const parsed = item.achieved_at ? new Date(item.achieved_at).getFullYear() : Number.NaN
  if (!Number.isNaN(parsed)) return parsed
  const fallback = Number.parseInt(String(item.year ?? ''), 10)
  if (!Number.isNaN(fallback)) return fallback
  return new Date().getFullYear()
}

const grouped = computed(() => {
  const map: Record<number, Achievement[]> = {}
  for (const item of safeAchievements.value) {
    const year = toYear(item)
    if (!map[year]) map[year] = []
    map[year].push(item)
  }
  return Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, items]) => ({
      year: Number(year),
      items: items.sort((a, b) => toSafeTime(b.achieved_at) - toSafeTime(a.achieved_at))
    }))
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (typeof error.value === 'string') return error.value
  return (error.value as { message?: string }).message || 'Unknown error'
})

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function toImageSrc(value: string | null | undefined) {
  return value || undefined
}

function getTypeIcon(type: string | null) {
  switch (type) {
    case 'certificate': return '📜'
    case 'award': return '🏆'
    case 'hackathon': return '💻'
    case 'competition': return '🥇'
    default: return '📌'
  }
}

function openAchievement(achievement: Achievement) {
  selectedAchievement.value = achievement
}

function closeAchievement() {
  selectedAchievement.value = null
}

function renderMarkdown(text: string | null | undefined) {
  return String(marked.parse(text || ''))
}

watch(selectedAchievement, (value) => {
  if (!import.meta.client) return
  document.body.style.overflow = value ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="min-h-screen bg-[#0b0f1a] px-4 py-16">
    <div class="mx-auto max-w-7xl">

      <!-- Page Header -->
      <div class="mb-16 animate-fade-in-up">
        <div class="inline-block px-3 py-1 bg-white/[0.03] text-slate-400 rounded-full text-sm font-semibold tracking-wide uppercase border border-white/[0.06] mb-4">
          Recognition
        </div>
        <h1 class="text-4xl font-black tracking-tight text-slate-100 md:text-5xl">Achievements</h1>
        <p class="mt-3 max-w-2xl text-lg text-slate-400 leading-relaxed">
          Milestones, hackathon wins, and certifications gained along the way.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-white/[0.08] border-t-indigo-500"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-2xl border border-red-500/20 bg-red-900/10 p-6 text-center">
        <p class="font-medium text-red-400">Failed to load achievements</p>
        <p class="mt-1 text-sm text-red-500">{{ errorMessage }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="safeAchievements.length === 0" class="py-20 text-center">
        <div class="mb-4 text-6xl">🎯</div>
        <h3 class="mb-2 text-2xl font-bold text-slate-100">No Achievements Yet</h3>
        <p class="text-slate-400">Achievements will appear here as you earn them.</p>
      </div>

      <!-- Grouped by Year -->
      <div v-else>
        <section
          v-for="section in grouped"
          :key="section.year"
          class="mb-16 animate-fade-in-up"
        >
          <!-- Year Header -->
          <div class="flex items-center gap-4 mb-8">
            <h2 class="text-2xl font-black text-slate-100">{{ section.year }}</h2>
            <div class="flex-1 h-px bg-white/[0.06]"></div>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="item in section.items"
              :key="item.id"
              class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:bg-white/[0.05] hover:-translate-y-1 hover:border-indigo-500/20"
              @click="openAchievement(item)"
            >
              <!-- Media -->
              <div class="relative aspect-video w-full overflow-hidden bg-black/30">
                <template v-if="item.media?.type === 'video' && item.media.src">
                  <video
                    :src="item.media.src"
                    :poster="item.media.poster"
                    class="h-full w-full object-cover"
                    preload="metadata"
                    muted
                    playsinline
                  />
                  <div class="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur border border-white/10">
                    ▶ Video
                  </div>
                </template>

                <img
                  v-else-if="item.media?.type === 'image' && item.media.src"
                  :src="item.media.src"
                  :alt="item.title || 'Achievement media'"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <img
                  v-else-if="item.image_url"
                  :src="toImageSrc(item.image_url)"
                  :alt="item.title || 'Achievement image'"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div v-else class="flex h-full w-full items-center justify-center text-5xl bg-white/[0.02]">
                  {{ getTypeIcon(item.type) }}
                </div>
              </div>

              <!-- Content -->
              <div class="flex flex-1 flex-col p-6">
                <div class="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {{ formatDate(item.achieved_at) }}
                </div>

                <h3 class="mb-2 line-clamp-2 text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {{ item.title || 'Untitled achievement' }}
                </h3>

                <p class="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
                  {{ item.short || 'No summary available.' }}
                </p>

                <div v-if="item.tags?.length" class="mb-4 flex flex-wrap gap-2">
                  <span
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="tag"
                    class="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-400 border border-white/[0.06]"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="item.tags.length > 3" class="px-2 py-1 text-xs text-slate-500">
                    +{{ item.tags.length - 3 }}
                  </span>
                </div>

                <div class="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  View details
                  <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="selectedAchievement"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        @click.self="closeAchievement"
      >
        <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0e1220] border border-white/[0.08] shadow-2xl">

          <!-- Modal Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0e1220]/95 backdrop-blur p-5">
            <h3 class="text-xl font-bold text-slate-100 pr-8">
              {{ selectedAchievement.title }}
            </h3>
            <button
              @click="closeAchievement"
              class="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.10] text-slate-400 hover:text-slate-100 transition-colors border border-white/[0.06]"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Full Media -->
          <div
            v-if="selectedAchievement.image_url || selectedAchievement.media?.src"
            class="bg-black/60"
          >
            <img
              v-if="selectedAchievement.media?.type !== 'video'"
              :src="toImageSrc(selectedAchievement.media?.src || selectedAchievement.image_url)"
              :alt="selectedAchievement.title || ''"
              class="max-h-[60vh] w-full object-contain"
            />
            <video
              v-else
              controls
              autoplay
              class="max-h-[60vh] w-full"
            >
              <source :src="selectedAchievement.media.src" />
            </video>
          </div>

          <!-- Content -->
          <div class="p-6">
            <p class="mb-4 text-sm text-slate-500">
              {{ formatDate(selectedAchievement.achieved_at) }}
            </p>
            <div
              class="prose prose-invert prose-sm max-w-none text-slate-300"
              v-html="renderMarkdown(selectedAchievement.long)"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up { animation: none; }
}
</style>