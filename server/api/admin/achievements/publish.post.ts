// server/utils/admin is auto-imported
// server/utils/admin is auto-imported

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const { id, published } = await readBody(event)
    const config = useRuntimeConfig()

    const supabase = getServerSupabase()

    const { error } = await supabase
        .from('achievements')
        .update({ published })
        .eq('id', id)

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    return { success: true }
})
