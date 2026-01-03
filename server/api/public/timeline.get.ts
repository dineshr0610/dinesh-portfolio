import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    console.log('DEBUG: Timeline API - Key Exists:', !!config.SUPABASE_KEY)
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY)

    const { data, error } = await supabase
        .from('timeline') // Use correct table name
        .select('*')
        .eq('published', true) // Only published items
        .order('date', { ascending: false })
        .order('order_index', { ascending: true })

    if (error) {
        if (error.code === 'PGRST116') return [] // No results
        console.error('Error fetching timeline:', error)
        return []
    }

    return data
})
