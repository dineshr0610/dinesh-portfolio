<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

// Define props with types
interface TimelineEvent {
  date: string
  title: string
  description: string
  image?: string
}

const props = defineProps<{
  events: TimelineEvent[]
  initialIndex?: number
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex || 0)
const isPlaying = ref(true) // Default to auto-play
const isMuted = ref(false)

// Refs for GSAP
const containerRef = ref<HTMLElement | null>(null)
const dateRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const bgRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null) // For crossfades
const audioRef = ref<HTMLAudioElement | null>(null)

// Master Timeline for the current scene
let masterTimeline: gsap.core.Timeline | null = null

// ---------------------------------------------------------------------------
// 🎵 AUDIO ENGINE (Minute-Based Rotation)
// ---------------------------------------------------------------------------

function initAudio() {
  if (!audioRef.value) return

  // 1. Calculate Track based on Minute
  const now = new Date()
  const minutes = now.getMinutes()
  const totalTracks = 10 // range 0.mp3 to 9.mp3
  
  // Logic: 0-9 based on minute
  // e.g. minute 0 -> 0.mp3, minute 1 -> 1.mp3 ... minute 10 -> 0.mp3
  const trackIndex = minutes % totalTracks 
  
  const primarySrc = `/content/audio/${trackIndex}.mp3`
  const fallbackSrc = `/content/audio/1.mp3` // Guaranteed to exist
  
  // 2. Setup Error Handling for Fallback
  const playFallback = () => {
    if (!audioRef.value) return
    console.log(`Track ${trackIndex}.mp3 not found. Falling back to 1.mp3`)
    audioRef.value.src = fallbackSrc
    audioRef.value.play().then(fadeAudioIn).catch(e => console.error("Fallback failed", e))
  }

  // Remove any existing listeners to avoid duplicates
  audioRef.value.onerror = null
  
  audioRef.value.onerror = () => {
    // Only fallback if not already playing fallback
    if (audioRef.value && !audioRef.value.src.endsWith('1.mp3')) {
        playFallback()
    }
  }

  // 3. Set Source and Play
  audioRef.value.src = primarySrc
  audioRef.value.volume = 0 // Start silent
  
  audioRef.value.play().then(fadeAudioIn).catch((err) => {
    console.warn("Audio play error (likely missing file or autoplay policy):", err)
  })
}

function fadeAudioIn() {
    if (!isMuted.value && audioRef.value) {
        gsap.to(audioRef.value, { volume: 0.25, duration: 3 })
    }
}

function stopAudio() {
  if (!audioRef.value) return
  
  // Fade out then pause
  gsap.to(audioRef.value, { 
    volume: 0, 
    duration: 1.5, 
    onComplete: () => {
        if(audioRef.value) {
            audioRef.value.pause()
            audioRef.value.currentTime = 0
        }
    } 
  })
}

function toggleMute() {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  
  if (isMuted.value) {
    gsap.to(audioRef.value, { volume: 0, duration: 0.5 })
  } else {
    gsap.to(audioRef.value, { volume: 0.25, duration: 1 })
    if (audioRef.value.paused) audioRef.value.play()
  }
}

// ---------------------------------------------------------------------------
// 🎬 CINEMATIC ENGINE
// ---------------------------------------------------------------------------

function runScene(index: number) {
  // 1. Cleanup previous scene
  if (masterTimeline) masterTimeline.kill()
  
  // 2. Setup Elements (Immediate Reset)
  gsap.set([dateRef.value, titleRef.value, descRef.value], { opacity: 0, y: 30, filter: 'blur(10px)' })
  if (bgRef.value) gsap.set(bgRef.value, { scale: 1.0, opacity: 0 }) 
  if (overlayRef.value) gsap.set(overlayRef.value, { opacity: 1 }) // Start with black overlay

  // 3. Build Master Timeline
  masterTimeline = gsap.timeline({
    paused: !isPlaying.value, // Start paused if user paused
    onComplete: next // Auto-advance at end
  })

  // --- SCENE SEQUENCE (Total ~8-10s) ---

  // 0s: Fade in Sequence (Crossfade feeling)
  masterTimeline.to(overlayRef.value, { opacity: 0.3, duration: 1.5, ease: "power2.inOut" }, 0)
  masterTimeline.to(bgRef.value, { opacity: 1, duration: 1, ease: "power2.out" }, 0.5)

  // Ken Burns Effect (runs for whole slide)
  masterTimeline.to(bgRef.value, { 
    scale: 1.1, 
    duration: 10, 
    ease: "sine.out" 
  }, 0)

  // 1s: Date Reveal (Subtle)
  masterTimeline.to(dateRef.value, { 
    y: 0, 
    opacity: 0.8, 
    filter: 'blur(0px)',
    duration: 1.5, 
    ease: "power3.out" 
  }, 1)

  // 1.5s: Title Reveal (Bold)
  masterTimeline.to(titleRef.value, { 
    y: 0, 
    opacity: 1, 
    filter: 'blur(0px)',
    duration: 1.5, 
    ease: "power4.out" 
  }, 1.3)

  // 2.5s: Description Reveal (Calm)
  masterTimeline.to(descRef.value, { 
    y: 0, 
    opacity: 0.9, 
    filter: 'blur(0px)',
    duration: 1.5, 
    ease: "power2.out" 
  }, 2.0)

  // 8s: Fade Out (Transition)
  masterTimeline.to([dateRef.value, titleRef.value, descRef.value], { 
    opacity: 0, 
    y: -20, 
    filter: 'blur(5px)',
    duration: 1, 
    stagger: 0.1,
    ease: "power2.in" 
  }, 8)

  masterTimeline.to(overlayRef.value, { 
    opacity: 1, 
    duration: 1, 
    ease: "power2.in" 
  }, 8.5)
}

