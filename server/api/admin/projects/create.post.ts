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

    const { error } = await supabase.from('projects').insert({
        title: body.title,
        short: body.short,
        long: body.long,
        tech: body.tech || [],
        demo: body.demo || '',
        repo: body.repo || '',
        image: body.image || '',
        published: body.published ?? true
    })

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
