import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID required' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
})
