<!-- components/ProjectCard.vue -->
<template>
  <article
    class="project-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100"
    @mouseenter="react('project')"
    @mouseleave="react('idle')"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-fuchsia-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

    <img
      v-if="project.image"
      :src="project.image"
      alt=""
      class="relative z-10 w-full h-40 object-cover rounded-xl transition-transform duration-700 group-hover:scale-[1.05]"
    />

    <h3 class="relative z-10 mt-3 font-bold text-lg font-display tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">
      <div class="flex items-start justify-between">
        {{ project.title }}
        <span
          class="text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap"
          :class="project.ongoing ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ project.ongoing ? 'Ongoing' : 'Completed' }}
        </span>
      </div>
    </h3>

    <p class="relative z-10 text-xs text-slate-500 mt-1 mb-2">
      {{ formatDuration(project) }}
    </p>

    <p class="relative z-10 mt-2 text-sm text-slate-600">
      {{ project.short }}
    </p>

    <div class="relative z-10 mt-3 flex items-center justify-between">
      <div class="text-xs space-x-2">
        <span
          v-for="tag in project.tech || []"
          :key="tag"
          class="inline-block px-2 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs text-slate-600"
        >
          {{ tag }}
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="$emit('open', project)"
          class="px-3 py-1 rounded-full border border-slate-200 bg-white/90 text-sm text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 hover:bg-indigo-50"
        >
          Read
        </button>

        <a
          v-if="project.repo"
          :href="project.repo"
          target="_blank"
          rel="noopener"
          class="text-sm underline"
        >
          Code
        </a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps({
  project: {
    type: Object,
    required: true
  }
})

function formatDuration(p: any) {
  if (p.ongoing) return `${p.started_at} – Present`
  return `${p.started_at} – ${p.ended_at}`
}

function react(type: 'project' | 'idle') {
  window.dispatchEvent(
    new CustomEvent('ai:react', {
      detail: type
    })
  )
}
</script>
