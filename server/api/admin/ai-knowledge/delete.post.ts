// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const { id } = body

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ID'
        })
    }

    const { error } = await supabase
        .from('ai_knowledge')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
