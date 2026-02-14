<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
 
import { getCinematicStyle, type CinematicStyle } from '~/utils/cinematic-styles'
import { useCinematicAudio } from '~/composables/useCinematicAudio'
import { getSoundProfile } from '~/utils/sfx-library'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(TextPlugin)
}

// ---------------------------------------------------------------------------
// ⏱️ EXACT AUDIO DURATIONS FOR PERFECT SYNC
// ---------------------------------------------------------------------------
const AUDIO_DURATIONS: Record<string, number> = {
    'mixkit-transition-windy-swoosh-1474.wav': 3.204,
    'mixkit-cinematic-whoosh-fast-transition-1492.wav': 1.334,
    'mixkit-fast-air-zoom-2625.wav': 1.282,
    'mixkit-ending-wind-swoosh-1482.wav': 2.386,
    'mixkit-flying-fast-swoosh-1469.wav': 1.632,
    'mixkit-cinematic-transition-wind-swoosh-1468.wav': 1.323,
    'mixkit-magic-spell-mystery-whoosh-2345.wav': 5.844,
    'mixkit-cinematic-whoosh-stutter-787.wav': 2.517
}

const { initAudio, playSfx, playDynamicBgm, stopAll, setBgmRef, detectEmotionalImpact, isMuted, toggleMute, softFadeIn, pauseAudio, resumeAudio } = useCinematicAudio()

// ... (Props and Ref declarations remain the same) ...
interface TimelineEvent {
  date: string
  title: string
  description: string
  image?: string
  media?: { type: 'image' | 'video', src: string, poster?: string }
}

const props = defineProps<{ 
    modelValue: boolean, 
    events: TimelineEvent[], 
    initialIndex?: number,
    audioMode?: 'timeline' | 'gallery' // Default: 'timeline'
}>()
const emit = defineEmits(['update:modelValue', 'close'])

const containerRef = ref<HTMLElement | null>(null)
const dateRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const bgImageRef = ref<HTMLElement | null>(null)
const bgGradientRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const currentSpecialFx = ref<HTMLAudioElement | null>(null)

const currentIndex = ref(props.initialIndex || 0)
const isPlaying = ref(true)

// 🎲 NEW: Generate a fresh random seed every time this component opens
const sessionSeed = ref(Math.floor(Math.random() * 10000))
const currentStyle = ref<CinematicStyle | null>(null)
const overlayClass = ref('')
let masterTimeline: gsap.core.Timeline | null = null

const currentEvent = computed(() => props.events[currentIndex.value])
const currentImage = computed(() => {
  const evt = currentEvent.value
  if (!evt) return null
  if (evt.media?.type === 'video' && evt.media.poster) return evt.media.poster
  if (evt.media?.src && evt.media.type !== 'video') return evt.media.src
  return evt.image || null
})

// 📏 SMART TEXT SIZER (Updated for Readability)
const contentScale = computed(() => {
    const titleLen = currentEvent.value?.title?.length || 0
    const descLen = currentEvent.value?.description?.length || 0
    const isHandwritten = currentStyle.value?.textMode === 'handwritten'
    
    return {
        // Title: Handwritten needs to be BIGGER to be legible
        titleClass: titleLen > 40 
            ? (isHandwritten ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl') 
            : (currentStyle.value?.titleSize || 'text-5xl md:text-8xl'),
        
        // Description: Never go below text-2xl for handwritten, or text-lg for others
        descClass: descLen > 250 
            ? (isHandwritten ? 'text-2xl leading-relaxed' : 'text-lg md:text-xl') 
            : (currentStyle.value?.descSize || 'text-xl md:text-2xl'),
        
        // Container: Add 'no-scrollbar' class to hide the bar
        containerClass: (titleLen + descLen > 300) ? 'max-h-[75vh] overflow-y-auto no-scrollbar pr-4' : ''
    }
})

const titleWords = computed(() => currentEvent.value?.title?.split(' ') || [])
const shouldSplitText = computed(() => {
    const mode = currentStyle.value?.textMode
    return mode === 'word-by-word' || mode === 'dramatic-pause' || mode === 'glitch-decode'
})

// ... (Controls logic remains the same) ...
function closeStory() { cleanup(); isPlaying.value = false; emit('update:modelValue', false); emit('close') }
function togglePlay() { isPlaying.value = !isPlaying.value; if (masterTimeline) isPlaying.value ? masterTimeline.play() : masterTimeline.pause() }

const isTransitioning = ref(false)
function next() { 
    if (isTransitioning.value) return // Block spam clicking
    if (currentIndex.value < props.events.length - 1) { 
        isTransitioning.value = true
        currentIndex.value++; 
        setTimeout(() => isTransitioning.value = false, 800) // 0.8s cooldown
    } else { 
        closeStory() 
    }
}
function prev() { if (currentIndex.value > 0) { playSfx('reverse'); currentIndex.value-- } }
function handleKeydown(e: KeyboardEvent) {
    if (!props.modelValue) return
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'Escape') closeStory()
    if (e.code === 'Space') togglePlay()
    if (e.key === 'm') toggleMute()
}

