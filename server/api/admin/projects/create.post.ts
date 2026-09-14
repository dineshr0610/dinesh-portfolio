// server/utils/admin is auto-imported
import { requireAdmin } from '../../../utils/admin'
import { syncRagRecord } from '../../../utils/rag/sync'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const { data, error } = await supabase.from('projects').insert({
        title: body.title,
        short: body.short,
        long: body.long,
        tech: body.tech || [],
        demo: body.demo || '',
        repo: body.repo || '',
        image: body.image || '',
        published: body.published ?? true,
        started_at: body.started_at,
        ongoing: body.ongoing,
        ended_at: body.ongoing ? null : body.ended_at
    }).select('id').single()

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true, index: await syncRagRecord(supabase, config, 'projects', data.id) }
})
