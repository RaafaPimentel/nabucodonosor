create extension if not exists pgcrypto;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  source_name text not null,
  source_domain text not null,
  category text not null,
  summary text,
  image_url text,
  published_at timestamptz not null,
  language text not null default 'en',
  relevance_score numeric(10, 4) not null default 0,
  signal_summary text,
  dedupe_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists articles_dedupe_hash_idx on public.articles (dedupe_hash);
create index if not exists articles_category_published_at_idx on public.articles (category, published_at desc);
create index if not exists articles_relevance_score_idx on public.articles (relevance_score desc, published_at desc);

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  status text not null check (status in ('running', 'success', 'partial', 'failed')),
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  error_log text
);

create index if not exists sync_runs_started_at_idx on public.sync_runs (started_at desc);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('viewer', 'editor', 'operator', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_login_at timestamptz,
  disabled_at timestamptz
);

create index if not exists admin_users_role_idx on public.admin_users (role);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz,
  revoked_at timestamptz
);

create index if not exists admin_sessions_user_id_idx on public.admin_sessions (user_id);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions (expires_at);

create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  ip_address text,
  attempted_at timestamptz not null default timezone('utc', now()),
  success boolean not null default false
);

create index if not exists admin_login_attempts_username_idx on public.admin_login_attempts (username, attempted_at desc);
create index if not exists admin_login_attempts_ip_idx on public.admin_login_attempts (ip_address, attempted_at desc);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  resource text not null,
  ip_address text,
  user_agent text,
  details jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_audit_logs_user_id_idx on public.admin_audit_logs (user_id, created_at desc);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs (action, created_at desc);

alter table public.articles enable row level security;
alter table public.sync_runs enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_login_attempts enable row level security;
alter table public.admin_audit_logs enable row level security;
