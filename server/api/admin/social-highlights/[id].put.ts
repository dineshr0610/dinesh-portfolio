
import { serverSupabaseClient } from '#supabase/server'
import { Database } from '~/types/database.types'
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

    const body = await readBody(event)
    const client = await serverSupabaseClient<Database>(event)

    const { data, error } = await client
        .from('social_highlights')
        .update(body)
        .eq('id', id)
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
