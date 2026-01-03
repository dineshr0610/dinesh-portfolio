import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY)

    const { data, error } = await supabase
        .from('dinesh_updates')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

    if (error) {
        console.error('Error fetching updates:', error)
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
})
