<script setup lang="ts">
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

function getTypeIcon(type: string | null) {
  switch (type) {
    case 'certificate':
      return '📜'
    case 'award':
      return '🏆'
    case 'hackathon':
      return '💻'
    case 'competition':
      return '🥇'
    default:
      return '📌'
  }
}

function openAchievement(achievement: Achievement) {
  selectedAchievement.value = achievement
}

function closeAchievement() {
  selectedAchievement.value = null
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
  <section class="min-h-screen bg-slate-50 px-4 py-16">
    <div class="mx-auto max-w-7xl">
      <div class="mb-16 text-center animate-fade-in-up">
        <h1 class="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Achievements</h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Milestones, hackathon wins, and certifications gained along the way.
        </p>
      </div>

      <div v-if="pending" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-indigo-100">
            <svg class="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
          <p class="font-medium text-slate-600">Loading achievements...</p>
        </div>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="font-medium text-red-700">Failed to load achievements</p>
        <p class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <div v-else-if="safeAchievements.length === 0" class="py-20 text-center">
        <div class="mb-4 text-6xl">🎯</div>
        <h3 class="mb-2 text-2xl font-bold text-slate-900">No Achievements Yet</h3>
        <p class="text-slate-600">Achievements will appear here as you earn them.</p>
      </div>

      <div v-else>
        <section
          v-for="section in grouped"
          :key="section.year"
          class="mb-16 animate-fade-in-up"
        >
          <h2 class="mb-8 flex items-center gap-3 text-3xl font-bold text-slate-800">
            <span class="opacity-30">#</span> {{ section.year }}
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="item in section.items"
              :key="item.id"
              class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              @click="openAchievement(item)"
            >
              <div class="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                <template v-if="item.media?.type === 'video' && item.media.src">
                  <video
                    :src="item.media.src"
                    :poster="item.media.poster"
                    class="h-full w-full object-cover"
                    preload="metadata"
                    muted
                    playsinline
                  />
                  <div class="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-bold backdrop-blur">
                    ▶ Video
                  </div>
                </template>

                <img
                  v-else-if="item.media?.type === 'image' && item.media.src"
                  :src="item.media.src"
                  :alt="item.title || 'Achievement media'"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <img
                  v-else-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.title || 'Achievement image'"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div v-else class="flex h-full w-full items-center justify-center text-5xl">
                  {{ getTypeIcon(item.type) }}
                </div>
              </div>

              <div class="flex flex-1 flex-col p-6">
                <div class="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {{ formatDate(item.achieved_at) }}
                </div>

                <h3 class="mb-2 line-clamp-2 text-lg font-bold text-slate-900">
                  {{ item.title || 'Untitled achievement' }}
                </h3>

                <p class="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {{ item.short || 'No summary available.' }}
                </p>

                <div v-if="item.tags?.length" class="mb-4 flex flex-wrap gap-2">
                  <span
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="tag"
                    class="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="item.tags.length > 3" class="px-2 py-1 text-xs text-slate-400">
                    +{{ item.tags.length - 3 }}
                  </span>
                </div>

                <button
                  type="button"
                  class="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  View full details
                  <span class="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="selectedAchievement"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="closeAchievement"
      >
        <div class="w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl max-h-[90vh]">
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-5 backdrop-blur">
            <h3 class="pr-4 text-xl font-bold text-slate-900">
              {{ selectedAchievement.title || 'Untitled achievement' }}
            </h3>
            <button
              type="button"
              class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
              @click="closeAchievement"
            >
              ✕
            </button>
          </div>

          <div class="p-6">
            <div class="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
              <template v-if="selectedAchievement.media?.type === 'video' && selectedAchievement.media.src">
                <video
                  :src="selectedAchievement.media.src"
                  :poster="selectedAchievement.media.poster"
                  class="h-full w-full object-cover"
                  controls
                  preload="metadata"
                />
              </template>
              <img
                v-else-if="selectedAchievement.media?.type === 'image' && selectedAchievement.media.src"
                :src="selectedAchievement.media.src"
                :alt="selectedAchievement.title || 'Achievement media'"
                class="h-full w-full object-cover"
              />
              <img
                v-else-if="selectedAchievement.image_url"
                :src="selectedAchievement.image_url"
                :alt="selectedAchievement.title || 'Achievement image'"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-6xl">
                {{ getTypeIcon(selectedAchievement.type) }}
              </div>
            </div>

            <div class="mb-4 text-xs font-bold uppercase tracking-wider text-indigo-600">
              {{ formatDate(selectedAchievement.achieved_at) }}
            </div>

            <p class="mb-4 text-sm leading-relaxed text-slate-600">
              {{ selectedAchievement.short || 'No summary available.' }}
            </p>

            <div v-if="selectedAchievement.long" class="prose prose-lg max-w-none">
              <div v-html="selectedAchievement.long"></div>
            </div>
            <p v-else class="text-slate-700">
              Detailed notes are not available for this achievement yet.
            </p>

            <div v-if="selectedAchievement.tags?.length" class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in selectedAchievement.tags"
                :key="tag"
                class="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
              >
                #{{ tag }}
              </span>
            </div>

            <div v-if="selectedAchievement.link_url" class="mt-6">
              <a
                :href="selectedAchievement.link_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Open external link
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  .animate-fade-in-up {
    animation: none;
  }
}
</style>
