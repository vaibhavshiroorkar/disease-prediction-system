-- ============================================================
-- Disease Prediction System — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Prediction history table
create table if not exists public.predictions (
  id         uuid        primary key default gen_random_uuid(),
  symptoms   text[]      not null,
  top_prediction text,
  confidence float,
  model_accuracy float,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists predictions_created_at_idx
  on public.predictions (created_at desc);

create index if not exists predictions_top_prediction_idx
  on public.predictions (top_prediction);

-- Enable Row Level Security
alter table public.predictions enable row level security;

-- Allow the anon key (used by the backend) to INSERT
create policy "anon can insert predictions"
  on public.predictions
  for insert
  to anon
  with check (true);

-- Allow authenticated users / service role to SELECT
create policy "service role can select predictions"
  on public.predictions
  for select
  to service_role
  using (true);
