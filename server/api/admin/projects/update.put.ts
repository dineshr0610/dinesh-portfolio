import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const { error } = await supabase
        .from('projects')
        .update({
            title: body.title,
            short: body.short,
            long: body.long,
            tech: body.tech,
            demo: body.demo,
            repo: body.repo,
            image: body.image,
            published: body.published,
            started_at: body.started_at,
            ongoing: body.ongoing,
            ended_at: body.ongoing ? null : body.ended_at,
            updated_at: new Date().toISOString()
        })
        .eq('id', body.id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
