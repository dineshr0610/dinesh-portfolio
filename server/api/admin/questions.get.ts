import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY,
        { auth: { persistSession: false } }
    )

    // Parallel fetch for speed
    const [pendingRes, answeredRes] = await Promise.all([
        supabase
            .from('ai_unanswered_questions') // Note: Table name might be misleading if it contains answered too, but per current setup
            .select('*')
            .eq('status', 'pending')
            .neq('status', 'deleted') // Explicit safety
            .order('created_at', { ascending: false }),

        supabase
            .from('ai_unanswered_questions')
            .select('*')
            .eq('status', 'answered')
            .neq('status', 'deleted') // Explicit safety
            .order('answered_at', { ascending: false })
    ])

    if (pendingRes.error) {
        throw createError({ statusCode: 500, statusMessage: pendingRes.error.message })
    }
    if (answeredRes.error) {
        throw createError({ statusCode: 500, statusMessage: answeredRes.error.message })
    }

    return {
        pending: pendingRes.data || [],
        answered: answeredRes.data || []
    }
})
