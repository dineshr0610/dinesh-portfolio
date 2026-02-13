// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const query = getQuery(event)
    const status = query.status || 'all' // all | published | draft
    const id = query.id

    let q = supabase
        .from('dinesh_updates')
        .select('*')
        .order('published_at', { ascending: false })

    if (id) {
        // If ID is provided, fetch single record
        const { data, error } = await q.eq('id', id).single()
        if (error) {
            throw createError({
                statusCode: 404,
                statusMessage: error.message
            })
        }
        // Map database fields to UI fields for the Edit form
        return {
            ...data,
            content: data.body, // UI expects 'content', DB has 'body'
            status: data.published ? 'published' : 'draft' // UI expects 'status', DB has 'published'
        }
    }

    if (status === 'published') q = q.eq('published', true)
    if (status === 'draft') q = q.eq('published', false)

    const { data, error } = await q

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return data
})
