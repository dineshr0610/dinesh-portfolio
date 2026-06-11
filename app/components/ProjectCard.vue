<!-- components/ProjectCard.vue -->
<template>
  <article
    class="project-card group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05] hover:border-indigo-500/20"
    @mouseenter="react('project')"
    @mouseleave="react('idle')"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

    <img
      v-if="project.image"
      :src="project.image"
      alt=""
      class="relative z-10 w-full h-40 object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.03] mb-4"
    />

    <div class="relative z-10 flex items-start justify-between mb-1">
      <h3 class="font-bold text-lg font-display tracking-tight text-slate-100 group-hover:text-indigo-300 transition-colors flex-1 pr-3">
        {{ project.title }}
      </h3>
      <span
        class="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold uppercase tracking-wide flex-shrink-0"
        :class="project.ongoing ? 'bg-green-900/30 text-green-300 border border-green-500/20' : 'bg-white/[0.05] text-slate-400 border border-white/[0.06]'"
      >
        {{ project.ongoing ? 'Active' : 'Done' }}
      </span>
    </div>

    <p class="relative z-10 text-xs text-slate-500 mb-3 font-medium">
      {{ formatDuration(project) }}
    </p>

    <p class="relative z-10 text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">
      {{ project.short }}
    </p>

    <div class="relative z-10 mt-4 flex items-center justify-between pt-4 border-t border-white/[0.06]">
      <div class="flex gap-1.5 overflow-hidden">
        <span
          v-for="tag in (project.tech || []).slice(0, 3)"
          :key="tag"
          class="inline-block px-2 py-0.5 bg-white/[0.04] rounded-full border border-white/[0.06] text-xs text-slate-400"
        >
          {{ tag }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="$emit('open', project)"
          class="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-sm text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-indigo-500/[0.06]"
        >
          Read
        </button>

        <a
          v-if="project.repo"
          :href="project.repo"
          target="_blank"
          rel="noopener"
          class="text-sm text-slate-500 hover:text-slate-300 transition-colors"
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
  window.dispatchEvent(new CustomEvent('ai:react', { detail: type }))
}
</script>