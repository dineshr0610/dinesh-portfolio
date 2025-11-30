<!-- components/ProjectsSection.vue -->
<template>
  <section>
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Projects</h2>
      <NuxtLink to="/about#projects" class="text-sm underline">See all</NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <ProjectCard v-for="p in projectsPreview" :key="p.id || p.title" :project="p" @open="openModal" />
    </div>

    <!-- Modal for project details -->
    <div v-if="active" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white max-w-2xl w-full rounded shadow-lg p-6 overflow-auto max-h-[90vh]">
        <div class="flex justify-between items-start">
          <h3 class="text-xl font-bold">{{ active.title }}</h3>
          <button @click="active=null" class="text-slate-500">Close</button>
        </div>
        <p class="mt-3 text-slate-700">{{ active.long || active.short }}</p>
        <div class="mt-4 flex gap-3">
          <a v-if="active.demo" :href="active.demo" target="_blank" class="px-3 py-1 bg-indigo-600 text-white rounded">Demo</a>
          <a v-if="active.repo" :href="active.repo" target="_blank" class="px-3 py-1 border rounded">Repo</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ProjectCard from '~/components/ProjectCard.vue'
import { ref, computed } from 'vue'

// Load projects: simple local JSON or markdown parsing later.
// For now we try to fetch /data/projects.json (create it) or fallback to inline demo.

let projects = ref([])

try {
  // try fetch a small json file in /public/data/projects.json
  const res = await fetch('/data/projects.json').catch(()=>null)
  if (res && res.ok) projects.value = await res.json()
} catch(e) {
  projects.value = []
}

// fallback demo if empty
if (!projects.value || projects.value.length === 0) {
  projects.value = [
    { id:1, title: 'Heart Beart-Ashdify', short: 'Responsive music player', long: 'Full description...', tech: ['HTML','JS','Cloudinary'], demo:'#', repo:'#', image: '/placeholder-project.jpg' },
    { id:2, title: 'Project Two', short: 'Short description', long: 'Long description', tech: ['Vue','Tailwind'], demo:'#', repo:'#' }
  ]
}

const active = ref(null)
const projectsPreview = computed(()=> projects.value.slice(0,6)) // show first 6

function openModal(p){ active.value = p }
</script>
