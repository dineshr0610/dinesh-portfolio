export const ADMIN_EMAILS = [
    'dinesh2370049@ssn.edu.in',
    'bobby06102005@gmail.com'
]

export function isAdminEmail(email?: string | null) {
    if (!email) return false
    return ADMIN_EMAILS.includes(email)
}

import { serverSupabaseUser } from '#supabase/server'

export const requireAdmin = async (event: any) => {
    const user = await serverSupabaseUser(event)

    if (!user || !user.email || !isAdminEmail(user.email)) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    return user
}