// ---------------------------------------------------------------------------
// 🎮 CONTROLS
// ---------------------------------------------------------------------------

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (masterTimeline) {
    isPlaying.value ? masterTimeline.play() : masterTimeline.pause()
  }
}

function next() {
  if (currentIndex.value < props.events.length - 1) {
    currentIndex.value++ // Triggers watch -> runScene
  } else {
    // End of story
    isPlaying.value = false
    closeStory()
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value-- // Triggers watch -> runScene
  }
}

function closeStory() {
  if (masterTimeline) masterTimeline.kill()
  
  stopAudio() // Fade out music
  
  if(containerRef.value) {
    gsap.to(containerRef.value, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => emit('close')
    })
  } else {
    emit('close')
  }
}

// Watch for index changes
watch(currentIndex, () => {
    // Small delay to ensure DOM update if needed, though with refs it's usually reactive.
    // We restart the timeline for the new index.
    runScene(currentIndex.value)
})

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'Escape') closeStory()
    if (e.code === 'Space') togglePlay()
    if (e.key === 'm') toggleMute()
}

onMounted(() => {
    // Initial fade in of the whole container
    if (containerRef.value) {
         gsap.fromTo(containerRef.value, { opacity: 0 }, { opacity: 1, duration: 1 })
    }
    // Start Story
    runScene(currentIndex.value)
    // Start Audio
    initAudio()
    
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    if (masterTimeline) masterTimeline.kill()
    stopAudio()
    window.removeEventListener('keydown', handleKeydown)
})

</script>

<template>
  <div
    class="fixed inset-0 bg-black text-white z-[9999] flex flex-col justify-center items-center px-6 overflow-hidden font-sans"
    ref="containerRef"
  >
    <!-- Background Audio -->
    <audio ref="audioRef" loop crossorigin="anonymous"></audio>

    <!-- Background Layer (Parallax/Effect) -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <!-- The image/gradient that zooms -->
        <div ref="bgRef" class="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-black">
           <!-- Subtle texture overlay -->
           <div class="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        </div>
        
        <!-- Vignette & Crossfade Overlay -->
        <div ref="overlayRef" class="absolute inset-0 bg-black z-10 opacity-30"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_90%)] z-10"></div>
    </div>

    <!-- Content Layer -->
    <div class="relative z-20 flex flex-col items-center max-w-5xl text-center space-y-8 select-none">
        
        <!-- Date -->
        <div class="text-sm md:text-lg font-medium tracking-[0.3em] uppercase text-indigo-400 opacity-0" ref="dateRef">
         {{ events[currentIndex]?.date }}
        </div>

        <!-- Title -->
        <h1 class="text-5xl md:text-8xl font-bold tracking-tight text-white opacity-0 leading-tight drop-shadow-2xl" ref="titleRef">
        {{ events[currentIndex]?.title }}
        </h1>

        <!-- Description -->
        <p class="max-w-3xl text-xl md:text-2xl text-gray-300 opacity-0 leading-relaxed font-light" ref="descRef">
        {{ events[currentIndex]?.description }}
        </p>
    
    </div>

    <!-- Controls -->
    <div class="absolute bottom-12 w-full z-30 flex justify-center items-center gap-12">
      
      <!-- Buttons -->
        <button 
            @click="prev" 
            class="group text-white/30 hover:text-white transition-all duration-300 p-4 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none"
            :disabled="currentIndex === 0"
        >
            <span class="sr-only">Previous</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-8 h-8 group-hover:scale-110 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
        
        <!-- Play / Pause -->
        <button 
            @click="togglePlay"
            class="group flex items-center justify-center w-16 h-16 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105"
        >
             <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 ml-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
        </button>

        <button 
            @click="closeStory" 
            class="group flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors absolute right-10 bottom-2"
        >
            <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:text-red-400 transition-all duration-300 bg-white/5 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </button>
        
        <!-- Mute Toggle (New) -->
        <button 
            @click="toggleMute" 
            class="group flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors absolute left-10 bottom-2"
        >
            <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:scale-110 transition-all duration-300 bg-white/5 backdrop-blur-sm">
                <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                 <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            </div>
        </button>

        <button 
            @click="next" 
             class="group text-white/30 hover:text-white transition-all duration-300 p-4 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
        >
             <span class="sr-only">Next</span>
             <svg v-if="currentIndex < events.length - 1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-8 h-8 group-hover:scale-110 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </button>
    </div>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full z-30">
        <!-- We can animate the progress bar specifically for the slide, OR just show overall progress.
             For a "Movie" feel, user usually wants to see total progress. 
             GSAP can tweak this too if needed. -->
      <div
        class="h-full bg-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-[1000ms] ease-linear relative"
        :style="{ width: ((currentIndex + 1) / events.length) * 100 + '%' }"
      >
        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-[2px] bg-gradient-to-r from-transparent to-white opacity-50"></div>
      </div>
    </div>
  </div>
</template>
