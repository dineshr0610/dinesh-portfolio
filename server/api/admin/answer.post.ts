import { sendAutoReply } from '../../utils/email'
import { indexOne } from '../../utils/rag/indexer'
import { requireAdmin } from './_guard'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  const questionId = body.id
  const answer = body.answer?.trim()
  const isReopen = body.reopen === true

  if (!questionId) {
    throw createError({ statusCode: 400, statusMessage: 'Question ID required' })
  }

  if (!isReopen && !answer) {
    throw createError({ statusCode: 400, statusMessage: 'Answer is required' })
  }

  const supabase = getServerSupabase()

  const { data: questionRow, error: fetchError } = await supabase
    .from('ai_unanswered_questions')
    .select('question, user_email')
    .eq('id', questionId)
    .single()

  if (fetchError || !questionRow) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  const updates: any = {}
  if (isReopen) {
    updates.status = 'pending'
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
    throw createError({ statusCode: 500, statusMessage: 'Failed to save answer' })
  }

  const indexResult = await indexOne(supabase, useRuntimeConfig(), 'ai_unanswered_questions', questionId)
  if (!indexResult.ok) console.error('Q&A index synchronization failed:', indexResult.error)

  let emailSent = false
  if (!isReopen && answer && questionRow.user_email) {
    try {
      await sendAutoReply({
        to: questionRow.user_email,
        subject: 'Your AI Question Has Been Answered',
        name: 'there',
        intro: `Here is your question:\n"${questionRow.question}"`,
        content: answer,
        footer: 'Feel free to ask more anytime.'
      })
      emailSent = true
    } catch (e) {
      console.error('User email failed:', e)
    }
  }

  return { success: true, emailSent, index: indexResult }
})
