import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const config = useRuntimeConfig()
    console.log('DEBUG: Gallery API - URL:', config.SUPABASE_URL)
    console.log('DEBUG: Gallery API - Key Exists:', !!config.SUPABASE_KEY)

    try {
        const supabase = createClient(
            config.SUPABASE_URL,
            config.SUPABASE_KEY
        )

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
