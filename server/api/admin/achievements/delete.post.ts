import { createClient } from '@supabase/supabase-js'
// server/utils/admin is auto-imported


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const { id } = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
