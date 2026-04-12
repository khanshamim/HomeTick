-- ============================================================
-- HomeTick v2 — Multi-family Supabase (PostgreSQL) schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- MIGRATION NOTE: If upgrading from v1, run the migration script
-- at the bottom of this file rather than the full CREATE statements.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── families ────────────────────────────────────────────────
create table if not exists public.families (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    created_at timestamptz not null default now()
);

-- ─── users ───────────────────────────────────────────────────
create table if not exists public.users (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    role       text not null default 'member' check (role in ('admin', 'member')),
    family_id  uuid not null references public.families(id) on delete cascade,
    fcm_token  text,
    created_at timestamptz not null default now()
);

-- ─── tasks ───────────────────────────────────────────────────
create table if not exists public.tasks (
    id          uuid primary key default gen_random_uuid(),
    title       text not null,
    assigned_to uuid not null references public.users(id) on delete cascade,
    created_by  uuid not null references public.users(id) on delete cascade,
    family_id   uuid not null references public.families(id) on delete cascade,
    is_daily    boolean not null default true,
    due_time    time,
    created_at  timestamptz not null default now()
);

-- ─── task_status ─────────────────────────────────────────────
create table if not exists public.task_status (
    id        uuid primary key default gen_random_uuid(),
    task_id   uuid not null references public.tasks(id) on delete cascade,
    user_id   uuid not null references public.users(id) on delete cascade,
    date      date not null,
    completed boolean not null default false,

    unique (task_id, user_id, date)
);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_families_name        on public.families(name);
create index if not exists idx_users_family_id      on public.users(family_id);
create index if not exists idx_tasks_family_id      on public.tasks(family_id);
create index if not exists idx_tasks_assigned_to    on public.tasks(assigned_to);
create index if not exists idx_task_status_user     on public.task_status(user_id, date);
create index if not exists idx_task_status_task     on public.task_status(task_id, date);

-- ─── Row Level Security (RLS) ────────────────────────────────
-- The FastAPI backend uses a service-role key that bypasses RLS.
-- Enable RLS and add family-scoped policies when you add Supabase Auth.

alter table public.families    enable row level security;
alter table public.users       enable row level security;
alter table public.tasks       enable row level security;
alter table public.task_status enable row level security;

-- Full access for the service role (used by FastAPI)
create policy "service role full access - families"   on public.families   using (true) with check (true);
create policy "service role full access - users"      on public.users      using (true) with check (true);
create policy "service role full access - tasks"      on public.tasks      using (true) with check (true);
create policy "service role full access - task_status" on public.task_status using (true) with check (true);


-- ─── Seed: example multi-family data ─────────────────────────
-- Uncomment to pre-populate two example families.

-- insert into public.families (id, name) values
--     ('11111111-0000-0000-0000-000000000001', 'The Smiths'),
--     ('22222222-0000-0000-0000-000000000002', 'The Johnsons')
-- on conflict do nothing;

-- insert into public.users (name, role, family_id) values
--     ('Dad',   'admin',  '11111111-0000-0000-0000-000000000001'),
--     ('Mom',   'admin',  '11111111-0000-0000-0000-000000000001'),
--     ('Alice', 'member', '11111111-0000-0000-0000-000000000001'),
--     ('Bob',   'admin',  '22222222-0000-0000-0000-000000000002'),
--     ('Carol', 'member', '22222222-0000-0000-0000-000000000002')
-- on conflict do nothing;


-- ─── Migration from v1 (single-family) ───────────────────────
-- Run ONLY if upgrading an existing v1 database.
--
-- Step 1: Create the families table
-- create table if not exists public.families ( ... );  -- see above
--
-- Step 2: Create a default family for existing data
-- insert into public.families (id, name) values
--     ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'My Family');
--
-- Step 3: Add family_id to users
-- alter table public.users
--     add column if not exists family_id uuid
--         references public.families(id) on delete cascade,
--     add column if not exists created_at timestamptz not null default now();
--
-- update public.users set family_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
--     where family_id is null;
--
-- alter table public.users alter column family_id set not null;
--
-- Step 4: Add created_by and family_id to tasks
-- alter table public.tasks
--     add column if not exists created_by uuid
--         references public.users(id) on delete cascade,
--     add column if not exists family_id uuid
--         references public.families(id) on delete cascade;
--
-- -- Assign existing tasks to the default family and first admin
-- update public.tasks t
-- set family_id  = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
--     created_by = (select id from public.users where role = 'admin' limit 1)
-- where t.family_id is null;
--
-- alter table public.tasks
--     alter column created_by set not null,
--     alter column family_id  set not null;
--
-- Step 5: Create new indexes
-- create index if not exists idx_users_family_id   on public.users(family_id);
-- create index if not exists idx_tasks_family_id   on public.tasks(family_id);
