// server/utils/admin is auto-imported

export default defineEventHandler(async () => {
    // Use getServerSupabase utility
    const supabase = getServerSupabase()

    const { data, error } = await supabase
        .from('projects')
        .select(`
      id,
      title,
      short,
      long,
      tech,
      demo,
      repo,
      repo,
      image,
      started_at,
      ended_at,
      ongoing
    `)
        .eq('published', true)
        .order('ongoing', { ascending: false })
        .order('ended_at', { ascending: false, nullsFirst: true })
        .order('started_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return data
})
