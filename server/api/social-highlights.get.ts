
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('social_highlights')
        .select('*')
        .eq('published', true)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    // Shuffle the array (Fisher-Yates) for "freshness"
    // We do this on the server so the client gets a determined order for this request
    // ensuring hydration matches if we were using SSR (though this is likely client-fetched)
    // For a purely static site, this would be determined at build time if pre-rendered,
    // but since we're using useFetch on mount or server-side, it works well.

    if (!data || data.length === 0) return []

    const shuffled = [...data]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Fallback sort: if we wanted deterministic "randomness" we could seed it,
    // but true random is fine here for "freshness". 
    // However, the user also requested "Secondary (fallback): published_at DESC".
    // The random shuffle OVERRIDES that. The user said: "Primary: RANDOM... Secondary: published_at".
    // Use shuffle. If the user wants a stable sort for some reason, we'd need a seed.
    // We will return the shuffled list.

    return shuffled
})
