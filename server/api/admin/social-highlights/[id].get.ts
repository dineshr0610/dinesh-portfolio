
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const id = event.context.params?.id

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ID',
        })
    }

    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('social_highlights')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return data
})
