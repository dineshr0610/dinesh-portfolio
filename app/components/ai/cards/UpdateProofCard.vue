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
      <div v-else class="absolute inset-0 bg-gradient-to-br from-cyan-50 to-sky-100"></div>
      <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-50 text-cyan-700 border border-cyan-100">
        Update
      </span>
    </div>

    <div class="p-4">
      <div v-if="dateLabel" class="text-[11px] font-medium text-slate-500 mb-1">{{ dateLabel }}</div>
      <h4 class="font-bold text-slate-900 text-sm line-clamp-2">{{ item.title }}</h4>
      <p v-if="item.short" class="mt-2 text-xs text-slate-600 line-clamp-2">{{ item.short }}</p>

      <NuxtLink
        :to="item.route || '/updates'"
        class="inline-flex items-center mt-4 text-xs font-semibold text-cyan-700 hover:text-cyan-600"
      >
        Read Update
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

const dateLabel = computed(() => {
  if (!props.item.date) return ''
  const d = new Date(props.item.date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})
</script>
