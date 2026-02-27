import { sendAutoReply } from '../../utils/email'
import { formatters } from '../../utils/ai-normalization'

export default defineEventHandler(async (event) => {
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

  if (!isReopen && answer) {
    try {
      const { error: indexError } = await supabase.from('documents').insert({
        source: 'q_and_a',
        source_id: questionId,
        title: questionRow.question,
        text_content: formatters.question({ question: questionRow.question, answer }),
        metadata: { confidence: 'high', verified: true }
      })
      if (indexError) console.error('Auto-index error:', indexError)
    } catch (e) {
      console.error('Auto-index failed:', e)
    }
  }

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

  return { success: true, emailSent }
})
