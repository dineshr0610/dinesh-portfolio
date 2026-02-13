// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const {
        id,
        section,
        title,
        content,
        priority,
        published
    } = body

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ID'
        })
    }

    const updates: any = {
        updated_at: new Date().toISOString()
    }

    if (section !== undefined) updates.section = section
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (priority !== undefined) updates.priority = priority
    if (published !== undefined) updates.published = published

    const { error } = await supabase
        .from('ai_knowledge')
        .update(updates)
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
