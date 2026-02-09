import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const {
        section,
        title,
        content,
        priority,
        published
    } = body

    if (!section || !content) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields (section, content)'
        })
    }

    const { error } = await supabase
        .from('ai_knowledge')
        .insert({
            section,
            title: title || null,
            content,
            priority: priority || 0,
            published: published !== undefined ? published : true,
        })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
