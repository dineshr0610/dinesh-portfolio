<template>
  <div class="relative group h-full flex flex-col" @mouseenter="pause" @mouseleave="resume" ref="container">

    <!-- Header -->
    <div class="flex items-center justify-between mb-5 px-1 flex-shrink-0">
      <h3 class="font-bold text-slate-100 flex items-center gap-2 font-display text-lg">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
        Social Highlights
      </h3>

      <!-- Controls -->
      <div class="flex gap-2">
        <button
          @click="prev"
          class="p-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          :disabled="items.length <= 1"
          aria-label="Previous Highlight"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          @click="next"
          class="p-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          :disabled="items.length <= 1"
          aria-label="Next Highlight"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Carousel Window -->
    <div class="overflow-hidden bg-white/[0.03] rounded-2xl border border-white/[0.06] min-h-[300px] md:min-h-[450px] relative flex-1 flex flex-col">

      <div v-if="pending" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        Loading highlights…
      </div>

      <div v-else-if="items.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm italic p-6 text-center">
        <span class="text-3xl mb-2">📱</span>
        No social highlights yet.
      </div>

      <div
        v-else
        class="relative w-full h-full flex items-stretch flex-1 overflow-hidden"
      >
        <TransitionGroup name="slide-carousel">
          <div
            v-for="(item, index) in items"
            v-show="index === currentIndex"
            :key="item.id || index"
            class="w-full flex-shrink-0 p-5 flex flex-col items-center justify-center min-h-[300px] md:min-h-[450px] h-full overflow-y-auto absolute inset-0"
            @touchstart="touchStart"
            @touchend="touchEnd"
          >
            <div class="mb-4 text-center w-full px-4">
              <div class="flex items-center justify-center gap-2 mb-1">
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 uppercase tracking-wider border border-white/[0.06]">{{ item.platform }}</span>
              </div>
              <h4 v-if="item.title" class="text-sm font-bold text-slate-100 line-clamp-2 leading-tight">{{ item.title }}</h4>
            </div>

            <div
              class="w-full max-w-[400px] overflow-hidden rounded-xl social-embed-container border border-white/[0.06] bg-black/20 relative"
              v-html="item.embed_html"
            ></div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="items.length > 1" class="mt-2 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
        :style="{ width: `${((currentIndex + 1) / items.length) * 100}%` }"
      ></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const { data: itemsData, pending } = await useFetch('/api/social-highlights')
const items = computed(() => (itemsData.value as any[]) || [])

const currentIndex = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const container = ref<HTMLElement | null>(null)
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
  timer.value = setInterval(next, 7000)
}

function stopAutoSlide() {
  if (timer.value) { clearInterval(timer.value); timer.value = null }
}

function pause() { stopAutoSlide() }
function resume() { startAutoSlide() }

function touchStart(e: TouchEvent) {
  const touch = e.changedTouches?.[0]
  if (!touch) return
  touchStartX.value = touch.screenX
  pause()
}

function touchEnd(e: TouchEvent) {
  const touch = e.changedTouches?.[0]
  if (!touch) return

  touchEndX.value = touch.screenX
  const delta = touchEndX.value - touchStartX.value

  if (Math.abs(delta) >= 50) {
    delta < 0 ? next() : prev()
  }

  resume()
}


onMounted(() => { startAutoSlide() })
onUnmounted(() => { stopAutoSlide() })
</script>

<style>
.social-embed-container iframe {
  width: 100% !important;
  border-radius: 0.5rem;
}

.slide-carousel-enter-active,
.slide-carousel-leave-active {
  transition: opacity 0.3s ease;
}
.slide-carousel-enter-from,
.slide-carousel-leave-to {
  opacity: 0;
}
</style>