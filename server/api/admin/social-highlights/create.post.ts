
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('social_highlights')
        .insert(body)
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return data
})
