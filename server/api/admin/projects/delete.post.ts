import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const { id } = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('projects')
        .update({ published: false })
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
