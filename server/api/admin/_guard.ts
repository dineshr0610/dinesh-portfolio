// server/api/admin/_guard.ts
import { serverSupabaseUser } from '#supabase/server'

const ADMIN_EMAILS = [
    'dinesh2370049@ssn.edu.in',
    'bobby06102005@gmail.com'
]

export async function requireAdmin(event: any) {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    if (!ADMIN_EMAILS.includes(user.email || '')) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden'
        })
    }

    return user
}
