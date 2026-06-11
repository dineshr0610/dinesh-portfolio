<template>
  <section class="min-h-screen py-16 bg-[#0b0f1a] text-ctext">
    <div class="container mx-auto px-4 lg:px-8 max-w-3xl">

      <!-- Page Header -->
      <div class="mb-12 animate-fade-in-up">
        <div class="inline-block px-3 py-1 bg-white/[0.03] text-slate-400 rounded-full text-sm font-semibold tracking-wide uppercase border border-white/[0.06] mb-4">
          Live Feed
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-100 leading-tight">Dinesh Now</h1>
        <p class="mt-3 text-slate-400 text-lg">
          Daily / weekly updates — what I'm working on right now.
        </p>
      </div>

      <div class="space-y-5">
        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-white/[0.08] border-t-indigo-500"></div>
        </div>
        <div v-else-if="error" class="text-center py-12 text-red-400 bg-red-900/10 border border-red-500/20 rounded-xl">
          Failed to load updates: {{ error }}
        </div>
        <div v-else-if="updates.length === 0" class="text-center py-20 text-slate-500">
          <div class="text-5xl mb-4">📭</div>
          <p>No updates yet.</p>
        </div>

        <article
          v-for="u in updates"
          :key="u.id"
          class="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 hover:bg-white/[0.05] transition-colors animate-fade-in-up"
          role="article"
          :aria-labelledby="`upd-${u.id}-title`"
        >
          <div class="flex flex-col md:flex-row gap-5">
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-3 mb-3">
                <h2 :id="`upd-${u.id}-title`" class="font-bold text-lg text-slate-100 leading-snug">{{ u.title }}</h2>
                <time class="text-xs text-slate-500 whitespace-nowrap font-medium">{{ formatDate(u.date) }}</time>
              </div>

              <div v-if="u.short" class="text-slate-300 text-sm leading-relaxed" v-html="u.short"></div>
              <div v-else-if="u.body" class="text-slate-300 text-sm leading-relaxed" v-html="u.body"></div>

              <div v-if="u.tags?.length" class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="t in u.tags"
                  :key="t"
                  class="inline-block px-2.5 py-1 bg-white/[0.04] rounded-full text-xs text-slate-400 border border-white/[0.06]"
                >
                  #{{ t }}
                </span>
              </div>
            </div>

            <!-- media column -->
            <div v-if="u.media?.type === 'video' || u.image" class="w-full md:w-48 flex-shrink-0">
              <div v-if="u.media?.type === 'video'" class="aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/[0.06]">
                <video
                  :src="u.media.src"
                  :poster="u.media.poster"
                  controls
                  preload="metadata"
                  class="w-full h-full object-cover"
                >
                  Your browser does not support video.
                </video>
              </div>

              <div v-else-if="u.image" class="aspect-video overflow-hidden rounded-xl border border-white/[0.06]">
                <img :src="u.image" :alt="u.title" class="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </article>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type UpdateItem = {
  id: string
  title: string
  date?: string
  published_at?: string
  short?: string
  body?: string
  image?: string
  media?: { type: 'video' | 'audio'; src: string; poster?: string } | null
  tags?: string[]
}

const { data: updatesData, pending: loading, error: fetchError } = await useAsyncData(
  'public-updates',
  async () => {
    const data = await $fetch('/api/public/updates') as any[]
    return (data || []).map(item => ({
      ...item,
      date: item.published_at
    }))
  }
)

const updates = computed(() => Array.isArray(updatesData.value) ? updatesData.value : [])
const error = computed(() => fetchError.value?.message || null)

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
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}
</style>