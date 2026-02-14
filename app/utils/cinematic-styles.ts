import gsap from 'gsap'

export interface CinematicStyle {
    name: string
    category: 'Camera' | 'Light' | 'Type' | 'Frame' // New Categories

    // Composition Overrides
    textAlignment?: 'center' | 'left' | 'right' | 'bottom-left' | 'top-left' // Default 'center'
    letterbox?: boolean // Adds cinematic black bars (10vh)
    blurBackground?: boolean // Adds backdrop blur

    // Visuals
    overlayClass?: string
    filter?: string
    textColor?: string
    textShadow?: string // STEP 4: Contrast-Based Shadow
    // STEP 15: Text Personality Engine
    textMode?: 'typewriter' | 'handwritten' | 'stroke-draw' | 'fade-words' | 'cinema-caption' | 'epic-scale' | 'ghost-reveal' | 'glitch-decode' | 'dramatic-pause' | 'word-by-word'

    // Timing
    duration?: number // Default 12s

    // Font Size Overrides (for Smart Text Sizer)
    titleSize?: string
    descSize?: string


    // Animation Functions
    imageAnimation: (target: HTMLElement) => gsap.core.Timeline
    textAnimation: (targets: HTMLElement[]) => gsap.core.Timeline

    // Custom Exit (Optional)
    exitAnimation?: (textTargets: HTMLElement[], overlay: HTMLElement, bg: HTMLElement) => gsap.core.Timeline
}

type StyleDefinition = Omit<CinematicStyle, 'category'>

// =============================================================================
// 🎥 GROUP 1: CAMERA MOVEMENT (10 Styles)
// Focus: Motion, Pacing, Direction
// =============================================================================
const cameraStyles: StyleDefinition[] = [
    {
        name: 'Slow Push In', // Documentary Classic
        duration: 14,
        textAlignment: 'bottom-left',
        textColor: 'text-gray-100',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        filter: 'contrast(1.1)',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.15, duration: 14, ease: 'sine.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 20, duration: 2, stagger: 0.3 })
    },
    {
        name: 'Slow Pull Out', // Memory/Reflection
        duration: 15,
        textAlignment: 'center',
        textColor: 'text-indigo-50',
        textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        filter: 'sepia(0.1) contrast(1.05)',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.05, duration: 15, ease: 'sine.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, scale: 0.95, duration: 3, stagger: 0.5 })
    },
    {
        name: 'Left Tracking', // Sideways Motion
        duration: 12,
        textAlignment: 'right',
        textColor: 'text-white',
        textShadow: '0 0 30px rgba(0,0,0,0.9)',
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, x: 0 }, { scale: 1.1, x: -50, duration: 12, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: 30, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Right Tracking',
        duration: 12,
        textAlignment: 'left',
        textColor: 'text-white',
        textShadow: '0 0 30px rgba(0,0,0,0.9)',
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, x: 0 }, { scale: 1.1, x: 50, duration: 12, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: -30, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Top Reveal', // Scale Down
        duration: 11,
        textAlignment: 'center',
        textColor: 'text-cyan-50',
        textShadow: '0 0 15px rgba(0,255,255,0.3)',
        textMode: 'ghost-reveal', // Tech feel
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2, y: -20 }, { scale: 1.0, y: 0, duration: 11, ease: 'power1.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: -20, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Bottom Rise', // Hero Shot
        duration: 13,
        textAlignment: 'center',
        textColor: 'text-amber-50',
        textShadow: '0 2px 20px rgba(255,180,80,0.4)',
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, y: 20 }, { scale: 1.1, y: -20, duration: 13, ease: 'sine.inOut' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 50, duration: 1.5, stagger: 0.3, ease: 'power2.out' })
    },
    {
        name: 'Diagonal Drift',
        duration: 14,
        textAlignment: 'bottom-left',
        textColor: 'text-gray-200',
        textShadow: '1px 1px 5px rgba(0,0,0,0.8)',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.15, x: -20, y: -20 }, { scale: 1.15, x: 0, y: 0, duration: 14, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Micro Handheld', // Subtle realism
        duration: 12,
        filter: 'contrast(1.05)',
        textColor: 'text-stone-200',
        textMode: 'handwritten', // Personal feel
        imageAnimation: (t) => gsap.timeline()
            .fromTo(t, { scale: 1.05 }, { scale: 1.08, duration: 12 })
            .to(t, { x: 3, y: -2, duration: 4, yoyo: true, repeat: 2, ease: 'sine.inOut' }, 0),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 1.5 })
    },
    {
        name: 'Static Frame', // Pure drama
        duration: 10,
        textAlignment: 'center',
        letterbox: true,
        textColor: 'text-white',
        textShadow: '0 0 0 rgba(0,0,0,0)', // Clean
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().set(t, { scale: 1.0 }), // Absolutely still
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Slow Tilt',
        duration: 14,
        textAlignment: 'right',
        textColor: 'text-indigo-100',
        textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, rotation: -1 }, { scale: 1.1, rotation: 1, duration: 14, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: 20, duration: 2, stagger: 0.2 })
    }
]

