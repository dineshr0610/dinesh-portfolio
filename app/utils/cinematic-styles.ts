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

    // Timing
    duration?: number // Default 12s

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
        filter: 'contrast(1.1)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.15, duration: 14, ease: 'sine.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 20, duration: 2, stagger: 0.3 })
    },
    {
        name: 'Slow Pull Out', // Memory/Reflection
        duration: 15,
        textAlignment: 'center',
        filter: 'sepia(0.1) contrast(1.05)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.05, duration: 15, ease: 'sine.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, scale: 0.95, duration: 3, stagger: 0.5 })
    },
    {
        name: 'Left Tracking', // Sideways Motion
        duration: 12,
        textAlignment: 'right',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, x: 0 }, { scale: 1.1, x: -50, duration: 12, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: 30, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Right Tracking',
        duration: 12,
        textAlignment: 'left',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, x: 0 }, { scale: 1.1, x: 50, duration: 12, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: -30, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Top Reveal', // Scale Down
        duration: 11,
        textAlignment: 'center',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2, y: -20 }, { scale: 1.0, y: 0, duration: 11, ease: 'power1.out' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: -20, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Bottom Rise', // Hero Shot
        duration: 13,
        textAlignment: 'center',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1, y: 20 }, { scale: 1.1, y: -20, duration: 13, ease: 'sine.inOut' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 50, duration: 1.5, stagger: 0.3, ease: 'power2.out' })
    },
    {
        name: 'Diagonal Drift',
        duration: 14,
        textAlignment: 'bottom-left',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.15, x: -20, y: -20 }, { scale: 1.15, x: 0, y: 0, duration: 14, ease: 'none' }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Micro Handheld', // Subtle realism
        duration: 12,
        filter: 'contrast(1.05)',
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
        imageAnimation: (t) => gsap.timeline().set(t, { scale: 1.0 }), // Absolutely still
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Slow Tilt',
        duration: 14,
        textAlignment: 'right',
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
        filter: 'sepia(0.4) contrast(1.1) brightness(1.1) saturate(1.2)',
        overlayClass: 'bg-orange-500/10 mix-blend-overlay',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 14 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 20, duration: 2 })
    },
    {
        name: 'Blue Hour', // Cool vignette
        duration: 12,
        textAlignment: 'bottom-left',
        filter: 'brightness(0.9) contrast(1.1) saturate(0.8)',
        overlayClass: 'bg-blue-900/20 mix-blend-overlay',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.0, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.3 })
    },
    {
        name: 'High Contrast B&W', // Noir
        duration: 10,
        textAlignment: 'center',
        filter: 'grayscale(1) contrast(1.4) brightness(0.9)',
        letterbox: true,
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.15, duration: 10 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 10, duration: 1, stagger: 0.1 })
    },
    {
        name: 'Soft Dream',
        duration: 15,
        blurBackground: true,
        textAlignment: 'center',
        filter: 'brightness(1.1) contrast(0.9)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05, filter: 'blur(3px)' }, { scale: 1.1, filter: 'blur(5px)', duration: 15 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, filter: 'blur(10px)', duration: 3, stagger: 0.5 })
    },
    {
        name: 'Deep Shadow',
        duration: 12,
        textAlignment: 'center',
        filter: 'brightness(0.6) contrast(1.3)',
        overlayClass: 'bg-radial-gradient from-transparent to-black', // Needs custom CSS or just tough it out
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.0, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, scale: 0.9, duration: 2 })
    },
    {
        name: 'Desaturated Minimal',
        duration: 11,
        textAlignment: 'left',
        filter: 'saturate(0.2) contrast(1.1)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 30 }, { x: 0, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, x: -20, duration: 1.5, stagger: 0.2 })
    },
    {
        name: 'Emerald Tone', // Matrix/Fincher
        duration: 13,
        textAlignment: 'bottom-left',
        filter: 'contrast(1.2) brightness(0.9)',
        overlayClass: 'bg-emerald-900/20 mix-blend-overlay',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 13 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2 })
    },
    {
        name: 'Dramatic Spotlight',
        duration: 10,
        textAlignment: 'center',
        letterbox: true,
        filter: 'contrast(1.3)',
        overlayClass: 'bg-gradient-to-t from-black via-transparent to-black opacity-80',
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
        filter: 'brightness(0.5)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.0 }, { scale: 1.05, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { scale: 1.5, opacity: 0, duration: 1.5, stagger: 0.2, ease: 'power3.out' })
    },
    {
        name: 'Side Caption',
        duration: 12,
        textAlignment: 'left',
        letterbox: true,
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 0 }, { x: -50, duration: 12 }), // Pan to make room
        textAnimation: (ts) => gsap.timeline().from(ts, { x: -50, opacity: 0, duration: 1.5, stagger: 0.1, ease: 'power2.out' })
    },
    {
        name: 'Minimal Date',
        duration: 10,
        textAlignment: 'bottom-left',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.0, duration: 10 }),
        textAnimation: (ts) => {
            // Fix: Explicitly cast the filtered array to ensure TS knows it's HTMLElement[]
            const secondary = [ts[1], ts[2]].filter((el): el is HTMLElement => !!el)
            const tl = gsap.timeline()
            // Check if ts[0] exists before animating
            if (ts[0]) {
                tl.from(ts[0], { opacity: 0, duration: 1 })
            }
            if (secondary.length) tl.from(secondary, { opacity: 0, x: -10, duration: 1, stagger: 0.2 }, 1)
            return tl
        }
    },
    {
        name: 'Typewriter',
        duration: 13,
        textAlignment: 'left',
        filter: 'contrast(1.1)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.05, duration: 13 }), // Static
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.1, ease: 'steps(10)' }) // subtle stepper
    },
    {
        name: 'Fade Words',
        duration: 11,
        textAlignment: 'center',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.2, duration: 11 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, blur: 10, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Cascade',
        duration: 12,
        textAlignment: 'right',
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
        filter: 'contrast(1.2)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.0 }, { scale: 1.1, duration: 14 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 2, stagger: 0.5 })
    },
    {
        name: 'Center Spotlight',
        duration: 12,
        textAlignment: 'center',
        overlayClass: 'bg-radial-gradient from-transparent to-black/90', // Heavy vignette
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.2 }, { scale: 1.0, duration: 12 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { scale: 0.8, opacity: 0, duration: 1.5, ease: 'power2.out' })
    },
    {
        name: 'Split Layout', // Hacky split via hard pan
        duration: 12,
        textAlignment: 'left',
        overlayClass: 'bg-gradient-to-r from-black via-black/50 to-transparent', // Darken left side
        imageAnimation: (t) => gsap.timeline().fromTo(t, { x: 0 }, { x: 100, duration: 12 }), // Push image right
        textAnimation: (ts) => gsap.timeline().from(ts, { x: -50, opacity: 0, duration: 2, stagger: 0.2 })
    },
    {
        name: 'Background Blur',
        duration: 15,
        blurBackground: true,
        textAlignment: 'center',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.1 }, { scale: 1.15, duration: 15 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 3 })
    },
    {
        name: 'Soft Edge',
        duration: 13,
        textAlignment: 'center',
        overlayClass: 'bg-black/20 ring-[50px] ring-black/80 ring-inset', // Inner border hack
        imageAnimation: (t) => gsap.timeline().fromTo(t, { scale: 1.05 }, { scale: 1.1, duration: 13 }),
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, y: 10, duration: 2, stagger: 0.3 })
    },
    {
        name: 'Slow Cross Dissolve',
        duration: 14,
        textAlignment: 'center',
        filter: 'contrast(0.9) brightness(1.1)',
        imageAnimation: (t) => gsap.timeline().fromTo(t, { opacity: 0 }, { opacity: 1, duration: 4 }), // Slow fade in
        textAnimation: (ts) => gsap.timeline().from(ts, { opacity: 0, duration: 4, stagger: 1 })
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
    ...frameStyles.map(s => mapCategory(s, 'Frame'))
]

export function getCinematicStyle(index: number): CinematicStyle {
    // Deterministic Selection
    const styleIndex = index % ALL_STYLES.length
    // Fix: Fallback to first style and cast to ensure TS knows it's valid
    return ALL_STYLES[styleIndex] || ALL_STYLES[0] as CinematicStyle
}
