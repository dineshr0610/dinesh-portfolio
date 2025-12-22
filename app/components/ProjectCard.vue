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
      {{ project.title }}
    </h3>

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

function react(type: 'project' | 'idle') {
  window.dispatchEvent(
    new CustomEvent('ai:react', {
      detail: type
    })
  )
}
</script>
