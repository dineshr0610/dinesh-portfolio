import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY)

    // Attempt to fetch from Supabase
    const { data: dbData, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false })

    if (!error && dbData) {
        return dbData
    }

    // Fallback? The user asked to migrate, so if the table doesn't exist, this will error. 
    // But for safety during migration, I'll log the error and try to return empty or handle it.
    // However, the user's specific instruction was to "Use Supabase client in API".
    // I will return the error if it fails, so we can debug it (e.g. create the table).

    if (error) {
        // If table doesn't exist, we might want to return defaults or throw.
        // For now, let's throw so we know we need to create the table.
        console.error('Error fetching achievements:', error)
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return dbData
})
