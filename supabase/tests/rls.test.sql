-- Ejecutar con: supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(3);

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'Todas las tablas del esquema public tienen RLS habilitado'
);

-- Un usuario anónimo no puede leer perfiles.
set local role anon;
select is_empty(
  'select 1 from public.profiles',
  'anon no puede leer profiles'
);
reset role;

-- Un usuario autenticado no puede cambiar su propio rol (no hay política de update).
set local role authenticated;
select is(
  (with upd as (update public.profiles set role = 'manager' returning 1) select count(*)::int from upd),
  0,
  'authenticated no puede modificar roles en profiles'
);
reset role;

select * from finish();
rollback;
