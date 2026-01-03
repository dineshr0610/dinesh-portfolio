import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const { id } = await readBody(event)
    const config = useRuntimeConfig()

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID required'
        })
    }

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('dinesh_updates')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
