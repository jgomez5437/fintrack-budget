create extension if not exists pgcrypto;

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year integer not null,
  month integer not null check (month between 0 and 11),
  income text not null default '',
  categories jsonb not null default '[]'::jsonb,
  transactions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, year, month)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_category_id text,
  category_alert_auth_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_preferences
add column if not exists category_alert_auth_count integer not null default 0;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_monthly_budgets_updated_at on public.monthly_budgets;
create trigger set_monthly_budgets_updated_at
before update on public.monthly_budgets
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

alter table public.monthly_budgets enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Users can read their own monthly budgets" on public.monthly_budgets;
create policy "Users can read their own monthly budgets"
on public.monthly_budgets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own monthly budgets" on public.monthly_budgets;
create policy "Users can insert their own monthly budgets"
on public.monthly_budgets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own monthly budgets" on public.monthly_budgets;
create policy "Users can update their own monthly budgets"
on public.monthly_budgets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own monthly budgets" on public.monthly_budgets;
create policy "Users can delete their own monthly budgets"
on public.monthly_budgets
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own preferences" on public.user_preferences;
create policy "Users can read their own preferences"
on public.user_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences" on public.user_preferences;
create policy "Users can insert their own preferences"
on public.user_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences" on public.user_preferences;
create policy "Users can update their own preferences"
on public.user_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own preferences" on public.user_preferences;
create policy "Users can delete their own preferences"
on public.user_preferences
for delete
to authenticated
using (auth.uid() = user_id);
