// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const {
        id,
        title,
        content,
        body: rawBody,
        status,
        short,
        image,
        tags,
        published_at,
        published
    } = body

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID required'
        })
    }

    const updates: any = {
        updated_at: new Date().toISOString()
    }

    // Map UI fields to DB fields
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.body = content
    if (rawBody !== undefined) updates.body = rawBody
    if (short !== undefined) updates.short = short
    if (image !== undefined) updates.image = image
    if (tags !== undefined) updates.tags = tags
    if (published_at !== undefined) updates.published_at = published_at
    if (published !== undefined) updates.published = published

    if (status !== undefined) {
        updates.published = (status === 'published')
        // If explicitly setting to draft, we might want to clear published_at?
        // But preventing data loss is better usually.
        // The Create logic enforces "Draft -> published_at = null".
        // Let's adopt that for update too if they explicitly send status='draft'.
        if (status === 'draft') {
            updates.published_at = null
        }
        // If setting to published, and no published_at provided, we rely on frontend or existing.
    }

    const { error } = await supabase
        .from('dinesh_updates')
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