// =============================================================================
// 🌅 GROUP 2: LIGHT & COLOR (8 Styles)
// Focus: Mood, Atmosphere, Tone
// =============================================================================
const lightStyles: StyleDefinition[] = [
    {
        name: 'Golden Memory',
        duration: 14,
        textAlignment: 'center',
        textColor: 'text-orange-100',
        textShadow: '0 0 15px rgba(255,165,0,0.6)',
        filter: 'sepia(0.4) contrast(1.1) brightness(1.1) saturate(1.2)',
        overlayClass: 'bg-gradient-to-t from-black via-orange-900/20 to-transparent mix-blend-overlay',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 14 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 20, duration: 2 })
    },
    {
        name: 'Blue Hour', // Cool vignette
        duration: 12,
        textAlignment: 'bottom-left',
        textColor: 'text-cyan-100',
        textShadow: '0 0 10px rgba(0,100,255,0.4)',
        filter: 'brightness(0.9) contrast(1.1) saturate(0.8)',
        overlayClass: 'bg-gradient-to-t from-black via-blue-900/20 to-transparent',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.0, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.3 })
    },
    {
        name: 'High Contrast B&W', // Noir
        duration: 10,
        textAlignment: 'center',
        textColor: 'text-white',
        textShadow: '4px 4px 0px black', // Graphic
        filter: 'grayscale(1) contrast(1.4) brightness(0.9)',
        overlayClass: 'bg-gradient-to-t from-black via-transparent to-transparent opacity-80',
        letterbox: true,
        textMode: 'typewriter',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.15, duration: 10 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 10, duration: 1, stagger: 0.1 })
    },
    {
        name: 'Soft Dream',
        duration: 15,
        blurBackground: true,
        textAlignment: 'center',
        textColor: 'text-rose-50',
        textShadow: '0 0 20px white',
        filter: 'brightness(1.1) contrast(0.9)',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05, filter: 'blur(3px)' }, { scale: 1.1, filter: 'blur(5px)', duration: 15 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, filter: 'blur(10px)', duration: 3, stagger: 0.5 })
    },
    {
        name: 'Deep Shadow',
        duration: 12,
        textAlignment: 'center',
        textColor: 'text-gray-300',
        textShadow: '0 2px 5px black',
        filter: 'brightness(0.6) contrast(1.3)',
        overlayClass: 'bg-gradient-to-t from-black via-black/80 to-transparent',
        textMode: 'ghost-reveal',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.0, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, scale: 0.9, duration: 2 })
    },
    {
        name: 'Desaturated Minimal',
        duration: 11,
        textAlignment: 'left',
        textColor: 'text-slate-200',
        textShadow: 'none',
        filter: 'saturate(0.2) contrast(1.1)',
        overlayClass: 'bg-gradient-to-t from-black via-black/40 to-transparent',
        textMode: 'typewriter',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 30 }, { x: 0, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: -20, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Emerald Tone', // Matrix/Fincher
        duration: 13,
        textAlignment: 'bottom-left',
        textColor: 'text-emerald-100',
        textShadow: '0 0 8px rgba(0,255,0,0.3)',
        filter: 'contrast(1.2) brightness(0.9)',
        overlayClass: 'bg-gradient-to-t from-black via-emerald-900/20 to-transparent',
        textMode: 'ghost-reveal',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 13 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2 })
    },
    {
        name: 'Dramatic Spotlight',
        duration: 10,
        textAlignment: 'center',
        letterbox: true,
        textColor: 'text-yellow-50',
        textShadow: '0 10px 30px black',
        filter: 'contrast(1.3)',
        overlayClass: 'bg-gradient-to-t from-black via-transparent to-black opacity-80',
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.2, duration: 10 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 30, duration: 1.5, ease: 'power2.out' })
    }
]

