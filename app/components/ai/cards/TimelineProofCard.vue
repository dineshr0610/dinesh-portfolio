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
      <div v-else class="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100"></div>
      <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
        Timeline
      </span>
      <span v-if="yearLabel" class="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded bg-black/60 text-white">
        {{ yearLabel }}
      </span>
    </div>

    <div class="p-4">
      <h4 class="font-bold text-slate-900 text-sm line-clamp-2">{{ item.title }}</h4>
      <p v-if="item.short" class="mt-2 text-xs text-slate-600 line-clamp-2">{{ item.short }}</p>

      <NuxtLink
        :to="item.route || '/timeline'"
        class="inline-flex items-center mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-600"
      >
        View Full Timeline
        <span class="ml-1">→</span>
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: {
    id: string | number
    title: string
    image: string | null
    short?: string | null
    date?: string | null
    route?: string | null
  }
}>()

const yearLabel = computed(() => {
  if (!props.item.date) return ''
  const y = new Date(props.item.date).getFullYear()
  return Number.isNaN(y) ? '' : String(y)
})
</script>
