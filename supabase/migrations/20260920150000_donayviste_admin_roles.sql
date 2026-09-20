-- Roles administrativos para gestionar perfiles y publicaciones desde la aplicación.
alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists status text not null default 'active';

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

alter table public.profiles
  drop constraint if exists profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check check (status in ('active', 'inactive'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

-- Asigna el primer administrador por correo, tanto si ya existe como si fue creado antes.
insert into public.profiles (id, email, nombre, apellido, role, status)
select id, email,
  coalesce(raw_user_meta_data->>'first_name', ''),
  coalesce(raw_user_meta_data->>'last_name', ''),
  'admin', 'active'
from auth.users
where lower(email) = lower('restrepojohan225@gmail.com')
on conflict (id) do update set role = 'admin', status = 'active', email = excluded.email;

-- Nuevos perfiles conservan el rol de usuario por defecto.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellido, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    'user',
    'active'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "publications_admin_select" on public.publicaciones;
create policy "publications_admin_select" on public.publicaciones
for select using (public.is_admin());

drop policy if exists "publications_admin_update" on public.publicaciones;
create policy "publications_admin_update" on public.publicaciones
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists "publications_admin_delete" on public.publicaciones;
create policy "publications_admin_delete" on public.publicaciones
for delete using (public.is_admin());
