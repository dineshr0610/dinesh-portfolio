// app/middleware/admin.ts

export default defineNuxtRouteMiddleware(async () => {
    if (process.server) return

    const supabase = useSupabaseClient()

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        return navigateTo('/admin/login')
    }

    const email = data.user.email

    const ADMIN_EMAILS = [
        'dinesh2370049@ssn.edu.in',
        'bobby06102005@gmail.com'
    ]

    if (!email || !ADMIN_EMAILS.includes(email)) {
        await supabase.auth.signOut()
        return navigateTo('/admin/login')
    }
})
