-- profiles (расширение auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- привычки
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.habits enable row level security;

create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- отметки за день
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  created_at timestamptz default now(),
  unique (habit_id, log_date)
);

alter table public.habit_logs enable row level security;

create policy "Users manage own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- духовный анализ за день
create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  spiritual_analysis text default '',
  updated_at timestamptz default now(),
  unique (user_id, entry_date)
);

alter table public.daily_entries enable row level security;

create policy "Users manage own daily entries"
  on public.daily_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- планы на конкретный день
create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planned_for date not null,
  content text not null,
  scheduled_time time,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.plan_items enable row level security;

create policy "Users manage own plan items"
  on public.plan_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index habits_user_id_idx on public.habits(user_id);
create index habit_logs_user_date_idx on public.habit_logs(user_id, log_date);
create index daily_entries_user_date_idx on public.daily_entries(user_id, entry_date);
create index plan_items_user_planned_idx on public.plan_items(user_id, planned_for);

-- мероприятия в календаре
create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_time time not null,
  created_at timestamptz default now()
);

alter table public.calendar_events enable row level security;

create policy "Users manage own calendar events"
  on public.calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index calendar_events_user_date_idx on public.calendar_events(user_id, event_date);
