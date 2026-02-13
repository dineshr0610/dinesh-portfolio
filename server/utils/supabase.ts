import { createClient } from '@supabase/supabase-js'

export const getServerSupabase = () => {
    const config = useRuntimeConfig()

    if (!config.SUPABASE_SECRET_KEY) {
        throw new Error('Missing SUPABASE_SECRET_KEY in runtime config')
    }

    return createClient(
        config.SUPABASE_URL,
        config.SUPABASE_SECRET_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    )
}
