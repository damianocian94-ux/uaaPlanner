-- =====================================================================
-- UAA Planner · Fase 1 · Esquema base
-- profiles, social_accounts, app_settings, audit_logs, ping()
-- Regla: TODA tabla de public lleva RLS (ver supabase/tests).
-- =====================================================================

-- Utilidad: updated_at automático ---------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Perfiles / roles --------------------------------------------------------
create type public.app_role as enum ('manager', 'member');

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique check (username ~ '^[a-z0-9._-]{2,32}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  role         public.app_role not null default 'member',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Todos los integrantes autenticados ven el equipo (necesario para asignar tareas).
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Sin políticas de insert/update/delete: solo la service_role (script de administración)
-- puede crear perfiles o cambiar roles. Un usuario no puede elevar su propio rol.

-- ¿El usuario actual es manager? (security definer para usarlo dentro de políticas RLS)
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'manager'
  );
$$;

revoke all on function public.is_manager() from public, anon;
grant execute on function public.is_manager() to authenticated;

-- Cuentas de redes sociales -------------------------------------------------
create table public.social_accounts (
  id         text primary key check (id ~ '^[a-z]{2,16}$'),
  name       text not null,
  handle     text,
  color      text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order smallint not null default 0
);

alter table public.social_accounts enable row level security;

create policy "social_accounts_select_authenticated"
  on public.social_accounts for select
  to authenticated
  using (true);

create policy "social_accounts_write_manager"
  on public.social_accounts for all
  to authenticated
  using ((select public.is_manager()))
  with check ((select public.is_manager()));

-- Datos de configuración (no personales), tomados de V15.
insert into public.social_accounts (id, name, handle, color, sort_order) values
  ('inst',  'UAA Institucional', '@unionagricoladeavellaneda', '#004AA1', 1),
  ('agro',  'UAA Agro',          '@agrouaa',                   '#0C670E', 2),
  ('cor',   'UAA Corralón',      '@corralonferreteria.uaa',    '#DA5215', 3),
  ('super', 'Super UAA',         '@supermercadouaa',           '#C62828', 4);

-- Configuración de la aplicación ---------------------------------------------
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;

create policy "app_settings_select_authenticated"
  on public.app_settings for select
  to authenticated
  using (true);

create policy "app_settings_write_manager"
  on public.app_settings for all
  to authenticated
  using ((select public.is_manager()))
  with check ((select public.is_manager()));

insert into public.app_settings (key, value) values
  ('media_limits', '{"image_max_mb": 10, "video_max_mb": 100, "max_files_per_post": 10}'),
  ('trash_retention_days', '30'),
  ('storage_alert_thresholds', '{"warning": 0.7, "critical": 0.9}');

-- Auditoría -----------------------------------------------------------------
create table public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

-- Solo la supervisora consulta la auditoría. Las escrituras se harán desde
-- funciones security definer (no hay política de insert para clientes).
create policy "audit_logs_select_manager"
  on public.audit_logs for select
  to authenticated
  using ((select public.is_manager()));

-- Keepalive ------------------------------------------------------------------
-- Consulta liviana usada por .github/workflows/keepalive.yml.
create or replace function public.ping()
returns text
language sql
stable
set search_path = ''
as $$
  select 'ok'::text;
$$;

grant execute on function public.ping() to anon, authenticated;
