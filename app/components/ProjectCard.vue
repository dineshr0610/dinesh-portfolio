<!-- components/ProjectCard.vue -->
<template>
  <article
    class="bg-white rounded shadow p-4 transition-transform duration-200"
    @mouseenter="react('project')"
    @mouseleave="react('idle')"
  >
    <img
      v-if="project.image"
      :src="project.image"
      alt=""
      class="w-full h-40 object-cover rounded"
    />

    <h3 class="mt-3 font-semibold text-lg">
      <div class="flex items-start justify-between">
        {{ project.title }}
        <span
          class="text-xs px-2 py-0.5 rounded ml-2 whitespace-nowrap"
          :class="project.ongoing ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ project.ongoing ? 'Ongoing' : 'Completed' }}
        </span>
      </div>
    </h3>

    <p class="text-xs text-slate-500 mt-1 mb-2">
      {{ formatDuration(project) }}
    </p>

    <p class="mt-2 text-sm text-slate-600">
      {{ project.short }}
    </p>

    <div class="mt-3 flex items-center justify-between">
      <div class="text-xs space-x-2">
        <span
          v-for="tag in project.tech || []"
          :key="tag"
          class="inline-block px-2 py-1 bg-slate-100 rounded text-xs"
        >
          {{ tag }}
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="$emit('open', project)"
          class="px-3 py-1 border rounded text-sm"
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
