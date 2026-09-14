-- ============================================================================
-- RAG: canonical documents table support + match_documents RPC
-- ----------------------------------------------------------------------------
-- The application previously relied on an undocumented match_documents RPC.
-- This migration makes the RPC + supporting indexes reproducible.
--
-- Requirements: pgvector extension (already present on Supabase projects that
-- have a `documents.embedding` column).
-- Idempotent: safe to run multiple times.
-- ============================================================================

-- 1. Ensure the extension exists (no-op if already enabled)
create extension if not exists vector;

-- ----------------------------------------------------------------------------
-- 2. Canonical match_documents RPC
--
-- Cosine similarity (1 - cosine distance). Returns all fields the app needs,
-- including source/source_id/title/text_content/metadata so hybrid retrieval
-- can rerank and build proof cards without a second query.
--
-- Optional filters:
--   p_sources        -> restrict to a set of canonical source names
--   p_source_ids     -> restrict to specific records
--   p_min_similarity -> floor (0 = no floor)
-- ----------------------------------------------------------------------------
-- NOTE on parameter names: the existing app (server/api/ask.post.ts) calls this
-- RPC with NAMED arguments: query_embedding / match_count / match_threshold.
-- Those names are preserved so the existing caller keeps working; the extra
-- optional filters (p_sources, p_source_ids) are new and used by hybrid retrieval.
create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count int default 10,
  match_threshold double precision default 0.0,
  p_sources text[] default null,
  p_source_ids text[] default null
)
returns table (
  id uuid,
  source text,
  source_id text,
  title text,
  text_content text,
  metadata jsonb,
  similarity double precision
)
language sql stable
as $$
  select
    d.id,
    d.source,
    d.source_id,
    d.title,
    d.text_content,
    d.metadata,
    1 - (d.embedding <=> p_query_embedding) as similarity
  from documents d
  where
    d.embedding is not null
    and (p_sources is null or d.source = any (p_sources))
    and (p_source_ids is null or d.source_id = any (p_source_ids))
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding asc
  limit greatest(match_count, 1);
$$;

-- ----------------------------------------------------------------------------
-- 3. Support indexes
-- ----------------------------------------------------------------------------
-- Logical identity lookups (indexOne / deleteOne / stale cleanup)
create index if not exists documents_source_source_id_idx
  on public.documents (source, source_id);

-- ANN index for cosine similarity search
-- (ivfflat: fast to build, fine for portfolio-scale datasets)
create index if not exists documents_embedding_ivfflat_idx
  on public.documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ----------------------------------------------------------------------------
-- 4. Keyword search helper for hybrid retrieval (no extension needed).
-- Case-insensitive ILIKE search over title + text_content; used together with
-- the vector RPC so title/keyword hits are not lost to embedding variance.
-- ----------------------------------------------------------------------------
create or replace function public.search_documents_keyword(
  p_query text,
  p_match_count int default 10,
  p_sources text[] default null
)
returns table (
  id uuid,
  source text,
  source_id text,
  title text,
  text_content text,
  metadata jsonb
)
language sql stable
as $$
  select
    d.id,
    d.source,
    d.source_id,
    d.title,
    d.text_content,
    d.metadata
  from documents d
  where
    (p_sources is null or d.source = any (p_sources))
    and (
      d.title ilike '%' || p_query || '%'
      or d.text_content ilike '%' || p_query || '%'
    )
  order by
    case when d.title ilike p_query then 0
         when d.title ilike '%' || p_query || '%' then 1
         else 2 end,
    d.created_at asc
  limit greatest(p_match_count, 1);
$$;
