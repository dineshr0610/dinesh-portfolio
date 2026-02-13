// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const { id } = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Question ID is required'
        })
    }

    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const { error } = await supabase
        .from('ai_unanswered_questions')
        .update({ status: 'deleted' })
        .eq('id', id)

    if (error) {
        console.error('Delete question failed:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete question'
        })
    }

    return { success: true }
})
