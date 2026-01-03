import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    if (!body.id) {
        throw createError({ statusCode: 400, statusMessage: 'ID required' })
    }

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY,
        { auth: { persistSession: false } }
    )

    const { error } = await supabase
        .from('timeline')
        .update({
            title: body.title,
            subtitle: body.subtitle,
            description: body.description,
            date: body.date,
            order_index: body.order_index,
            image: body.image,
            media: body.media,
            tags: body.tags,
            published: body.published,
            updated_at: new Date().toISOString()
        })
        .eq('id', body.id)

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message
        })
    }

    return { success: true }
})
