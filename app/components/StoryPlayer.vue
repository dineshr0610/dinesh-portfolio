<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'

// Define props with types
interface TimelineEvent {
  date: string
  title: string
  description: string
  image?: string
  media?: {
    type: 'image' | 'video'
    src: string
    poster?: string
  }
}

const props = defineProps<{
  events: TimelineEvent[]
  initialIndex?: number
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex || 0)
const isPlaying = ref(true) // Default to auto-play
const isMuted = ref(false)

// Computed for cleaner template
const currentEvent = computed(() => props.events[currentIndex.value])

// Helper to resolve the correct image to show
const currentImage = computed(() => {
  const evt = currentEvent.value
  if (!evt) return null
  
  // 1. If video, try poster
  if (evt.media?.type === 'video' && evt.media.poster) return evt.media.poster
  
  // 2. If valid media src (and not video or just generic media)
  // Note: timeline.vue uses (item.media && item.media.src) || item.image
  if (evt.media?.src && evt.media.type !== 'video') return evt.media.src
  
  // 3. Fallback to direct image property
  return evt.image || null
})

// Refs for GSAP
const containerRef = ref<HTMLElement | null>(null)
const dateRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)

// Visual Layers
const bgImageRef = ref<HTMLElement | null>(null)
const bgGradientRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null) // For crossfades/vignette
const audioRef = ref<HTMLAudioElement | null>(null)

// Master Timeline for the current scene
let masterTimeline: gsap.core.Timeline | null = null
const currentStyle = ref<CinematicStyle | null>(null) // State for template binding

// Computed alignment classes for the content container
const alignmentClasses = computed(() => {
    const align = currentStyle.value?.textAlignment || 'center'
    
    switch (align) {
        case 'left':
            return 'items-start text-left justify-center'
        case 'right':
            return 'items-end text-right justify-center'
        case 'bottom-left':
            return 'items-start text-left justify-end pb-32' // Extra padding for controls
        case 'top-left':
            return 'items-start text-left justify-start pt-32'
        case 'center':
        default:
            return 'items-center text-center justify-center'
    }
})

