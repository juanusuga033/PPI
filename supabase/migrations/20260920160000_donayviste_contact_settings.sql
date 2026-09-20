-- Configuración pública editable del apartado Contacto.
create table if not exists public.contact_settings (
  id integer primary key default 1 check (id = 1),
  title text not null default 'DONA Y VISTE',
  subtitle text not null default 'Contáctanos',
  phone text not null default '336-4824793',
  email text not null default 'donayviste@gmail.com',
  website text not null default 'www.Donayviste.com',
  address text not null default 'Santo Domingo - Medellín',
  updated_at timestamptz not null default now()
  image_url text not null default '/catalog/uniforme-15-page-4.jpeg'
);

alter table public.contact_settings
  add column if not exists image_url text not null default '/catalog/uniforme-15-page-4.jpeg';

insert into public.contact_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.contact_settings enable row level security;

drop policy if exists "contact_settings_public_read" on public.contact_settings;
create policy "contact_settings_public_read" on public.contact_settings
for select using (true);

drop policy if exists "contact_settings_admin_update" on public.contact_settings;
create policy "contact_settings_admin_update" on public.contact_settings
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists "contact_settings_admin_insert" on public.contact_settings;
create policy "contact_settings_admin_insert" on public.contact_settings
for insert with check (public.is_admin());

create or replace function public.set_contact_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_settings_updated_at on public.contact_settings;
create trigger contact_settings_updated_at
before update on public.contact_settings
for each row execute function public.set_contact_settings_updated_at();
