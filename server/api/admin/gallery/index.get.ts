// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const config = useRuntimeConfig()
    try {
        const supabase = getServerSupabase()

        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('DEBUG: Gallery API - Supabase Error:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        return data
    } catch (err: any) {
        console.error('DEBUG: Gallery API - Exception:', err)
        throw createError({ statusCode: 500, statusMessage: err.message })
    }
})