// Expose style to template safely
const cinematicStyle = computed(() => currentStyle.value)

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
  const trackIndex = minutes % totalTracks 
  
  const primarySrc = `/content/audio/${trackIndex}.mp3`
  const fallbackSrc = `/content/audio/1.mp3` // Guaranteed to exist
  
  // 2. Setup Error Handling for Fallback
  const playFallback = () => {
    if (!audioRef.value) return
    console.log(`Track ${trackIndex}.mp3 not found. Falling back to 1.mp3`)
    audioRef.value.src = fallbackSrc
    audioRef.value.play()
        .then(fadeAudioIn)
        .catch(e => console.warn("Fallback autoplay blocked", e))
  }

  // Remove any existing listeners to avoid duplicates
  audioRef.value.onerror = null
  
  audioRef.value.onerror = () => {
    // Only fallback if not already playing fallback
    if (audioRef.value && !audioRef.value.src.endsWith('1.mp3')) {
        playFallback()
    } else {
        console.warn("Audio file missing, continuing without music.")
    }
  }

  // 3. Set Source and Play
  audioRef.value.src = primarySrc
  audioRef.value.volume = 0 // Start silent
  
  audioRef.value.play()
    .then(fadeAudioIn)
    .catch((err) => {
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
    if (audioRef.value.paused) audioRef.value.play().catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// 🎬 CINEMATIC ENGINE
// ---------------------------------------------------------------------------

import { getCinematicStyle, type CinematicStyle } from '~/utils/cinematic-styles'

function runScene(index: number) {
  // 1. Cleanup previous scene
  if (masterTimeline) masterTimeline.kill()
  
  // 2. GET STYLE FOR THIS SCENE 🎭
  const style = getCinematicStyle(index)
  currentStyle.value = style // Update state for template
  // console.log(`🎬 Scene ${index}: Playing style "${style.name}"`)

  // 3. Setup Elements (Immediate Reset)
  // Reset text
  const textElements = [dateRef.value, titleRef.value, descRef.value].filter(el => el) as HTMLElement[]
  // CRITICAL FIX: Base state must be visible (opacity: 1) so .from() animations work.
  // The .from() tweens will immediately handle hiding them at the start of the timeline.
  gsap.set(textElements, { opacity: 1, y: 0, x: 0, scale: 1, filter: 'none', skewX: 0, color: 'white', letterSpacing: 'normal' }) 

  
  // Reset Backgrounds
  // Check refs existence again safely (nextTick ensures they should be there if logic is right)
  const bgImage = bgImageRef.value
  const bgGradient = bgGradientRef.value
  
  if (bgImage) gsap.set(bgImage, { scale: 1.0, opacity: 0, x: 0, y: 0, rotation: 0, filter: 'none' }) 
  if (bgGradient) gsap.set(bgGradient, { scale: 1.0, opacity: 0, x: 0, y: 0, rotation: 0, filter: 'none' })
  
  // Reset Overlay
  if (overlayRef.value) {
    gsap.set(overlayRef.value, { opacity: 1 }) 
    // Clear old custom classes if any (basic approach: reset to base)
    overlayRef.value.className = "absolute inset-0 bg-black z-10 opacity-100 transition-overlay" 
    if (style.overlayClass) {
        overlayRef.value.classList.add(...style.overlayClass.split(' '))
    }
  }

  // 4. Build Master Timeline
  masterTimeline = gsap.timeline({
    paused: !isPlaying.value, // Start paused if user paused
    onComplete: next // Auto-advance at end
  })

  // --- SCENE SEQUENCE (Total from style.duration or default 12s) ---
  const sceneDuration = style.duration || 12
  const exitTime = sceneDuration - 1.5

  // Determine active BG
  const activeBg = (currentImage.value && bgImage) ? bgImage : bgGradient
  
  // If we have an active BG, apply the style
  if (activeBg) {
      // Apply CSS Filter (immediate)
      if (style.filter) {
          gsap.set(activeBg, { filter: style.filter })
      }

      // 0s: Reveal Scene (Fade overlay out)
      masterTimeline.to(overlayRef.value, { opacity: 0.3, duration: 1.5, ease: "power2.inOut" }, 0)
      
      // Fade active BG in
      masterTimeline.to(activeBg, { opacity: 1, duration: 1, ease: "power2.out" }, 0.5)

      // 🎥 CAM MOTION (Image Animation)
      // We add the style's timeline to the master
      const imgAnim = style.imageAnimation(activeBg)
      masterTimeline.add(imgAnim, 0)
  }

  // 📝 TEXT MOTION
  // We add the style's text timeline
  if (textElements.length > 0) {
      const txtAnim = style.textAnimation(textElements)
      masterTimeline.add(txtAnim, 1.0) // Start text a bit in
  }

  // 🚪 EXIT SEQUENCE
  if (style.exitAnimation && overlayRef.value && activeBg) {
      // Custom Exit
      const exitAnim = style.exitAnimation(textElements, overlayRef.value, activeBg)
      masterTimeline.add(exitAnim, exitTime)
  } else {
      // Standard Cinematic Exit (Fade Out)
      // Text fade out
      masterTimeline.to(textElements, { 
        opacity: 0, 
        filter: 'blur(5px)',
        duration: 1, 
        stagger: 0.1,
        ease: "power2.in" 
      }, exitTime)

      // Fade overlay to black
      if (overlayRef.value) {
          masterTimeline.to(overlayRef.value, { 
            opacity: 1, 
            duration: 1.5, 
            ease: "power2.in" 
          }, exitTime)
      }
  }
  
  // Ensure timeline lasts full duration (padding)
  masterTimeline.to({}, { duration: 0.1 }, sceneDuration)
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

// Watch for index changes AND data updates (e.g. initial load)
watch([currentIndex, currentEvent], async () => {
    // Wait for DOM to update (v-if on image vs gradient)
    await nextTick()
    
    // Safety check: if events are empty, don't run
    if (!currentEvent.value) return 

    runScene(currentIndex.value)
})

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'Escape') closeStory()
    if (e.code === 'Space') togglePlay()
    if (e.key === 'm') toggleMute()
}

onMounted(async () => {
    // Initial fade in of the whole container
    if (containerRef.value) {
         gsap.fromTo(containerRef.value, { opacity: 0 }, { opacity: 1, duration: 1 })
    }
    await nextTick()
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
    class="fixed inset-0 bg-black text-white z-[9999] flex flex-col justify-center items-center px-6 overflow-hidden font-sans select-none"
    ref="containerRef"
  >
    <!-- Background Audio -->
    <audio ref="audioRef" loop preload="auto" crossorigin="anonymous"></audio>

    <!-- 🎬 CINEMATIC VISUAL STACK 🎬 -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        
        <!-- LAYER 0: Background (Image OR Gradient) -->
        <!-- Logic: If image exists, render img. If not, render gradient. Both controlled by GSAP. -->
        <div class="absolute inset-0 bg-black">
             <!-- Option A: Image -->
             <img 
                v-if="currentImage" 
                :src="currentImage" 
                ref="bgImageRef"
                class="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.1] blur-[1px] opacity-0 will-change-transform"
                alt="Cinematic Background"
             />

             <!-- Option B: Gradient Fallback -->
             <div 
                v-else
                ref="bgGradientRef" 
                class="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-black opacity-0 will-change-transform"
             >
                <div class="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
             </div>
        </div>
        
        <!-- LAYER 1: Dark Overlay (For transitions & readability) -->
        <div ref="overlayRef" class="absolute inset-0 bg-black z-10 opacity-100"></div>

        <!-- LAYER 2: Film Grain (Animated) -->
        <div class="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none film-grain z-20"></div>

        <!-- LAYER 3: Vignette (Static) -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0.95)_100%)] z-20"></div>
    </div>


    <!-- 📝 CONTENT LAYER -->
    <div class="relative z-30 flex flex-col items-center max-w-5xl text-center space-y-8">
        
        <!-- Date -->
        <div class="text-sm md:text-lg font-medium tracking-[0.3em] uppercase text-indigo-400 opacity-0 transform translate-y-10" ref="dateRef">
         {{ currentEvent?.date }}
        </div>

        <!-- Title -->
        <h1 class="text-5xl md:text-8xl font-bold tracking-tight text-white opacity-0 leading-tight drop-shadow-2xl transform translate-y-10" ref="titleRef">
        {{ currentEvent?.title }}
        </h1>

        <!-- Description -->
        <p class="max-w-3xl text-xl md:text-2xl text-gray-300 opacity-0 leading-relaxed font-light transform translate-y-10" ref="descRef">
        {{ currentEvent?.description }}
        </p>
    
    </div>

    <!-- 🎮 CONTROLS LAYER -->
    <div class="absolute bottom-12 w-full z-40 flex justify-center items-center gap-12">
      
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
        
        <!-- Mute Toggle -->
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
             <svg v-if="currentIndex < props.events.length - 1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-8 h-8 group-hover:scale-110 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </button>
    </div>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full z-30">
      <div
        class="h-full bg-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-[1000ms] ease-linear relative"
        :style="{ width: ((currentIndex + 1) / events.length) * 100 + '%' }"
      >
        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-[2px] bg-gradient-to-r from-transparent to-white opacity-50"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* FILM GRAIN ANIMATION */
.film-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  animation: grain 8s steps(10) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-2%, -2%); }
  20% { transform: translate(-4%, 2%); }
  30% { transform: translate(2%, -4%); }
  40% { transform: translate(-2%, 4%); }
  50% { transform: translate(-4%, 2%); }
  60% { transform: translate(4%, 0); }
  70% { transform: translate(0, 4%); }
  80% { transform: translate(-2%, -2%); }
  90% { transform: translate(2%, 2%); }
}
</style>