// ---------------------------------------------------------------------------
// 🎬 CINEMATIC ENGINE
// ---------------------------------------------------------------------------

async function runScene(index: number) {
  if (masterTimeline) masterTimeline.kill()
  if (containerRef.value) {
      gsap.killTweensOf(containerRef.value.querySelectorAll('*'))
      gsap.killTweensOf(containerRef.value)
  }
  
  if (currentSpecialFx.value) {
      currentSpecialFx.value.pause()
      currentSpecialFx.value = null
  }

  // SAFETY: Wait for DOM to be absolutely ready
  await nextTick()

  try { // 🛡️ START CRASH PROTECTION

  const event = props.events[index]
  if (!event) return

  const style = getCinematicStyle(index, sessionSeed.value)
  const soundProfile = getSoundProfile(index, sessionSeed.value)
  currentStyle.value = style 
  await nextTick() 

  const pacingMode = index % 3 === 0 ? 'slow' : index % 3 === 1 ? 'normal' : 'fast'
  const pacingConfig = {
      slow: { textDelay: 0.8, impactRatio: 0.4, exitBlur: 0.8 }, 
      normal: { textDelay: 0.5, impactRatio: 0.3, exitBlur: 0.6 },
      fast: { textDelay: 0.3, impactRatio: 0.2, exitBlur: 0.4 }
  }[pacingMode]

  const emotionalWeight = (event.description?.length || 0) + (event.title?.length || 0)
  let sceneDuration = (style.duration || 7) + (emotionalWeight > 120 ? 2 : 0)

  softFadeIn() 
  const isSilentScene = (index > 0 && index % 5 === 0) || style.name === 'Cinematic Silence'
  const shouldPlayImpact = !isSilentScene && (
                           (event.title && detectEmotionalImpact(event.title)) || 
                           (style.name.includes('Drama') || style.name.includes('Spotlight'))
                           ) && !(style.category === 'Light' || style.name.includes('Dream'))

  const textElements = [dateRef.value, titleRef.value, descRef.value].filter(Boolean) as HTMLElement[]
  gsap.set(textElements, { opacity: 1, y: 0, x: 0, scale: 1, filter: 'none', rotation: 0, color: 'white', letterSpacing: 'normal', textShadow: 'none', clipPath: 'none' })
  if (bgImageRef.value) gsap.set(bgImageRef.value, { scale: 1, opacity: 0, x: 0, y: 0, rotation: 0, filter: 'none' })
  if (bgGradientRef.value) gsap.set(bgGradientRef.value, { scale: 1, opacity: 0, x: 0, y: 0, rotation: 0 })
  if (overlayRef.value) {
      gsap.set(overlayRef.value, { opacity: 1 })
      overlayClass.value = style.overlayClass || 'bg-black/40'
  }

  masterTimeline = gsap.timeline({
      paused: !isPlaying.value,
      onComplete: () => { if (isPlaying.value) next() }
  })

  // 🛑 SAFETY CHECK: Ensure elements actually exist
  // 🛑 SAFETY CHECK: Ensure elements actually exist
  const activeBg = (currentImage.value && bgImageRef.value) ? bgImageRef.value : bgGradientRef.value
  
  // NOTE: We do NOT early return here anymore. If background is missing, we log it but continue.
  // This ensures the timeline always starts and the show goes on.
  if (!activeBg) {
      console.warn("⚠️ Background missing or delayed. Continuing with text-only scene...");
  }

  if (activeBg) {
      masterTimeline.fromTo(activeBg, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 0)
      
      // ✅ FIX 1: Allow the unique animation to play cleanly without overwriting it!
      masterTimeline.add(style.imageAnimation(activeBg), 0)
      
      const topBar = containerRef.value?.querySelector('.letterbox-top')
      const bottomBar = containerRef.value?.querySelector('.letterbox-bottom')
      if (topBar && bottomBar) {
          if (style.letterbox) {
              masterTimeline.to(topBar, { y: 0, duration: 1.5, ease: 'power3.out' }, 0)
              masterTimeline.to(bottomBar, { y: 0, duration: 1.5, ease: 'power3.out' }, 0)
          } else {
              gsap.set(topBar, { yPercent: -100 })
              gsap.set(bottomBar, { yPercent: 100 })
          }
      }

      if (textElements.length) {
          const colorClasses = ['text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-indigo-50', 'text-cyan-50', 'text-amber-50', 'text-stone-200', 'text-orange-100', 'text-cyan-100', 'text-rose-50', 'text-emerald-100', 'text-yellow-50', 'text-green-50', 'text-zinc-100', 'text-slate-200', 'text-slate-300']
          textElements.forEach(el => {
              el.classList.remove(...colorClasses)
              el.classList.add(style.textColor || 'text-white')
              gsap.set(el, { textShadow: style.textShadow || '0 2px 10px rgba(0,0,0,0.5)' })
          })
      }
  }

  if (overlayRef.value) {
       gsap.set(overlayRef.value, { opacity: 0 })
       masterTimeline.to(overlayRef.value, { opacity: 1, duration: 2, ease: 'power1.out' }, 0.2)
  }

  // ✅ FIX 2: Dynamic Transition Audio Calculation
  const transitionFile = soundProfile?.transition || 'mixkit-transition-windy-swoosh-1474.wav'
  const transitionDuration = AUDIO_DURATIONS[transitionFile] || 3.2
  const desiredTransitionLength = 1.2 
  const skipTime = Math.max(0, transitionDuration - desiredTransitionLength)

  if (!isSilentScene) {
       masterTimeline.call(() => playSfx('transition', soundProfile?.transition, { startTime: skipTime }), [], Math.max(0, sceneDuration - desiredTransitionLength))
  }

  // ✅ FIX 3: Dynamic Riser Audio Calculation
  const impactTime = (sceneDuration * pacingConfig.impactRatio) + ((Math.random() * 0.2) - 0.1)

  if (shouldPlayImpact) {
       const riserFile = style.name.includes('Sci-Fi') ? 'mixkit-cinematic-whoosh-stutter-787.wav' : 'mixkit-magic-spell-mystery-whoosh-2345.wav'
       const riserDuration = AUDIO_DURATIONS[riserFile] || 5.844
       const riserStart = impactTime - riserDuration
       
       if (riserStart < 0) {
            masterTimeline.call(() => playSfx('riser', riserFile, { startTime: Math.abs(riserStart) }), [], 0)
       } else {
            masterTimeline.call(() => playSfx('riser', riserFile), [], riserStart)
       }

       masterTimeline.call(() => {
           playSfx('impact', soundProfile?.impact)
           playSfx('ui', 'mixkit-camera-shutter-hard-click-1430.wav') 
       }, [], impactTime)
  } else if (!isSilentScene) {
       masterTimeline.call(() => playSfx('transition', soundProfile?.transition), [], 0)
  }

  // 🎥 STEP 6: Apply the correct text animation
  if (textElements.length) {
      const mode = style.textMode
      let textAnim: gsap.core.Timeline | gsap.core.Tween | null = null

      // Only hijack the absolute most complex custom modes
      // Typewriter Mode (Fixed Audio Sync)
      if (mode === 'typewriter' && titleRef.value) {
          textAnim = gsap.timeline()
          if (dateRef.value) textAnim.from(dateRef.value, { opacity: 0, duration: 0.5 })
          
          // 1. Setup Audio
          currentSpecialFx.value = new Audio('/content/audio/sfx/mixkit-fast-keyboard-typing-1387.wav');
          if (currentSpecialFx.value) currentSpecialFx.value.volume = 0.1;
          
          // 2. Calculate Exact Duration
          const typingDuration = event.title.length * 0.05;

          // 3. Schedule "Start" on the timeline
          textAnim.call(() => {
               if (currentSpecialFx.value) currentSpecialFx.value.play().catch(() => {});
          }, [], 0);

          // 4. Animate Text
          textAnim.fromTo(titleRef.value, 
              { text: { value: "", delimiter: "" }, opacity: 1 },
              { text: { value: event.title, delimiter: "" }, duration: typingDuration, ease: "none" },
              0 // Align exactly with start
          );

          // 5. Schedule "Stop" on the timeline at the exact end time
          textAnim.call(() => {
               if (currentSpecialFx.value) {
                   currentSpecialFx.value.pause();
                   currentSpecialFx.value.currentTime = 0; // Reset for next time
               }
          }, [], typingDuration);
          
          if (descRef.value) textAnim.from(descRef.value, { opacity: 0, duration: 1 }, "+=0.2")
      }
      else if (mode === 'handwritten' && titleRef.value) {
          textAnim = gsap.timeline()
          if (dateRef.value) textAnim.from(dateRef.value, { opacity: 0, duration: 1 })
          textAnim.fromTo(titleRef.value, 
              { clipPath: 'inset(0 100% 0 0)', opacity: 0, x: -20 },
              { clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, duration: 2.5, ease: 'power2.inOut' }
          )
          if (descRef.value) textAnim.fromTo(descRef.value, { clipPath: 'inset(0 100% 0 0)', opacity: 0 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 2, ease: 'power1.inOut' }, "-=1.0")
      }
      else if (mode === 'word-by-word' && titleRef.value) {
          const words = Array.from(titleRef.value.children)
          textAnim = gsap.timeline()
          if (dateRef.value) textAnim.from(dateRef.value, { opacity: 0, duration: 1 })
          textAnim.from(words, { opacity: 0, scale: 1.5, duration: 0.5, stagger: 0.4 })
          // Fixed Impact: Play sfx only on the last word
          if (words.length > 0) textAnim.call(() => playSfx('impact', 'mixkit-short-bass-hit-2299.wav'), [], (words.length - 1) * 0.4)
          if (descRef.value) textAnim.from(descRef.value, { opacity: 0, duration: 1 }, "+=0.5")
      }
      else if (mode === 'dramatic-pause' && titleRef.value) {
          const words = Array.from(titleRef.value.children)
          const midPoint = Math.floor(words.length / 2)
          textAnim = gsap.timeline()
          if (dateRef.value) textAnim.from(dateRef.value, { opacity: 0, duration: 0.5 })
          if (words.slice(0, midPoint).length) textAnim.from(words.slice(0, midPoint), { opacity: 0, y: 10, duration: 1, stagger: 0.1 })
          if (words.slice(midPoint).length) textAnim.from(words.slice(midPoint), { opacity: 0, y: 10, duration: 1, stagger: 0.1 }, "+=1.5")
          if (descRef.value) textAnim.from(descRef.value, { opacity: 0, duration: 1 }, "+=0.5")
      }
      else if (mode === 'glitch-decode' && titleRef.value) {
          const words = titleRef.value.children
          textAnim = gsap.timeline()
          textAnim.fromTo(words, { opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.1, stagger: { each: 0.1, repeat: 3, yoyo: true } })
          textAnim.to(words, { opacity: 1, duration: 0.1 })
          masterTimeline.call(() => playSfx('ui', 'mixkit-sci-fi-interface-robot-click-901.wav'), [], pacingConfig.textDelay)
      }

      // ✅ FIX 4: If it's a standard style (fade-words, cinema-caption, epic-scale, etc)
      // We let your `cinematic-styles.ts` do its job to restore the unique variety!
      if (!textAnim) {
          textAnim = style.textAnimation(textElements)
      }

      masterTimeline.add(textAnim, pacingConfig.textDelay)
      
      // Flash Effect Support
      const flash = containerRef.value?.querySelector('.flash-layer');
      if (style.name === 'Freeze Frame Flash' && flash) {
          masterTimeline.to(flash, { opacity: 1, duration: 0.1, ease: 'none' }, pacingConfig.textDelay - 0.1)
          masterTimeline.to(flash, { opacity: 0, duration: 1.5, ease: 'power3.out' }, pacingConfig.textDelay)
          masterTimeline.call(() => playSfx('ui', 'mixkit-camera-shutter-hard-click-1430.wav'), [], pacingConfig.textDelay - 0.1)
      }
      
      // Hero Shake
      if (style.name === 'Hero Entrance' && activeBg) {
          masterTimeline.to(activeBg, { 
              x: () => (Math.random() * 10 - 5), 
              y: () => (Math.random() * 10 - 5), 
              duration: 0.05, 
              repeat: 10, 
              yoyo: true 
          }, impactTime)
      }

      if (!shouldPlayImpact && !isSilentScene && mode !== 'typewriter') {
           masterTimeline.call(() => playSfx('text'), [], pacingConfig.textDelay)
      }
  }

  // Exit
  const exitTime = sceneDuration - pacingConfig.exitBlur
  if (style.exitAnimation && overlayRef.value && activeBg) {
      masterTimeline.add(style.exitAnimation(textElements, overlayRef.value, activeBg), exitTime)
  } else {
      masterTimeline.to(textElements, { opacity: 0, filter: 'blur(5px)', duration: pacingConfig.exitBlur, stagger: 0.1 }, exitTime)
      if (overlayRef.value) masterTimeline.to(overlayRef.value, { opacity: 1, duration: pacingConfig.exitBlur + 0.5 }, exitTime)
  }

  } catch (error) {
      console.error("🔥 Cinematic Crash Detected:", error);
      
      // 🛡️ SAFETY 3: THE EMERGENCY FALLBACK
      // If ANYTHING crashes above, force the slide to show so the user sees content
      if (titleRef.value) gsap.to(titleRef.value, { opacity: 1, duration: 0.5 });
      if (descRef.value) gsap.to(descRef.value, { opacity: 1, duration: 0.5 });
      if (bgImageRef.value) gsap.to(bgImageRef.value, { opacity: 1, duration: 0.5 });
  }
}

