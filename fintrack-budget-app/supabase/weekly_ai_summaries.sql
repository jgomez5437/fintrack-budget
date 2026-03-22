-- ============================================================
-- Weekly AI Summaries
-- Run this in your Supabase SQL editor
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists weekly_ai_summaries (
  id            uuid        default uuid_generate_v4() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  week_start    date        not null,  -- the Sunday that starts the reporting window (prev Sun)
  week_end      date        not null,  -- the Saturday that ends the reporting window
  generated_on  date        not null,  -- the Sunday this was generated
  summary_text  text        not null,
  created_at    timestamptz default now()
);

-- Each user can only have one summary per generation Sunday
create unique index if not exists weekly_summaries_unique
  on weekly_ai_summaries(user_id, generated_on);

-- Row Level Security
alter table weekly_ai_summaries enable row level security;

create policy "Users can read own summaries"
  on weekly_ai_summaries for select
  using (auth.uid() = user_id);

create policy "Users can insert own summaries"
  on weekly_ai_summaries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own summaries"
  on weekly_ai_summaries for delete
  using (auth.uid() = user_id);
