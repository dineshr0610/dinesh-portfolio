
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('social_highlights')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return data
})
