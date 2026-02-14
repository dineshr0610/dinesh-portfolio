export const SFX_LIBRARY = [
    // ... (Full list of 40+ files) ...
]

export const SFX_CATEGORIES = {
    TRANSITION: 'transition',
    IMPACT: 'impact',
    AMBIENCE: 'ambience',
    TEXT: 'text',
    UI: 'ui',
    SPECIAL: 'special',
    RISER: 'riser',
    REVERSE: 'reverse'
} as const

export type SfxCategory = typeof SFX_CATEGORIES[keyof typeof SFX_CATEGORIES]

// Categorized file mappings (Static + Dynamic)
export const SFX_MAPPING: Record<SfxCategory, string[]> = {
    [SFX_CATEGORIES.TRANSITION]: [
        'mixkit-cinematic-whoosh-fast-transition-1492.wav', // 1.33s
        'mixkit-transition-windy-swoosh-1474.wav',       // 3.2s
        'mixkit-fast-air-zoom-2625.wav',                 // 1.28s
        'mixkit-ending-wind-swoosh-1482.wav',            // 2.38s
        'mixkit-flying-fast-swoosh-1469.wav',
        'mixkit-cinematic-transition-wind-swoosh-1468.wav'
    ],
    [SFX_CATEGORIES.IMPACT]: [
        'mixkit-movie-trailer-epic-impact-2908.wav',     // 4.8s
        'mixkit-cinematic-mystery-trailer-drum-hit-546.mp3', // 5.6s
        'mixkit-short-bass-hit-2299.wav',                // 1.1s
        'mixkit-futuristic-bass-hit-2303.wav',           // 2.7s
        'mixkit-cinematic-whoosh-deep-impact-1143.mp3',
        'mixkit-spring-metal-hit-2302.wav'
    ],
    [SFX_CATEGORIES.AMBIENCE]: [
        'mixkit-drone-spaceship-sound-2743.wav',
        'mixkit-shot-light-energy-flowing-2589.wav'
    ],
    [SFX_CATEGORIES.TEXT]: [
        'mixkit-typewriter-soft-click-1125.wav',
        'mixkit-hard-typewriter-click-1119.wav'
    ],
    [SFX_CATEGORIES.UI]: [
        'mixkit-select-click-1109.wav',
        'mixkit-sci-fi-interface-robot-click-901.wav',
        'mixkit-cool-interface-click-tone-2568.wav',
        'mixkit-classic-click-1117.wav'
    ],
    // STEP 10: Unlocked Hidden Sounds
    'special': [
        'mixkit-drone-spaceship-sound-2743.wav',      // 7s Ambience
        'mixkit-classic-click-1117.wav',              // Retro Notification
        'mixkit-spring-metal-hit-2302.wav',           // Gear Lock (Achievement)
        'mixkit-shot-light-energy-flowing-2589.wav'   // Magic Sparkle
    ],
    'riser': [
        'mixkit-magic-spell-mystery-whoosh-2345.wav', // 5.8s Build up
        'mixkit-cinematic-whoosh-stutter-787.wav'    // Stutter rise
    ],
    'reverse': [
        'mixkit-glitch-sci-fi-rewind-transition-1093.wav'
    ]
}

// Helper to find impact based on text
export function detectEmotionalImpact(text: string): boolean {
    const keywords = ['born', 'joined', 'started', 'won', 'graduated', 'married', 'award', 'first', 'love', 'died', 'lost']
    return keywords.some(k => text.toLowerCase().includes(k))
}

// ---------------------------------------------------------------------------
// 🎼 SOUND PROFILES (Deterministically map index -> sound mood)
// ---------------------------------------------------------------------------
const SOUND_PROFILES = [
    {   // 0: Deep Drama
        transition: 'mixkit-cinematic-whoosh-fast-transition-1492.wav',
        impact: 'mixkit-cinematic-whoosh-deep-impact-1143.mp3'
    },
    {   // 1: Light / Fast
        transition: 'mixkit-fast-air-zoom-2625.wav',
        impact: 'mixkit-spring-metal-hit-2302.wav'
    },
    {   // 2: Tech / Sci-Fi
        transition: 'mixkit-flying-fast-swoosh-1469.wav',
        impact: 'mixkit-futuristic-bass-hit-2303.wav'
    },
    {   // 3: Epic Trailer
        transition: 'mixkit-transition-windy-swoosh-1474.wav',
        impact: 'mixkit-movie-trailer-epic-impact-2908.wav'
    },
    {   // 4: Mystery / Slow
        transition: 'mixkit-ending-wind-swoosh-1482.wav',
        impact: 'mixkit-cinematic-mystery-trailer-drum-hit-546.mp3'
    },
    {   // 5: Standard Punchy
        transition: 'mixkit-cinematic-transition-wind-swoosh-1468.wav',
        impact: 'mixkit-short-bass-hit-2299.wav'
    }
]

// Create a random starting point for sounds

export function getSoundProfile(index: number, seed: number) {
    // Multiply by a prime number (5) to mix up the audio profiles
    // We use the seed passed from the player.
    const profileIndex = ((index + seed) * 5) % SOUND_PROFILES.length

    return SOUND_PROFILES[profileIndex]
}
