// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'
import { syncRagRecord } from '../../../utils/rag/sync'


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const {
        title,
        description,
        type,
        src,
        poster,
        tags = [],
        order_index = 0,
        published = false
    } = body

    if (!title || !type || !src) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        })
    }

    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const { data, error } = await supabase.from('gallery').insert({
        title,
        description,
        type,
        src,
        poster,
        tags,
        order_index,
        published,
        published_at: body.published_at || (published ? new Date().toISOString() : null)
    }).select('id').single()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true, index: await syncRagRecord(supabase, config, 'gallery', data.id) }
})
