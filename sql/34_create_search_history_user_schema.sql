create table IF NOT EXISTS public.search_history (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  query text not null,
  created_at timestamp with time zone null default now(),
  constraint search_history_pkey primary key (id),
  constraint search_history_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists search_history_user_id_idx on public.search_history using btree (user_id) TABLESPACE pg_default;
