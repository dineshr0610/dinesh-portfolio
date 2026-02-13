// server/utils/admin is auto-imported
import { requireAdmin } from '../_guard'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const query = getQuery(event)
    const id = query.id

    let q = supabase
        .from('ai_knowledge')
        .select('*')

    if (id) {
        const { data, error } = await q.eq('id', id).single()

        if (error) {
            throw createError({
                statusCode: 404,
                statusMessage: error.message
            })
        }
        return data
    }

    const { data, error } = await q.order('priority', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return data
})
