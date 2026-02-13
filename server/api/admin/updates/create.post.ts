// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const {
        title,
        short,
        content,
        body: rawBody,
        image,
        media,
        tags,
        status, // 'draft' | 'published'
        published: rawPublished,
        published_at
    } = body

    const finalBody = rawBody || content
    const finalPublished = rawPublished !== undefined ? rawPublished : (status === 'published')

    // Logic: If Published -> auto set published_at (if not provided). If Draft -> published_at = null
    let finalPublishedAt = published_at
    if (finalPublished) {
        if (!finalPublishedAt) finalPublishedAt = new Date().toISOString()
    } else {
        finalPublishedAt = null
    }

    const finalShort = short || title

    if (!title || !finalBody) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields (title, content)'
        })
    }

    const { error } = await supabase
        .from('dinesh_updates')
        .insert({
            title,
            short: finalShort,
            body: finalBody,
            image: image || null,
            media: media || null,
            tags: tags || [],
            published: finalPublished,
            published_at: finalPublishedAt
        })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
