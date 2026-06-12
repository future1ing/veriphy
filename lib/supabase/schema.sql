-- ═══════════════════════════════════════════════════════════
-- Veriphy — Supabase Schema
-- Coller et exécuter dans : Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- ─── PROFILES ─────────────────────────────────────────────
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text unique not null,
  name                  text not null default 'Utilisateur',
  phone                 text,
  country               text default 'MA',
  language              text default 'fr',
  role                  text default 'client' check (role in ('client','admin')),
  plan                  text default 'free'   check (plan in ('free','starter','pro','business')),
  is_active             boolean default true,
  crops                 text default '',
  countries_watched     text default 'EU',
  notify_channels       text default 'email',
  min_severity          text default 'info'   check (min_severity in ('info','warning','critical')),
  stripe_customer_id    text unique,
  stripe_subscription_id text,
  plan_expires_at       timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── ALERTS ───────────────────────────────────────────────
create table public.alerts (
  id              bigserial primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  event_type      text not null,
  severity        text not null check (severity in ('critical','warning','info')),
  substance_name  text not null,
  substance_id    text,
  product_code    text,
  product_name    text,
  old_mrl         text,
  new_mrl         text,
  regulation      text,
  description     text not null,
  country         text default 'EU',
  source          text default 'EU_Commission',
  detected_at     text,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

create index idx_alerts_user_id   on public.alerts(user_id);
create index idx_alerts_severity  on public.alerts(severity);
create index idx_alerts_is_read   on public.alerts(is_read);
create index idx_alerts_created   on public.alerts(created_at desc);

-- ─── SNAPSHOTS ────────────────────────────────────────────
create table public.snapshots (
  id                bigserial primary key,
  snapshot_id       text unique not null,
  country           text not null,
  source            text not null,
  db_creation_date  text,
  extracted_at      timestamptz default now(),
  total_substances  integer default 0,
  total_records     integer default 0,
  storage_path      text,
  is_current        boolean default false
);

-- ─── DIFF REPORTS ─────────────────────────────────────────
create table public.diff_reports (
  id                  bigserial primary key,
  report_id           text unique not null,
  snapshot_old        text,
  snapshot_new        text,
  country             text default 'EU',
  total_changes       integer default 0,
  critical_count      integer default 0,
  warning_count       integer default 0,
  info_count          integer default 0,
  substances_affected integer default 0,
  generated_at        timestamptz default now(),
  report_data         jsonb
);

-- ─── NOTIFICATION LOGS ────────────────────────────────────
create table public.notification_logs (
  id        bigserial primary key,
  user_id   uuid references public.profiles(id) on delete cascade,
  alert_id  bigint references public.alerts(id),
  channel   text check (channel in ('email','whatsapp','sms')),
  status    text check (status in ('sent','failed','dry_run')),
  sent_at   timestamptz default now(),
  error_msg text
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.alerts            enable row level security;
alter table public.notification_logs enable row level security;
alter table public.snapshots         enable row level security;
alter table public.diff_reports      enable row level security;

create policy "own profile"    on public.profiles          for all using (auth.uid() = id);
create policy "own alerts"     on public.alerts            for all using (auth.uid() = user_id);
create policy "own notifs"     on public.notification_logs for all using (auth.uid() = user_id);
create policy "read snapshots" on public.snapshots         for select using (true);
create policy "read reports"   on public.diff_reports      for select using (true);

-- ─── HELPER: alert stats ─────────────────────────────────
create or replace function public.get_alert_stats(p_user_id uuid)
returns json language sql security definer as $$
  select json_build_object(
    'total',    count(*),
    'unread',   count(*) filter (where not is_read),
    'critical', count(*) filter (where severity = 'critical'),
    'warning',  count(*) filter (where severity = 'warning'),
    'info',     count(*) filter (where severity = 'info')
  ) from public.alerts where user_id = p_user_id;
$$;

-- ─── SEED: demo admin ─────────────────────────────────────
-- Après ta première inscription sur veriphy.app :
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'ton@email.com';