function cleanup() {
    if (masterTimeline) masterTimeline.kill()
    stopAll() 
    if (currentSpecialFx.value) { currentSpecialFx.value.pause(); currentSpecialFx.value = null }
}

watch([currentIndex, currentEvent], async () => {
    // ✅ FIX 5: Clean up stale properties left on children `<span>` tags from previous slides
    if (titleRef.value) {
        gsap.set([titleRef.value, descRef.value, dateRef.value], { clearProps: 'all', opacity: 0 })
        if (titleRef.value.children.length) gsap.set(titleRef.value.children, { clearProps: 'all' })
    }
    if (bgImageRef.value) gsap.set(bgImageRef.value, { clearProps: 'all', opacity: 0 })
    if (bgGradientRef.value) gsap.set(bgGradientRef.value, { clearProps: 'all', opacity: 0 })

    await nextTick()
    if (!currentEvent.value) return
    runScene(currentIndex.value)
})

watch(isPlaying, (val) => {
    if (val) {
        resumeAudio() 
        if (masterTimeline && masterTimeline.progress() > 0 && masterTimeline.progress() < 1) masterTimeline.play()
        else runScene(currentIndex.value)
    } else {
        if (masterTimeline) masterTimeline.pause()
        pauseAudio()
    }
})

onMounted(async () => {
    await nextTick()
    initAudio()
    if (audioRef.value) setBgmRef(audioRef.value)
    playDynamicBgm(props.audioMode || 'timeline') 
    window.addEventListener('keydown', handleKeydown)
    if (props.modelValue && props.events.length > 0) runScene(currentIndex.value)
})

onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); cleanup() })
</script>

<template>
  <div 
    class="fixed inset-0 bg-black text-white z-[9999] flex flex-col justify-center items-center px-6 overflow-hidden font-sans select-none"
    style="z-index: 999999 !important;"
    ref="containerRef"
  >
    <audio ref="audioRef" loop preload="auto" crossorigin="anonymous"></audio>

    <button 
        @click="closeStory" 
        class="group absolute z-50 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors 
               top-6 right-6 
               md:top-auto md:bottom-12 md:right-10"
    >
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:text-red-400 transition-all duration-300 bg-white/5 backdrop-blur-sm shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
    </button>
    
    <button 
        @click="toggleMute" 
        class="group absolute z-50 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors 
               top-6 left-6 
               md:top-auto md:bottom-12 md:left-10"
    >
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:scale-110 transition-all duration-300 bg-white/5 backdrop-blur-sm shadow-lg">
            <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
        </div>
    </button>

    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden" :key="`visuals-${currentIndex}`">
        <div class="absolute inset-0 bg-black">
             <img v-if="currentImage" :src="currentImage" ref="bgImageRef" class="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.1] blur-[1px] opacity-0 will-change-transform" alt="Cinematic Background" />
             <div v-else ref="bgGradientRef" class="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-black opacity-0 will-change-transform">
                <div class="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
             </div>
        </div>
        
        <div ref="overlayRef" class="absolute inset-0 z-10 opacity-100 transition-overlay" :class="overlayClass"></div>
        <div class="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none film-grain z-20"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0.95)_100%)] z-20"></div>
        <div class="letterbox-top absolute top-0 left-0 w-full h-[12vh] bg-black z-30 transform -translate-y-full will-change-transform"></div>
        <div class="letterbox-bottom absolute bottom-0 left-0 w-full h-[12vh] bg-black z-30 transform translate-y-full will-change-transform"></div>
        <div class="flash-layer absolute inset-0 bg-white z-40 opacity-0 pointer-events-none will-change-transform"></div>
    </div>

    <div class="relative z-30 flex flex-col items-center max-w-6xl w-full text-center space-y-6 px-4 overflow-x-hidden transition-all duration-500" 
         :class="contentScale.containerClass"
         :key="`content-${currentIndex}`">
        
        <div class="text-sm md:text-lg font-cinematic font-bold tracking-[0.3em] uppercase text-indigo-400 opacity-0 transform translate-y-10" ref="dateRef">
         {{ currentEvent?.date }}
        </div>

        <h1 class="font-black tracking-tighter opacity-0 leading-tight drop-shadow-2xl transform translate-y-10" 
            :class="[
                currentStyle?.textMode === 'handwritten' ? 'font-handwritten' : 'font-cinematic',
                contentScale.titleClass 
            ]"
            ref="titleRef">
             <template v-if="shouldSplitText">
                 <span v-for="(word, i) in titleWords" :key="i" class="inline-block mr-[0.25em] whitespace-nowrap">{{ word }}</span>
             </template>
             <template v-else>
                 {{ currentEvent?.title }}
             </template>
        </h1>

        <p class="max-w-4xl opacity-0 leading-relaxed font-light transform translate-y-10" 
           :class="[
               currentStyle?.textMode === 'handwritten' ? 'font-handwritten' : 'font-body text-gray-200',
               contentScale.descClass
           ]"
           ref="descRef">
        {{ currentEvent?.description }}
        </p>
    </div>

    <div class="absolute bottom-12 landscape:bottom-6 w-full z-40 flex justify-center items-center gap-8 md:gap-12 transition-all duration-300">
        <button 
            @click="prev" 
            class="group text-white/30 hover:text-white transition-all duration-300 p-3 md:p-4 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none"
            :disabled="currentIndex === 0"
        >
            <span class="sr-only">Previous</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
        
        <button 
            @click="togglePlay"
            class="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 shadow-xl"
        >
             <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 md:w-8 md:h-8 ml-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 md:w-8 md:h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
        </button>

        <button 
            @click="next" 
             class="group text-white/30 hover:text-white transition-all duration-300 p-3 md:p-4 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
        >
             <span class="sr-only">Next</span>
             <svg v-if="currentIndex < props.events.length - 1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </button>
    </div>

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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&family=Open+Sans:wght@300;400&family=Caveat:wght@400..700&display=swap');

.font-handwritten {
  font-family: 'Caveat', cursive;
}

.font-cinematic {
  font-family: 'Montserrat', sans-serif;
}

.font-body {
  font-family: 'Open Sans', sans-serif;
}

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

/* Hide Scrollbar but allow scrolling */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>
