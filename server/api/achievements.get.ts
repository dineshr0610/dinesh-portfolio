// server/api/achievements.get.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY   // your existing server key
    )

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
