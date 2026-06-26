-- сферы молитвы
create table public.prayer_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'active'
    check (status in ('active', 'waiting', 'answered', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.prayer_topics enable row level security;

create policy "Users manage own prayer topics"
  on public.prayer_topics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- записи в сфере (timeline)
create table public.prayer_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.prayer_topics(id) on delete cascade,
  entry_date date not null,
  content text not null default '',
  entry_type text not null default 'request'
    check (entry_type in ('request', 'update', 'answered')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.prayer_entries enable row level security;

create policy "Users manage own prayer entries"
  on public.prayer_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index prayer_topics_user_idx on public.prayer_topics(user_id);
create index prayer_entries_topic_date_idx on public.prayer_entries(topic_id, entry_date desc);
