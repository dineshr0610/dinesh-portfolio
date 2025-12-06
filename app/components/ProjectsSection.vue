<!-- components/ProjectsSection.vue -->
<template>
  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <article v-for="p in shown" :key="p.id" class="bg-white rounded shadow p-4 flex flex-col">
      <div class="h-36 overflow-hidden rounded">
        <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" alt="" />
      </div>
      <h3 class="mt-3 font-semibold">{{ p.title }}</h3>
      <p class="text-sm text-slate-600 mt-1 line-clamp-3" v-html="p.short"></p>
      <div class="mt-3 flex items-center justify-between">
        <div class="text-xs flex gap-2">
          <span v-for="t in (p.tech || []).slice(0,3)" :key="t" class="px-2 py-1 bg-slate-100 rounded">{{ t }}</span>
        </div>
        <div>
          <button @click="$emit('open', p)" class="text-sm px-3 py-1 border rounded">Read</button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const props = defineProps({ limit: { type: Number, default: 6 } })
const projects = ref([])

async function load(){
  try {
    const res = await fetch('/data/projects.json', { cache: 'no-store' })
    projects.value = await res.json()
  } catch (e) { projects.value = [] }
}

onMounted(load)

const shown = computed(() => projects.value.slice(0, props.limit))
</script>

<style scoped>
/* requires line-clamp plugin or simple fallback */
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>
