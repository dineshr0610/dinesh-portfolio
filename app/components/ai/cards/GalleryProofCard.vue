<template>
  <button
    type="button"
    class="w-full text-left group bg-white/70 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-lg transition overflow-hidden"
    @click="$emit('preview-gallery', item)"
  >
    <div class="relative w-full aspect-[16/9] bg-slate-100">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div v-else class="absolute inset-0 bg-gradient-to-br from-fuchsia-50 to-purple-100"></div>
      <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100">
        Gallery
      </span>
      <span
        v-if="item.mediaType === 'video'"
        class="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded bg-black/70 text-white"
      >
        Video
      </span>
    </div>

    <div class="p-4">
      <h4 class="font-bold text-slate-900 text-sm line-clamp-2">{{ item.title }}</h4>
      <p v-if="item.short" class="mt-2 text-xs text-slate-600 line-clamp-2">{{ item.short }}</p>
      <span class="inline-flex items-center mt-4 text-xs font-semibold text-fuchsia-700">
        Preview
        <span class="ml-1">→</span>
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  item: {
    id: string | number
    title: string
    image: string | null
    short?: string | null
    mediaType?: 'image' | 'video' | 'audio' | null
    mediaSrc?: string | null
    poster?: string | null
  }
}>()

defineEmits<{
  (event: 'preview-gallery', item: any): void
}>()
</script>
