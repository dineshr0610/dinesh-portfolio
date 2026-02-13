// server/utils/admin is auto-imported

export default defineEventHandler(async (event) => {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
        .from('timeline') // Use correct table name
        .select('*')
        .eq('published', true) // Only published items
        .order('date', { ascending: false })

    if (error) {
        if (error.code === 'PGRST116') return [] // No results
        console.error('Error fetching timeline:', error)
        return []
    }

    return data
})
