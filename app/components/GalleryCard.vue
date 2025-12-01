<template>
  <article class="bg-white rounded shadow overflow-hidden">
    <div class="relative">
      <img v-if="item.image" :src="item.image" alt="" class="w-full h-48 object-cover" />
      <div class="absolute left-3 top-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {{ formattedDate }}
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-start justify-between">
        <div class="pr-4">
          <h3 class="font-semibold text-lg leading-snug">{{ item.title || 'Untitled' }}</h3>
          <p class="text-sm text-slate-500 mt-1" v-if="item.short">{{ item.short }}</p>
        </div>

        <div class="flex flex-col items-end gap-2">
          <button @click="('open', item)" class="text-sm px-3 py-1 border rounded">View</button>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="t in item.tags || []" :key="t" class="text-xs px-2 py-1 bg-slate-100 rounded">{{ t }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ item: Object })

const formattedDate = computed(() => {
  const d = props.item?.date
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
})
</script>
