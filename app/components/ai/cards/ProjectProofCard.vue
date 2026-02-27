<template>
  <article class="group bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-lg transition overflow-hidden">
    <div class="relative w-full aspect-[16/9] bg-slate-100">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center text-slate-300">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-100">
        Project
      </span>
    </div>

    <div class="p-4">
      <h4 class="font-bold text-slate-900 text-sm line-clamp-2">{{ item.title }}</h4>
      <p v-if="item.short" class="mt-2 text-xs text-slate-600 line-clamp-2">{{ item.short }}</p>

      <div v-if="item.tech?.length" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="tag in item.tech.slice(0, 3)"
          :key="tag"
          class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600"
        >
          {{ tag }}
        </span>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <a
          v-if="item.demo"
          :href="item.demo"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Live Demo
        </a>
        <a
          v-if="item.repo"
          :href="item.repo"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs font-semibold text-slate-600 hover:text-slate-500"
        >
          GitHub
        </a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  item: {
    id: string | number
    title: string
    image: string | null
    short?: string | null
    tech?: string[] | null
    demo?: string | null
    repo?: string | null
  }
}>()
</script>
