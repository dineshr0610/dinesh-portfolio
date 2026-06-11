<!-- components/ProjectsSection.vue -->
<template>
  <section ref="sectionRef">
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <article
        v-for="p in shown"
        :key="p.id"
        class="project-card group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05] hover:border-indigo-500/20"
      >
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

        <div class="h-36 overflow-hidden rounded-xl mb-4">
          <img
            v-if="p.image"
            :src="p.image"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            alt=""
          />
          <div v-else class="w-full h-full bg-white/[0.03] flex items-center justify-center text-slate-600 text-3xl">🖼️</div>
        </div>

        <div class="relative z-10 flex items-start justify-between mb-1">
          <h3 class="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors flex-1 pr-3 leading-snug">{{ p.title }}</h3>
          <span
            class="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold uppercase tracking-wide flex-shrink-0"
            :class="p.ongoing ? 'bg-green-900/30 text-green-300 border border-green-500/20' : 'bg-white/[0.05] text-slate-400 border border-white/[0.06]'"
          >
            {{ p.ongoing ? 'Active' : 'Done' }}
          </span>
        </div>

        <p class="text-xs text-slate-500 mb-3 font-medium relative z-10">
          {{ formatDuration(p) }}
        </p>

        <p class="text-sm text-slate-400 mt-1 line-clamp-3 relative z-10 flex-1 leading-relaxed" v-html="p.short"></p>

        <div class="mt-4 flex items-center justify-between relative z-10 pt-4 border-t border-white/[0.06]">
          <div class="flex gap-1.5 overflow-hidden">
            <span
              v-for="t in (p.tech || []).slice(0, 3)"
              :key="t"
              class="px-2 py-0.5 bg-white/[0.04] rounded-full border border-white/[0.06] text-xs text-slate-400"
            >
              {{ t }}
            </span>
          </div>

          <button
            @click="$emit('open', p)"
            class="text-sm px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-indigo-500/[0.06]"
          >
            Read
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  limit: { type: Number, default: 6 }
})

const projects = ref<any[]>([])
const loading = ref(true)
const sectionRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function load() {
  try {
    projects.value = await $fetch('/api/projects')
  } catch (e) {
    console.error('Failed to load projects', e)
    projects.value = []
  } finally {
    loading.value = false
  }
}

function emitReaction(type: 'project' | 'idle') {
  window.dispatchEvent(new CustomEvent('ai:react', { detail: type }))
}

function revealCards() {
  const cards = sectionRef.value?.querySelectorAll('.project-card')
  cards?.forEach((card, index) => {
    const element = card as HTMLElement
    element.style.opacity = '0'
    element.style.transform = 'translateY(18px)'
    element.style.transition = 'opacity 650ms ease, transform 650ms ease'
    window.setTimeout(() => {
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, index * 90)
  })
}

onMounted(() => {
  load()
  revealCards()

  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      emitReaction(entry?.isIntersecting ? 'project' : 'idle')
    },
    { threshold: 0.5 }
  )
  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (observer && sectionRef.value) observer.unobserve(sectionRef.value)
})

const shown = computed(() => projects.value.slice(0, props.limit))

function formatDuration(p: any) {
  if (p.ongoing) return `${p.started_at} – Present`
  return `${p.started_at} – ${p.ended_at}`
}
</script>