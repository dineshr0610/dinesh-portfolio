// server/utils/admin is auto-imported
import { syncRagRecord } from '../../../utils/rag/sync'
// server/utils/admin is auto-imported


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const { id } = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true, index: await syncRagRecord(supabase, useRuntimeConfig(), 'achievements', id, true) }
})
