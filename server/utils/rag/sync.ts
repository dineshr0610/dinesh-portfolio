import { deleteOne, indexOne, type IndexResult } from './indexer'

/** Best-effort post-mutation synchronization. The content mutation remains durable;
 * callers receive the index result so admins can retry a failed embedding. */
export async function syncRagRecord(supabase: any, config: any, source: string, sourceId: string, deleted = false): Promise<IndexResult> {
  return deleted ? deleteOne(supabase, source, sourceId) : indexOne(supabase, config, source, sourceId)
}
