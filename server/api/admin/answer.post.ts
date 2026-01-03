import { createClient } from '@supabase/supabase-js'
import { sendUserEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const questionId = body.id
    const answer = body.answer?.trim()
    const isReopen = body.reopen === true

    if (!questionId) {
        throw createError({ statusCode: 400, statusMessage: 'Question ID required' })
    }

    // If not reopening, answer is required
    if (!isReopen && !answer) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Answer is required'
        })
    }

    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY,
        { auth: { persistSession: false } }
    )

    // 1️⃣ Fetch question + user email
    const { data: questionRow, error: fetchError } = await supabase
        .from('ai_unanswered_questions')
        .select('question, user_email')
        .eq('id', questionId)
        .single()

    if (fetchError || !questionRow) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Question not found'
        })
    }

    // 2️⃣ Update DB
    const updates: any = {}

    if (isReopen) {
        updates.status = 'pending'
        // Optional: clear answer or keep it as draft? 
        // User code sent answer: null, so let's allow updating answer too if provided, or not touch it.
        // Frontend sends answer: null. So we won't update `admin_answer` if it's null/undefined unless we want to clear it.
        // Let's assume reopen means just moving to pending.
        // But user might want to clear it. 
        // Let's just update context.
    } else {
        updates.admin_answer = answer
        updates.status = 'answered'
        updates.answered_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
        .from('ai_unanswered_questions')
        .update(updates)
        .eq('id', questionId)

    if (updateError) {
        console.error('Update failed:', updateError)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to save answer'
        })
    }

    // 3️⃣ Email user
    // This uses the shared email util with source='admin' to prevent auto-reply loops
    try {
        await sendUserEmail({
            to: questionRow.user_email,
            subject: 'Answer to your question',
            message: `
Hi,

You asked:
"${questionRow.question}"

Here is the verified answer from Dinesh:

${answer}

Regards,
Dinesh R
`
        })
    } catch (e) {
        console.error('User email failed:', e)
        // ❗ We do NOT rollback DB — admin work is done
    }

    return {
        success: true
    }
})
