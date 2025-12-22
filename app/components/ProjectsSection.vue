<!-- components/ProjectsSection.vue -->
<template>
  <!-- Wrapper is important for observer -->
  <section ref="sectionRef">
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="p in shown"
        :key="p.id"
        class="bg-white rounded shadow p-4 flex flex-col"
      >
        <div class="h-36 overflow-hidden rounded">
          <img
            v-if="p.image"
            :src="p.image"
            class="w-full h-full object-cover"
            alt=""
          />
        </div>

        <h3 class="mt-3 font-semibold">
          {{ p.title }}
        </h3>

        <p
          class="text-sm text-slate-600 mt-1 line-clamp-3"
          v-html="p.short"
        ></p>

        <div class="mt-3 flex items-center justify-between">
          <div class="text-xs flex gap-2">
            <span
              v-for="t in (p.tech || []).slice(0, 3)"
              :key="t"
              class="px-2 py-1 bg-slate-100 rounded"
            >
              {{ t }}
            </span>
          </div>

          <div>
            <button
              @click="$emit('open', p)"
              class="text-sm px-3 py-1 border rounded"
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
const sectionRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function load() {
  try {
    const res = await fetch('/data/projects.json', { cache: 'no-store' })
    projects.value = await res.json()
  } catch {
    projects.value = []
  }
}

function emitReaction(type: 'project' | 'idle') {
  window.dispatchEvent(
    new CustomEvent('ai:react', { detail: type })
  )
}

onMounted(() => {
  load()

  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
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
</script>

<style scoped>
/* fallback if line-clamp plugin not enabled */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
