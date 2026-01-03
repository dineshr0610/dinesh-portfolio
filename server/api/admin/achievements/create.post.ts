import { createClient } from '@supabase/supabase-js'
// server/utils/admin is auto-imported


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    // Validation
    if (!body.title || !body.short || !body.type || !body.achieved_at) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields (title, short, type, achieved_at)'
        })
    }

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase.from('achievements').insert({
        title: body.title,
        short: body.short,
        long: body.long,
        type: body.type,
        achieved_at: body.achieved_at,
        image_url: body.image_url,
        link_url: body.link_url,
        tags: body.tags, // Already an array from frontend or handle transformation here if needed
        media: body.media,
        published: body.published ?? true
    })

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
