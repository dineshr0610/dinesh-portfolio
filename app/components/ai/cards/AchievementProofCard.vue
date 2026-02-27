<template>
  <article class="group bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-lg transition overflow-hidden">
    <div class="relative w-full aspect-[16/9] bg-slate-100">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100"></div>
      <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-50 text-amber-700 border border-amber-100">
        Achievement
      </span>
    </div>

    <div class="p-4">
      <h4 class="font-bold text-slate-900 text-sm line-clamp-2">{{ item.title }}</h4>
      <p v-if="item.short" class="mt-2 text-xs text-slate-600 line-clamp-2">{{ item.short }}</p>

      <a
        v-if="item.linkUrl"
        :href="item.linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center mt-4 text-xs font-semibold text-amber-700 hover:text-amber-600"
      >
        View Certificate
        <span class="ml-1">→</span>
      </a>
      <NuxtLink
        v-else
        :to="item.route || '/achievements'"
        class="inline-flex items-center mt-4 text-xs font-semibold text-amber-700 hover:text-amber-600"
      >
        View Achievements
        <span class="ml-1">→</span>
      </NuxtLink>
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
    linkUrl?: string | null
    route?: string | null
  }
}>()
</script>
