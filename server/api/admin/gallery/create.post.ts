import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const {
        title,
        description,
        type,
        src,
        poster,
        tags = [],
        order_index = 0,
        published = false
    } = body

    if (!title || !type || !src) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase.from('gallery').insert({
        title,
        description,
        type,
        src,
        poster,
        tags,
        order_index,
        published,
        published_at: published ? new Date().toISOString() : null
    })

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
