-- Hybrid retrieval support for the existing public.documents table.
-- The vector dimension/RPC are established by 20260101000000_rag_match_documents.sql.

create index if not exists documents_title_lower_idx
  on public.documents (lower(title));

create index if not exists documents_search_tsv_idx
  on public.documents using gin (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(text_content, ''))
  );

-- One record may have multiple chunks, but a chunk identity must never duplicate.
create unique index if not exists documents_logical_chunk_idx
  on public.documents (source, source_id, coalesce(metadata->>'chunk_index', '0'))
  where source_id is not null;

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
  select d.id, d.source, d.source_id, d.title, d.text_content, d.metadata
  from public.documents d
  where (p_sources is null or d.source = any (p_sources))
    and (
      lower(d.title) like '%' || lower(p_query) || '%'
      or d.text_content ilike '%' || p_query || '%'
      or to_tsvector('simple', coalesce(d.title, '') || ' ' || coalesce(d.text_content, ''))
         @@ websearch_to_tsquery('simple', p_query)
    )
  order by case when lower(d.title) = lower(p_query) then 0
                when lower(d.title) like '%' || lower(p_query) || '%' then 1
                else 2 end,
           d.created_at asc
  limit greatest(p_match_count, 1);
$$;
