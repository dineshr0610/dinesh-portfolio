// server/utils/ai-normalization.ts

// Helper to clean HTML tags if necessary
function cleanText(text: string | null): string {
    if (!text) return ''
    return text
        .replace(/<[^>]*>/g, ' ') // remove HTML tags
        .replace(/\s+/g, ' ')     // collapse whitespace
        .trim()
}

export const formatters = {
    // 1. Projects
    project(item: any): string {
        return `
PROJECT: ${item.title}
SHORT DESCRIPTION: ${cleanText(item.short)}
FULL DESCRIPTION: ${cleanText(item.long)}
TECH STACK: ${Array.isArray(item.tech) ? item.tech.join(', ') : item.tech}
LINKS: Demo (${item.demo || 'N/A'}), Repo (${item.repo || 'N/A'})
`.trim()
    },

    // 2. Timeline / Experience
    timeline(item: any): string {
        const dateStr = item.date ? new Date(item.date).getFullYear() : 'Unknown Year'
        return `
TIMELINE EVENT (${dateStr}): ${item.title}
SUBTITLE: ${item.subtitle || ''}
DESCRIPTION: ${cleanText(item.description)}
`.trim()
    },

    // 3. AI Knowledge (Resume data)
    knowledge(item: any): string {
        // e.g. Section: Skills, Title: Frontend
        const titlePart = item.title ? ` - ${item.title}` : ''
        return `
KNOWLEDGE (${item.section.toUpperCase()})${titlePart}:
${cleanText(item.content)}
`.trim()
    },

    // 4. Dinesh Now (Updates)
    update(item: any): string {
        const dateStr = item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Unknown Date'
        return `
UPDATE (${dateStr}): ${item.title}
CONTENT: ${cleanText(item.body || item.content)}
`.trim()
    },

    // 5. Achievements
    achievement(item: any): string {
        const year = item.year || (item.achieved_at ? new Date(item.achieved_at).getFullYear() : '')
        return `
ACHIEVEMENT (${item.type}) ${year}: ${item.title}
DETAILS: ${cleanText(item.long || item.short)}
`.trim()
    },

    // 6. Gallery (Context only)
    gallery(item: any): string {
        return `
IMAGE CONTEXT: ${item.title}
DESCRIPTION: ${cleanText(item.description)}
`.trim()
    },

    // 7. Answered Questions (Q&A Pairs)
    question(item: any): string {
        return `
QUESTION: ${item.question}
ANSWER: ${cleanText(item.answer)}
`.trim()
    }
}
