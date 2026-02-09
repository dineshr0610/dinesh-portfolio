import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from './_guard'
import { formatters } from '../../utils/ai-normalization'

export default defineEventHandler(async (event) => {
    // 1. Security Check
    await requireAdmin(event)
    const config = useRuntimeConfig()

    // 2. Init Client
    const supabase = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
    )

    const log = [] as string[]
    const errors = [] as string[]

    function addLog(msg: string) {
        log.push(msg)
        // console.log(`[Reindex] ${msg}`)
    }

    try {
        addLog('🚀 Starting Full AI Reindex...')

        // 3. Clear existing documents
        // NOTE: In a production system with millions of rows, we'd do smart diffing.
        // For a portfolio, wiping and rewriting is safer and fast enough.
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // delete all

        if (deleteError) throw deleteError
        addLog('🧹 Cleared old documents')

        // 4. Fetch All Data (Parallel)
        const [
            { data: knowledge },
            { data: projects },
            { data: timeline },
            { data: updates },
            { data: achievements },
            { data: gallery },
            { data: questions }
        ] = await Promise.all([
            supabase.from('ai_knowledge').select('*').eq('published', true),
            supabase.from('projects').select('*').eq('published', true),
            supabase.from('timeline').select('*'), // assumes all are public usually
            supabase.from('dinesh_updates').select('*').eq('published', true),
            supabase.from('achievements').select('*').eq('published', true),
            supabase.from('gallery').select('*'),
            supabase.from('ai_unanswered_questions').select('*').or('status.eq.answered,status.eq.published')
        ])

        addLog(`📊 Configured Sources:
        - Knowledge: ${knowledge?.length || 0}
        - Projects: ${projects?.length || 0}
        - Timeline: ${timeline?.length || 0}
        - Updates: ${updates?.length || 0}
        - Achievements: ${achievements?.length || 0}
        - Gallery: ${gallery?.length || 0}
        - Q&A: ${questions?.length || 0}
        `)

        const allDocs: any[] = []

        // 5. Normalization Loop

        // Knowledge
        knowledge?.forEach(item => {
            allDocs.push({
                source: 'ai_knowledge',
                source_id: item.id,
                title: `${item.section.toUpperCase()}: ${item.title || 'General'}`,
                text_content: formatters.knowledge(item),
                metadata: { section: item.section, priority: item.priority }
            })
        })

        // Projects
        projects?.forEach(item => {
            allDocs.push({
                source: 'projects',
                source_id: item.id,
                title: item.title,
                text_content: formatters.project(item),
                metadata: { tech: item.tech }
            })
        })

        // Timeline
        timeline?.forEach(item => {
            allDocs.push({
                source: 'timeline',
                source_id: item.id,
                title: item.title,
                text_content: formatters.timeline(item),
                metadata: { year: item.year }
            })
        })

        // Updates
        updates?.forEach(item => {
            allDocs.push({
                source: 'updates',
                source_id: item.id,
                title: item.title,
                text_content: formatters.update(item),
                metadata: { date: item.published_at }
            })
        })

        // Achievements
        achievements?.forEach(item => {
            allDocs.push({
                source: 'achievements',
                source_id: item.id,
                title: item.title,
                text_content: formatters.achievement(item),
                metadata: { type: item.type }
            })
        })

        // Gallery
        gallery?.forEach(item => {
            if (!item.description && !item.title) return
            allDocs.push({
                source: 'gallery',
                source_id: item.id,
                title: item.title || 'Image',
                text_content: formatters.gallery(item),
                metadata: {}
            })
        })

        // Questions
        questions?.forEach(item => {
            allDocs.push({
                source: 'q_and_a',
                source_id: item.id,
                title: item.question,
                text_content: formatters.question(item),
                metadata: { confidence: item.ai_confidence }
            })
        })

        addLog(`📝 Normalized ${allDocs.length} documents. Inserting...`)

        // 6. Bulk Insert
        // Supabase handles the embedding generation via trigger/internal mechanism
        const { error: insertError } = await supabase
            .from('documents')
            .insert(allDocs)

        if (insertError) {
            // If bulk fails, try chunking? For now, throw.
            throw insertError
        }

        addLog('✅ Reindex Complete!')

        return {
            success: true,
            count: allDocs.length,
            log
        }

    } catch (e: any) {
        addLog(`❌ Fatal Error: ${e.message}`)
        return {
            success: false,
            error: e.message,
            log
        }
    }
})
