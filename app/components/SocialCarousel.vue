<template>
  <div class="relative group h-full flex flex-col" @mouseenter="pause" @mouseleave="resume" ref="container">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5 px-1 flex-shrink-0">
      <h3 class="font-bold text-slate-900 flex items-center gap-2">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        Social Highlights
      </h3>
      
      <!-- Controls -->
      <div class="flex gap-2">
        <button 
          @click="prev"
          class="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="items.length <= 1"
          aria-label="Previous Highlight"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>
        <button 
          @click="next"
          class="p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="items.length <= 1"
          aria-label="Next Highlight"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Carousel Window -->
    <div class="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[300px] md:min-h-[450px] relative hover:shadow-md transition-shadow flex-1 flex flex-col">
      <div v-if="pending" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-sm gap-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        Loading highlights...
      </div>
      
      <div v-else-if="items.length === 0" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-sm italic p-6 text-center border-2 border-dashed border-slate-100 m-2 rounded-xl">
        <span class="text-3xl mb-2">📱</span>
        No social highlights yet.
      </div>

      <div 
        v-else
        class="relative w-full h-full transition-transform duration-500 ease-out flex items-stretch flex-1"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      >
        <!-- Slides -->
        <div 
          v-for="(item, index) in items" 
          :key="item.id || index"
          class="w-full flex-shrink-0 p-4 flex flex-col items-center justify-center bg-white min-h-[300px] md:min-h-[450px] h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
          :class="{ 'opacity-100 pointer-events-auto': index === currentIndex, 'opacity-0 pointer-events-none': index !== currentIndex }"
        >
           <!-- Label/Date - Moved top for better context -->
           <div class="mb-4 text-center w-full px-4">
              <div class="flex items-center justify-center gap-2 mb-1">
                 <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">{{ item.platform }}</span>
              </div>
              <h4 v-if="item.title" class="text-sm font-bold text-slate-800 line-clamp-2 md:line-clamp-1 leading-tight">{{ item.title }}</h4>
           </div>

           <!-- Embed Container -->
           <div 
             class="w-full max-w-[400px] overflow-hidden rounded-xl social-embed-container shadow-sm border border-slate-100 bg-slate-50 relative"
             v-html="item.embed_html"
           ></div>
        </div>
      </div>
    </div>
    
    <!-- Progress Indicator -->
    <div v-if="items.length > 1" class="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-2xl overflow-hidden mx-[1px] mb-[1px]">
       <div 
         class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
         :style="{ width: `${((currentIndex + 1) / items.length) * 100}%` }"
       ></div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const { data: itemsData, pending } = await useFetch('/api/social-highlights')
const items = computed(() => itemsData.value || [])

const currentIndex = ref(0)
const timer = ref(null)
const container = ref(null)

// Touch handling
const touchStartX = ref(0)
const touchEndX = ref(0)

function next() {
  if (items.value.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % items.value.length
}

function prev() {
  if (items.value.length <= 1) return
  currentIndex.value = currentIndex.value === 0 ? items.value.length - 1 : currentIndex.value - 1
}

function startAutoSlide() {
  if (items.value.length <= 1) return
  stopAutoSlide()
  timer.value = setInterval(next, 7000) // 7 seconds
}

function stopAutoSlide() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function pause() {
  stopAutoSlide()
}

function resume() {
  startAutoSlide()
}

// Touch events
function touchStart(e) {
  touchStartX.value = e.changedTouches[0].screenX
  pause()
}

function touchMove(e) {
  // Optional: tracking logic
}

function touchEnd(e) {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
  resume()
}

function handleSwipe() {
  const threshold = 50
  if (touchEndX.value < touchStartX.value - threshold) {
    next()
  }
  if (touchEndX.value > touchStartX.value + threshold) {
    prev()
  }
}



onMounted(() => {
  startAutoSlide()
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>

<style>
/* Global styles for embeds inside the container if needed */
.social-embed-container iframe {
  width: 100% !important;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
</style>
