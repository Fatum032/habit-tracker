-- Запусти в Supabase → SQL Editor (если проект уже создан)

-- Время у планов на день
alter table public.plan_items
  add column if not exists scheduled_time time;

-- Мероприятия в календаре
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_time time not null,
  created_at timestamptz default now()
);

alter table public.calendar_events enable row level security;

drop policy if exists "Users manage own calendar events" on public.calendar_events;
create policy "Users manage own calendar events"
  on public.calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists calendar_events_user_date_idx
  on public.calendar_events(user_id, event_date);
