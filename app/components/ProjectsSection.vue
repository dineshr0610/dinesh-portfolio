<!-- components/ProjectsSection.vue -->
<template>
  <!-- Wrapper is important for observer -->
  <section ref="sectionRef">
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="p in shown"
        :key="p.id"
        class="project-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 flex flex-col shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100"
      >
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-fuchsia-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

        <div class="h-36 overflow-hidden rounded">
          <img
            v-if="p.image"
            :src="p.image"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            alt=""
          />
        </div>

        <div class="mt-3 flex items-start justify-between relative z-10">
          <h3 class="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{{ p.title }}</h3>
          <span
            class="text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap"
            :class="p.ongoing ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ p.ongoing ? 'Ongoing' : 'Completed' }}
          </span>
        </div>

        <p class="text-xs text-slate-500 mt-1 mb-2 relative z-10">
          {{ formatDuration(p) }}
        </p>

        <p
          class="text-sm text-slate-600 mt-1 line-clamp-3 relative z-10"
          v-html="p.short"
        ></p>

        <div class="mt-3 flex items-center justify-between relative z-10">
          <div class="text-xs flex gap-2">
            <span
              v-for="t in (p.tech || []).slice(0, 3)"
              :key="t"
              class="px-2 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-600"
            >
              {{ t }}
            </span>
          </div>

          <div>
            <button
              @click="$emit('open', p)"
              class="text-sm px-3 py-1 rounded-full border border-slate-200 bg-white/90 text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 hover:bg-indigo-50"
            >
              Read
            </button>
          </div>
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
  window.dispatchEvent(
    new CustomEvent('ai:react', { detail: type })
  )
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
      if (entry?.isIntersecting) {
        emitReaction('project')
      } else {
        emitReaction('idle')
      }
    },
    {
      threshold: 0.5 // 50% visible = react
    }
  )

  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (observer && sectionRef.value) {
    observer.unobserve(sectionRef.value)
  }
})

const shown = computed(() =>
  projects.value.slice(0, props.limit)
)

function formatDuration(p: any) {
  if (p.ongoing) return `${p.started_at} – Present`
  return `${p.started_at} – ${p.ended_at}`
}
</script>

<style scoped>
/* fallback if line-clamp plugin not enabled */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