// =============================================================================
// 📝 GROUP 3: TYPOGRAPHY (6 Styles)
// Focus: Text Presentation, Reading Flow
// =============================================================================
const typeStyles: StyleDefinition[] = [
    {
        name: 'Hero Title',
        duration: 11,
        textAlignment: 'center',
        textColor: 'text-white',
        textShadow: '0 4px 60px rgba(255,255,255,0.5)',
        filter: 'brightness(0.5)',
        overlayClass: 'bg-black/40',
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.0 }, { scale: 1.05, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { scale: 1.5, opacity: 0, duration: 1.5, stagger: 0.2, ease: 'power3.out' })
    },
    {
        name: 'Side Caption',
        duration: 12,
        textAlignment: 'left',
        letterbox: true,
        textColor: 'text-zinc-100',
        textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
        overlayClass: 'bg-gradient-to-r from-black/80 via-transparent to-transparent',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 0 }, { x: -50, duration: 12 }), // Pan to make room
        textAnimation: (ts) => gsap.timeline().from(ts, { x: -50, opacity: 0, duration: 1.5, stagger: 0.1, ease: 'power2.out' })
    },
    {
        name: 'Minimal Date',
        duration: 10,
        textAlignment: 'bottom-left',
        textColor: 'text-gray-100',
        overlayClass: 'bg-gradient-to-t from-black via-transparent to-transparent',
        textMode: 'typewriter',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.0, duration: 10 }),
        textAnimation: (ts) => {
            // Filter out potentially undefined elements first
            const validTargets = ts.filter((el): el is HTMLElement => !!el)
            const secondary = validTargets.slice(1) // Get everything after first element

            const tl = gsap.timeline()
            // Check if first element exists
            if (validTargets[0]) {
                tl.from(validTargets[0], { opacity: 0, duration: 1 })
            }
            if (secondary.length) tl.from(secondary, { opacity: 0, x: -10, duration: 1, stagger: 0.2 }, 1)
            return tl
        }
    },
    {
        name: 'Typewriter',
        duration: 13,
        textAlignment: 'left',
        textColor: 'text-green-50', // Terminal vibe
        textShadow: '0 0 10px rgba(0,255,0,0.6)',
        filter: 'contrast(1.1)',
        textMode: 'typewriter',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.05, duration: 13 }), // Static
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.1, ease: 'steps(10)' }) // subtle stepper
    },
    {
        name: 'Fade Words',
        duration: 11,
        textAlignment: 'center',
        textColor: 'text-slate-300',
        textShadow: '0 0 20px rgba(255,255,255,0.2)',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.2, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, blur: 10, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Cascade',
        duration: 12,
        textAlignment: 'right',
        textColor: 'text-cyan-50',
        textShadow: '2px 2px 10px rgba(0,0,0,0.3)',
        textMode: 'fade-words', // Changed from word-reveal to match supported types
        imageAnimation: (t) => gsap.timeline().fromTo(t, { y: 0 }, { y: -30, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { y: 20, opacity: 0, duration: 1.5, stagger: 0.3, ease: 'back.out(1)' })
    }
]

// =============================================================================
// 🎞 GROUP 4: FRAME & COMPOSITION (6 Styles)
// Focus: Layout, Borders, Layers
// =============================================================================
const frameStyles: StyleDefinition[] = [
    {
        name: 'Letterbox Cinema',
        duration: 14,
        letterbox: true,
        textAlignment: 'center',
        textColor: 'text-amber-50',
        textShadow: '0 2px 20px black',
        filter: 'contrast(1.2)',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.0 }, { scale: 1.1, duration: 14 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Center Spotlight',
        duration: 12,
        textAlignment: 'center',
        textColor: 'text-white',
        textShadow: '0 0 30px rgba(255,255,255,0.8)',
        overlayClass: 'bg-radial-gradient from-transparent to-black/90', // Heavy vignette
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.0, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { scale: 0.8, opacity: 0, duration: 1.5, ease: 'power2.out' })
    },
    {
        name: 'Split Layout', // Hacky split via hard pan
        duration: 12,
        textAlignment: 'left',
        textColor: 'text-gray-100',
        textShadow: '1px 1px 2px black',
        overlayClass: 'bg-gradient-to-r from-black via-black/50 to-transparent', // Darken left side
        textMode: 'typewriter',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 0 }, { x: 100, duration: 12 }), // Push image right
        textAnimation: (ts) => gsap.timeline().from(ts, { x: -50, opacity: 0, duration: 2, stagger: 0.2 })
    },
    {
        name: 'Background Blur',
        duration: 15,
        blurBackground: true,
        textAlignment: 'center',
        textColor: 'text-white',
        textShadow: '0 0 10px rgba(0,0,0,0.5)',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.15, duration: 15 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 3 })
    },
    {
        name: 'Soft Edge',
        duration: 13,
        textAlignment: 'center',
        textColor: 'text-rose-50',
        textShadow: '0 2px 15px rgba(0,0,0,0.3)',
        overlayClass: 'bg-black/20 ring-[50px] ring-black/80 ring-inset', // Inner border hack
        textMode: 'handwritten',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 13 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 10, duration: 2, stagger: 0.3 })
    },
    {
        name: 'Slow Cross Dissolve',
        duration: 14,
        textAlignment: 'center',
        filter: 'contrast(0.9) brightness(1.1)',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { opacity: 0 }, { opacity: 1, duration: 4 }), // Slow fade in
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 4, stagger: 1 })
    }
]

