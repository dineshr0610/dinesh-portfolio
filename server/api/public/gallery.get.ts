// server/utils/admin is auto-imported

export default defineEventHandler(async (event) => {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

    if (error) {
        console.error('Error fetching gallery:', error)
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data?.map(item => ({
        ...item,
        image: item.type === 'video' ? item.poster : item.src,
        short: item.description,
        date: item.published_at
    }))
})
