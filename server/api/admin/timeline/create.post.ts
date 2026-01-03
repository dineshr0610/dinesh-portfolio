import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY,
        { auth: { persistSession: false } }
    )

    const { error } = await supabase.from('timeline').insert({
        title: body.title,
        subtitle: body.subtitle || null,
        description: body.description,
        date: body.date,
        order_index: body.order_index ?? 0,
        image: body.image || null,
        media: body.media || null,
        tags: body.tags || [],
        published: body.published ?? true
    })

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message
        })
    }

    return { success: true }
})
