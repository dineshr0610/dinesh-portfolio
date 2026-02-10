<template>
  <section class="min-h-screen py-12 bg-slate-50">
    <div class="container mx-auto px-4 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in-up">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Gallery</h1>
        <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          A visual collection of highlights, prototypes, and moments from my journey.
        </p>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="flex justify-center py-20">
         <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-600 bg-red-50 rounded-lg">
        Failed to load gallery: {{ error }}
      </div>

      <!-- Emtpy State -->
      <div v-else-if="items.length === 0" class="text-center py-20 text-slate-400">
        <div class="text-6xl mb-4">📷</div>
        <p>No photos yet.</p>
      </div>

      <!-- Masonry Grid -->
      <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="break-inside-avoid group cursor-pointer"
          @click="openLightbox(item)"
        >
          <div class="relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
            <!-- Image / Poster -->
            <img 
              :src="getThumbnail(item)" 
              loading="lazy"
              class="w-full h-auto object-cover"
              :alt="item.title"
            />
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span v-if="item.type === 'video'" class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                 ▶ Video
              </span>
              <div class="text-white/60 text-xs font-medium mb-1" v-if="item.date">
                {{ new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </div>
              <h3 class="text-white font-bold text-lg leading-tight">{{ item.title }}</h3>
              <p class="text-slate-300 text-sm mt-1 line-clamp-2" v-if="item.description">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <Transition name="fade">
        <div 
          v-if="active" 
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
          @click.self="closeLightbox"
        >
          <!-- Close Button -->
          <button 
            @click="closeLightbox"
            class="absolute top-6 right-6 text-white/50 hover:text-white transition rounded-full p-2 hover:bg-white/10"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="w-full max-w-5xl flex flex-col items-center">
            
            <!-- Media Player -->
            <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
               <img 
                  v-if="active.type === 'image'" 
                  :src="active.src" 
                  class="w-full h-full object-contain"
                />
                <video 
                  v-else 
                  :src="active.src" 
                  :poster="active.poster" 
                  controls 
                  autoplay
                  class="w-full h-full"
                ></video>
            </div>

            <!-- Info Bar -->
            <div class="mt-6 text-center max-w-2xl">
               <h2 class="text-2xl font-bold text-white">{{ active.title }}</h2>
               <p class="text-slate-400 mt-2 text-lg leading-relaxed">{{ active.description }}</p>
               
               <div v-if="active.tags && active.tags.length" class="flex flex-wrap justify-center gap-2 mt-4">
                  <span v-for="tag in active.tags" :key="tag" class="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">#{{ tag }}</span>
               </div>
            </div>

          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
// Mobile Gesture Nav
useGestureNavigation()

const { data: itemsData, pending: loading, error: fetchError } = await useAsyncData('public-gallery', () => $fetch('/api/public/gallery'))

const items = computed(() => Array.isArray(itemsData.value) ? itemsData.value : [])
const error = computed(() => fetchError.value?.message || null)

const active = ref(null)

function getThumbnail(item) {
    if (item.type === 'image') return item.src
    // If video, use poster. If no poster, try src (might not work well, but fallback)
    return item.poster || item.src 
}

function openLightbox(item) {
  active.value = item
  document.body.style.overflow = 'hidden' // prevents scrolling
}

function closeLightbox() {
  active.value = null
  document.body.style.overflow = ''
}

// Keyboard nav
onMounted(() => {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox()
    })
})
</script>

<style scoped>
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
}
</style>
