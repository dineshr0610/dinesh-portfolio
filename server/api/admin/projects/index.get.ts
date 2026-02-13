// server/utils/admin is auto-imported
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const query = getQuery(event)
    const id = query.id

    let data, error

    if (id) {
        const res = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()
        data = res.data
        error = res.error
    } else {
        const res = await supabase
            .from('projects')
            .select('*')
            .order('ended_at', { ascending: false, nullsFirst: true })
            .order('started_at', { ascending: false })
        data = res.data
        error = res.error
    }

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
})
