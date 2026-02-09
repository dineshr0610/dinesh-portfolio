import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const {
        id,
        title,
        description,
        type,
        src,
        poster,
        tags,
        order_index,
        published
    } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID required' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const updates: any = {
        title,
        description,
        type,
        src,
        poster,
        tags,
        order_index,
        published,
        updated_at: new Date().toISOString()
    }

    if (body.published_at !== undefined) updates.published_at = body.published_at

    // If publishing now and no date, set to now
    if (published && !updates.published_at && !body.published_at) {
        updates.published_at = new Date().toISOString()
    }

    const { error } = await supabase
        .from('gallery')
        .update(updates)
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
