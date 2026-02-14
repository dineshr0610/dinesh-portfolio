import { ref, onMounted, onUnmounted } from 'vue'
import { SFX_MAPPING, SFX_CATEGORIES, type SfxCategory, detectEmotionalImpact } from '~/utils/sfx-library'

// Global State (Singleton pattern for audio persistence)
const isMuted = ref(false)
const bgmVolume = ref(0.4)
const masterVolume = ref(1.0)

// Audio Cache (Global Singleton)
const sfxCache: Record<SfxCategory, HTMLAudioElement[]> = {
    [SFX_CATEGORIES.TRANSITION]: [],
    [SFX_CATEGORIES.IMPACT]: [],
    [SFX_CATEGORIES.AMBIENCE]: [],
    [SFX_CATEGORIES.TEXT]: [],
    [SFX_CATEGORIES.UI]: [],
    [SFX_CATEGORIES.SPECIAL]: [],
    [SFX_CATEGORIES.RISER]: [],
    [SFX_CATEGORIES.REVERSE]: []
}

// Track active SFX for pause/resume (Global Singleton)
const activeSfx = ref<HTMLAudioElement[]>([])
const sfxInitialized = ref(false)

export function useCinematicAudio() {
    // Cooldown State
    let lastImpactTime = 0

    const bgmRef = ref<HTMLAudioElement | null>(null)
    const ambienceRef = ref<HTMLAudioElement | null>(null)

    // Initialize
    function initAudio() {
        if (typeof window === 'undefined') return
        if (sfxInitialized.value) return // Prevent double init

        // Preload SFX
        Object.entries(SFX_MAPPING).forEach(([category, files]) => {
            files.forEach(file => {
                const audio = new Audio(`/content/audio/sfx/${file}`)
                audio.preload = 'auto' // Force buffer
                audio.load() // Explicit load

                // Set volume baselines (User Hierarchy: Impact > Transition > BGM)
                if (category === SFX_CATEGORIES.IMPACT) audio.volume = 0.3
                else if (category === SFX_CATEGORIES.TEXT) audio.volume = 0.05
                else if (category === SFX_CATEGORIES.TRANSITION) audio.volume = 0.1
                else audio.volume = 0.15

                sfxCache[category as SfxCategory].push(audio)
            })
        })
        sfxInitialized.value = true

        // Init BGM loop (handled by StoryPlayer currently, but should be moved here partially)
    }

    // Play Helper
    function playSfx(category: SfxCategory, specificFile?: string, options: { startTime?: number } = {}) {
        if (isMuted.value) return

        // STEP 5 & 8: Impact Cooldown
        if (category === SFX_CATEGORIES.IMPACT) {
            const now = Date.now()
            if (now - lastImpactTime < 1000) return // Prevent overlapping impacts < 1s
            lastImpactTime = now
        }

        const sounds = sfxCache[category]
        if (!sounds.length) return

        let sound: HTMLAudioElement | undefined

        if (specificFile) {
            // Find specific file (substring match on src)
            sound = sounds.find(s => s.src.includes(specificFile))
        }

        // Fallback to random if not found or not specified
        if (!sound) {
            sound = sounds[Math.floor(Math.random() * sounds.length)]
        }

        if (!sound) return

        const clone = sound.cloneNode() as HTMLAudioElement

        // STEP 5: Prevent Glitches
        clone.currentTime = options.startTime || 0
        clone.preload = "auto"
        clone.volume = sound.volume * masterVolume.value

        // Track unique SFX
        activeSfx.value.push(clone)

        clone.onended = () => {
            activeSfx.value = activeSfx.value.filter(s => s !== clone)
            clone.remove()
        }
        clone.play().catch(() => { })

        // Duck BGM if Impact
        if (category === SFX_CATEGORIES.IMPACT) {
            duckBgm()
        }
    }

    let fadeId: number | null = null

    // Helper to manage BGM volume
    function fadeBgm(targetVolume: number, duration: number = 1000) {
        if (!bgmRef.value) return

        if (fadeId) cancelAnimationFrame(fadeId)

        const startVolume = bgmRef.value.volume
        const startTime = performance.now()

        function animate(time: number) {
            const elapsed = time - startTime
            const progress = Math.min(elapsed / duration, 1)

            if (bgmRef.value) {
                const currentVol = startVolume + (targetVolume - startVolume) * progress
                bgmRef.value.volume = currentVol
            }

            if (progress < 1) {
                fadeId = requestAnimationFrame(animate)
            } else {
                fadeId = null
            }
        }
        fadeId = requestAnimationFrame(animate)
    }

    function duckBgm() {
        if (!bgmRef.value) return
        // Fade down quickly to 0.2
        fadeBgm(0.2, 300)
        // Restore after 2s
        setTimeout(() => {
            // Check if we are still playing (don't restore if stopped)
            if (bgmRef.value && !bgmRef.value.paused) {
                fadeBgm(bgmVolume.value, 1500)
            }
        }, 2000)
    }

    function playAmbience() {
        // Disabled by user request, but keeping function structure for API compatibility
        return
    }

    // Expose refs for external binding
    function setBgmRef(audioElement: HTMLAudioElement) {
        bgmRef.value = audioElement
        bgmRef.value.volume = bgmVolume.value
    }

    function toggleMute() {
        isMuted.value = !isMuted.value

        if (isMuted.value) {
            // Mute active tracks
            if (bgmRef.value) bgmRef.value.volume = 0
            if (ambienceRef.value) ambienceRef.value.volume = 0
        } else {
            // Restore valumes
            if (bgmRef.value) bgmRef.value.volume = bgmVolume.value
            if (ambienceRef.value) ambienceRef.value.volume = 0.08 // Low ambience
        }
    }

    // Global kill switch
    function stopAll() {
        if (fadeId) {
            cancelAnimationFrame(fadeId)
            fadeId = null
        }

        // 1. Stop BGM
        if (bgmRef.value) {
            bgmRef.value.pause()
            bgmRef.value.currentTime = 0
            bgmRef.value.volume = 0
        }

        // 2. Stop Ambience
        if (ambienceRef.value) {
            ambienceRef.value.pause()
            ambienceRef.value.currentTime = 0
            ambienceRef.value = null
        }

        // 3. Stop Active SFX
        activeSfx.value.forEach(s => {
            s.pause()
            s.currentTime = 0
        })
        activeSfx.value = []
    }

    // BGM Logic
    function playDynamicBgm(mode: 'timeline' | 'gallery' = 'timeline') {
        if (typeof window === 'undefined' || !bgmRef.value) return

        // 1. Calculate Track
        const now = new Date()
        const minutes = now.getMinutes()
        const trackIndex = minutes % 10 // 0-9.mp3

        const primarySrc = `/content/audio/${mode}/${trackIndex}.mp3`
        const fallbackSrc = `/content/audio/timeline/1.mp3` // Always fallback to safe timeline text

        // 2. Setup Error Handling
        bgmRef.value.onerror = () => {
            if (bgmRef.value && !bgmRef.value.src.endsWith('1.mp3')) {
                console.warn(`Track ${trackIndex} missing in ${mode}, falling back.`)
                bgmRef.value.src = fallbackSrc
                bgmRef.value.play().catch(() => { })
            }
        }

        // 3. Play
        bgmRef.value.src = primarySrc
        bgmRef.value.volume = 0.1 // Start audible but low
        bgmRef.value.play().then(() => {
            // Faster fade in (1s instead of 2s)
            fadeBgm(bgmVolume.value, 1000)
        }).catch(e => console.error("BGM Autoplay prevented:", e))
    }

    function softFadeIn() {
        if (!bgmRef.value) return
        // Step 1: Small dip/reset
        fadeBgm(0.3, 400)
        // Step 2: Ramp up to full volume
        setTimeout(() => {
            fadeBgm(bgmVolume.value, 1200)
        }, 500)
    }
    function pauseAudio() {
        if (bgmRef.value) bgmRef.value.pause()
        if (ambienceRef.value) ambienceRef.value.pause()
        activeSfx.value.forEach(s => s.pause())
    }

    function resumeAudio() {
        if (bgmRef.value && !isMuted.value) bgmRef.value.play().catch(() => { })
        if (ambienceRef.value && !isMuted.value) ambienceRef.value.play().catch(() => { })
        activeSfx.value.forEach(s => s.play().catch(() => { }))
    }

    return {
        initAudio,
        playSfx,
        playAmbience,
        playDynamicBgm,
        stopAll,
        duckBgm,
        fadeBgm,
        softFadeIn,
        setBgmRef,
        detectEmotionalImpact,
        toggleMute,
        isMuted,
        pauseAudio,
        resumeAudio
    }
}
