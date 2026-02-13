// server/utils/admin is auto-imported
// server/utils/admin is auto-imported


export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const config = useRuntimeConfig()
    const supabase = getServerSupabase()

    const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('achieved_at', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
})
