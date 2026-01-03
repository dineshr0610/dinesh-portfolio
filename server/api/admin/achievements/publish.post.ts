import { createClient } from '@supabase/supabase-js'
// server/utils/admin is auto-imported

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const { id, published } = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('achievements')
        .update({ published })
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
