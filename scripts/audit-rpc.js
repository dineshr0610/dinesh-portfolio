// Temporary audit script: verify RAG RPCs exist and respond.
import 'dotenv/config'
const H = { apikey: process.env.SUPABASE_SECRET_KEY, Authorization: 'Bearer ' + process.env.SUPABASE_SECRET_KEY, 'Content-Type': 'application/json' }
const base = process.env.SUPABASE_URL + '/rest/v1/rpc/'
async function call(fn, body) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(base + fn, { method: 'POST', headers: H, body: JSON.stringify(body) })
      console.log(fn, '->', r.status, (await r.text()).slice(0, 200))
      return
    } catch (e) { await new Promise(r => setTimeout(r, 1500)) }
  }
  console.log(fn, '-> NETWORK FAILURE after retries')
}
await call('match_documents', { query_embedding: Array(1536).fill(0), match_count: 5, match_threshold: 0 })
await call('search_documents_keyword', { p_query: 'test', p_match_count: 5 })
