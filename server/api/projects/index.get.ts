import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()

    // Use SUPABASE_KEY as defined in nuxt.config.ts runtimeConfig
    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

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
