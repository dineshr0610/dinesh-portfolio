// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'
import { syncRagRecord } from '../../../utils/rag/sync'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    if (!body.id) {
        throw createError({ statusCode: 400, statusMessage: 'ID required' })
    }

    const supabase = getServerSupabase()

    const { error } = await supabase
        .from('timeline')
        .delete()
        .eq('id', body.id)

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message
        })
    }

    return { success: true, index: await syncRagRecord(supabase, config, 'timeline', body.id, true) }
})
