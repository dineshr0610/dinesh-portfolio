// server/api/achievements.get.ts
// server/utils/admin is auto-imported

export default defineEventHandler(async () => {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
        .from('achievements')
        .select(`
      id,
      title,
      short,
      long,
      type,
      achieved_at,
      year,
      image_url,
      link_url,
      tags,
      media
    `)
        .eq('published', true)
        .order('achieved_at', { ascending: false })

    if (error) {
        console.error('Achievements fetch failed:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to load achievements'
        })
    }

    return data
})
