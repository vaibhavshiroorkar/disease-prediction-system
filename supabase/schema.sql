-- Disease Prediction System — Supabase schema
-- Run this in the Supabase SQL editor after creating the project.
-- Auth (email + Google OAuth) is configured in the Supabase dashboard, not here.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    age int,
    gender text check (gender in ('male','female','other') or gender is null),
    locale text default 'en',
    created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- predictions: every inference run, regardless of which model
-- ---------------------------------------------------------------------------
create table if not exists public.predictions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    kind text not null check (kind in ('symptom','diabetes','heart','stroke','weather')),
    input jsonb not null,
    output jsonb not null,
    top_label text,
    top_probability numeric(6,4),
    created_at timestamptz default now()
);

create index if not exists predictions_user_idx on public.predictions(user_id, created_at desc);
create index if not exists predictions_kind_idx on public.predictions(kind);

-- ---------------------------------------------------------------------------
-- saved_locations: for weather/outbreak monitoring
-- ---------------------------------------------------------------------------
create table if not exists public.saved_locations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    label text not null,
    latitude numeric(8,5) not null,
    longitude numeric(8,5) not null,
    created_at timestamptz default now()
);

create index if not exists saved_locations_user_idx on public.saved_locations(user_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.predictions      enable row level security;
alter table public.saved_locations  enable row level security;

drop policy if exists "profiles self read"    on public.profiles;
drop policy if exists "profiles self upsert"  on public.profiles;
drop policy if exists "profiles self update"  on public.profiles;
create policy "profiles self read"    on public.profiles for select using (auth.uid() = id);
create policy "profiles self upsert"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update"  on public.profiles for update using (auth.uid() = id);

drop policy if exists "predictions owner read"   on public.predictions;
drop policy if exists "predictions owner write"  on public.predictions;
drop policy if exists "predictions owner delete" on public.predictions;
create policy "predictions owner read"   on public.predictions for select using (auth.uid() = user_id);
create policy "predictions owner write"  on public.predictions for insert with check (auth.uid() = user_id);
create policy "predictions owner delete" on public.predictions for delete using (auth.uid() = user_id);

drop policy if exists "locations owner all" on public.saved_locations;
create policy "locations owner all" on public.saved_locations
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Convenience view: user dashboard summary
-- ---------------------------------------------------------------------------
create or replace view public.v_prediction_summary as
select
    user_id,
    kind,
    count(*)::int as total,
    max(created_at) as last_at
from public.predictions
group by user_id, kind;
