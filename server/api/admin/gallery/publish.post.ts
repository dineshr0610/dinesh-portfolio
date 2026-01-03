import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const { id, published } = body

    const config = useRuntimeConfig()
    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('gallery')
        .update({
            published,
            published_at: published ? new Date().toISOString() : null
        })
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