// =============================================================================
// 🌟 GROUP 5: SIGNATURE "WOW" STYLES (Premium Additions)
// =============================================================================
const signatureStyles: StyleDefinition[] = [
    {
        name: 'Hero Entrance', // 1
        duration: 13,
        textAlignment: 'center',
        letterbox: true,
        textColor: 'text-white',
        textShadow: '0 10px 40px rgba(0,0,0,0.8)',
        textMode: 'epic-scale',
        // Note: Screen shake and sub-bass impact are handled in StoryPlayer.vue via name matching
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.0 }, { scale: 1.15, duration: 13, ease: 'power2.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { scale: 3, opacity: 0, duration: 2, stagger: 0.3, ease: 'expo.out' })
    },
    {
        name: 'Documentary Memory', // 2
        duration: 15,
        textAlignment: 'bottom-left',
        textColor: 'text-amber-50',
        filter: 'sepia(0.3) contrast(1.1) brightness(0.9)',
        textMode: 'typewriter',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.0, duration: 15, ease: 'sine.inOut' }),
        textAnimation: (ts) => {
            const tl = gsap.timeline();
            if (ts[0]) tl.from(ts[0], { opacity: 0, duration: 1 }); // Date
            if (ts[1]) tl.fromTo(ts[1], { text: "" }, { text: ts[1].innerText, duration: ts[1].innerText.length * 0.05, ease: "none" }, "+=0.5"); // Title
            if (ts[2]) tl.from(ts[2], { opacity: 0, duration: 1.5 }, "+=0.5"); // Desc
            return tl;
        }
    },
    {
        name: 'Epic Trailer Moment', // 3
        duration: 12,
        textAlignment: 'center',
        textColor: 'text-white',
        overlayClass: 'bg-black/60',
        textMode: 'epic-scale',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 50, scale: 0.9, duration: 2, stagger: 0.4, ease: 'back.out(1.5)' }),
        exitAnimation: (ts, overlay, bg) => gsap.timeline().to([ts, overlay, bg], { opacity: 0, duration: 1.5, ease: 'power2.inOut' }) // Fade to black exit
    },
    {
        name: 'Cinematic Silence', // 4
        duration: 10,
        textAlignment: 'center',
        textColor: 'text-gray-200',
        filter: 'contrast(1.1) grayscale(0.2)',
        textMode: 'fade-words',
        // Handled in StoryPlayer: Mutes all SFX
        imageAnimation: (t) => gsap.timeline().set(t, { scale: 1.0 }), // Completely static
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 3, stagger: 1, ease: 'power1.inOut' })
    },
    {
        name: 'Split Frame Composition', // 5
        duration: 14,
        textAlignment: 'left',
        textColor: 'text-white',
        overlayClass: 'bg-gradient-to-r from-black via-black/80 to-transparent',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 0, scale: 1.1 }, { x: 100, scale: 1.1, duration: 14, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { x: -40, opacity: 0, duration: 1.5, stagger: 0.3 })
    },
    {
        name: 'Handwritten Reveal', // 6
        duration: 13,
        textAlignment: 'center',
        textColor: 'text-slate-200',
        textMode: 'handwritten',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 13 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2 }) // Fallback, actual wipe handled in Vue
    },
    {
        name: 'Word-by-Word Impact', // 7
        duration: 11,
        textAlignment: 'center',
        textColor: 'text-white',
        textMode: 'word-by-word', // Custom mode for Vue
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.15, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 1 }) // Handled in Vue
    },
    {
        name: 'Scramble Decode', // 8 (Free Tech Fallback)
        duration: 12,
        textAlignment: 'center',
        textColor: 'text-cyan-400',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
        filter: 'contrast(1.2) brightness(0.9)',
        textMode: 'glitch-decode', // Custom mode for Vue
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, filter: 'hue-rotate(0deg)' }, { scale: 1.1, filter: 'hue-rotate(15deg)', duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 1 }) // Handled in Vue
    },
    {
        name: 'Minimal Date Emphasis', // 9
        duration: 10,
        textAlignment: 'bottom-left',
        textColor: 'text-zinc-300',
        textMode: 'fade-words',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.0, duration: 10 }),
        textAnimation: (ts) => {
            const tl = gsap.timeline();
            if (ts[0]) tl.from(ts[0], { opacity: 0, y: 10, duration: 1.5 }); // Date first
            if (ts[1]) tl.from(ts[1], { opacity: 0, duration: 2 }, "+=1"); // Title delayed
            if (ts[2]) tl.from(ts[2], { opacity: 0, duration: 1.5 }, "+=0.5"); // Desc later
            return tl;
        }
    },
    {
        name: 'Dramatic Pause Text', // 10
        duration: 13,
        textAlignment: 'center',
        textColor: 'text-white',
        textMode: 'dramatic-pause', // Custom mode for Vue
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.05, duration: 13 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 1 }) // Handled in Vue
    },
    {
        name: 'Freeze Frame Flash', // 16
        duration: 10,
        textAlignment: 'center',
        textColor: 'text-white',
        textMode: 'cinema-caption',
        // Image freezes instantly after the flash (Flash element added in Vue)
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.2, duration: 10 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 0.1 }) // Pops in instantly
    },
    {
        name: 'Reverse Memory', // 18
        duration: 12,
        textAlignment: 'center',
        textColor: 'text-gray-300',
        textShadow: '0 0 15px rgba(255,255,255,0.2)',
        filter: 'sepia(0.2)',
        textMode: 'fade-words',
        // Background slowly shrinks/fades backwards
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2, opacity: 1 }, { scale: 1.0, opacity: 0.4, duration: 12, ease: 'power1.inOut' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, filter: 'blur(10px)', duration: 3, stagger: 0.5 })
    },
    {
        name: 'Slow Motion Drop', // 19
        duration: 14,
        textAlignment: 'center',
        textColor: 'text-white',
        textMode: 'epic-scale',
        // Dramatic slow zoom out
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.3, y: -20 }, { scale: 1.0, y: 0, duration: 14, ease: 'power3.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { y: -50, opacity: 0, duration: 2, ease: 'bounce.out' })
    },
    {
        name: 'Director\'s Cut Frame', // 20
        duration: 15,
        textAlignment: 'bottom-left',
        letterbox: true,
        textColor: 'text-zinc-100',
        textMode: 'cinema-caption',
        imageAnimation: (t) => gsap.timeline().set(t, { scale: 1.0 }), // Static frame
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: -20, duration: 1.5, stagger: 0.2 })
    }
]

// =============================================================================
// 🧠 EXPORT ENGINE
// =============================================================================

function mapCategory(style: StyleDefinition, cat: CinematicStyle['category']): CinematicStyle {
    return { ...style, category: cat } as CinematicStyle
}

const ALL_STYLES: CinematicStyle[] = [
    ...cameraStyles.map(s => mapCategory(s, 'Camera')),
    ...lightStyles.map(s => mapCategory(s, 'Light')),
    ...typeStyles.map(s => mapCategory(s, 'Type')),
    ...frameStyles.map(s => mapCategory(s, 'Frame')),
    ...signatureStyles.map(s => mapCategory(s, 'Frame')) // Added new styles!
]

// =============================================================================
// 🌟 RANDOMIZED SHUFFLE ENGINE
// =============================================================================

export function getCinematicStyle(index: number, seed: number): CinematicStyle {
    // We use the seed passed from the player to ensure every session is different.
    // We multiply by a prime number (17) to "jump" deeply into the array.
    const styleIndex = ((index + seed) * 17) % ALL_STYLES.length

    return ALL_STYLES[styleIndex] || ALL_STYLES[0] as CinematicStyle
}
