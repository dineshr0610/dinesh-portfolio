<template>
  <div v-if="items?.length" class="mt-8">
    <div class="flex items-center gap-2 mb-4">
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest font-display">
        Visual Proof
      </h3>
    </div>
    
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.title"
        class="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/50 hover:border-indigo-200/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <!-- Type Badge -->
        <div class="absolute top-2 left-2 z-10">
          <span 
            class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border shadow-sm backdrop-blur-md"
            :class="getTypeStyles(item.type)"
          >
            {{ item.type || 'Related' }}
          </span>
        </div>

        <!-- Image Area (Fixed Aspect Ratio) -->
        <div class="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.title"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center text-slate-300">
            <svg class="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>
        
        <!-- Content Area -->
        <div class="p-4">
          <h4 class="font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug font-display text-sm mb-1">
            {{ item.title }}
          </h4>
          
          <a
            v-if="item.link"
            :href="item.link"
            target="_blank"
            class="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 mt-2 group/link"
          >
            Explore 
            <span class="ml-1 transition-transform group-hover/link:translate-x-0.5">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: Array
})

function getTypeStyles(type) {
  switch (type?.toLowerCase()) {
    case 'project': 
      return 'bg-blue-50/90 border-blue-100 text-blue-700'
    case 'achievement': 
      return 'bg-amber-50/90 border-amber-100 text-amber-700'
    case 'timeline': 
      return 'bg-emerald-50/90 border-emerald-100 text-emerald-700'
    case 'gallery': 
      return 'bg-purple-50/90 border-purple-100 text-purple-700'
    default: 
      return 'bg-slate-50/90 border-slate-100 text-slate-600'
  }
}
</script>
