
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../_guard'
import { syncRagRecord } from '../../../utils/rag/sync'

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

    return { ...data, index: await syncRagRecord(getServerSupabase(), useRuntimeConfig(), 'social_highlights', data.id) }
})
