// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const { data, error } = await supabase
        .from('timeline')
        .select('*')
        .order('date', { ascending: false })
        .order('order_index', { ascending: true })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return data
})
