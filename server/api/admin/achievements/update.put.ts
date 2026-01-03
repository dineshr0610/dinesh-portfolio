import { createClient } from '@supabase/supabase-js'
// server/utils/admin is auto-imported


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('achievements')
        .update({
            title: body.title,
            short: body.short,
            long: body.long,
            achieved_at: body.achieved_at,
            type: body.type,
            link_url: body.link_url,
            image_url: body.image_url,
            tags: body.tags,
            media: body.media,
            published: body.published,
            updated_at: new Date()
        })
        .eq('id', body.id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
