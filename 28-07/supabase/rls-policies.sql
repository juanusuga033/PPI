-- Esquema y políticas RLS para la tabla `publicaciones` y el bucket `uniformes`.
-- DIAGNÓSTICO (verificado vía REST API con la anon key del proyecto conectado):
--   Proyecto Supabase enlazado: vwluchviqucbqjobqxgt. Este script es seguro de
--   re-ejecutar completo en cualquier momento (usa IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- ACCIÓN REQUERIDA (no puedo ejecutarlo yo: solo tengo la anon/publishable key,
-- que no permite DDL; se necesita el SQL Editor del dashboard o la service_role key):
--   1. Entra a https://supabase.com/dashboard/project/vwluchviqucbqjobqxgt/sql/new
--   2. Pega y ejecuta este archivo completo.
--   3. Verifica en Storage que el bucket "uniformes" quedó creado como público.

create table if not exists public.publicaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  precio numeric,
  talla text,
  descripcion text,
  contacto text,
  imagen_url text,
  tipo text not null default 'venta' check (tipo in ('venta', 'donacion')),
  estado text not null default 'activo',
  created_at timestamptz not null default now()
);

-- Condición física del uniforme (nuevo/buen estado/usado), separada del estado de publicación.
alter table public.publicaciones add column if not exists condicion text;

alter table public.publicaciones enable row level security;

-- Lectura pública (catálogo de compra/donaciones visible sin login)
drop policy if exists "publicaciones_select_public" on public.publicaciones;
create policy "publicaciones_select_public"
  on public.publicaciones for select
  using (true);

-- Solo el dueño puede crear publicaciones a su propio nombre
drop policy if exists "publicaciones_insert_own" on public.publicaciones;
create policy "publicaciones_insert_own"
  on public.publicaciones for insert
  with check (auth.uid() = usuario_id);

-- Solo el dueño puede editar sus publicaciones
drop policy if exists "publicaciones_update_own" on public.publicaciones;
create policy "publicaciones_update_own"
  on public.publicaciones for update
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- Solo el dueño puede eliminar sus publicaciones
drop policy if exists "publicaciones_delete_own" on public.publicaciones;
create policy "publicaciones_delete_own"
  on public.publicaciones for delete
  using (auth.uid() = usuario_id);

-- Storage: bucket "uniformes" con lectura pública y escritura solo autenticada
insert into storage.buckets (id, name, public)
values ('uniformes', 'uniformes', true)
on conflict (id) do nothing;

drop policy if exists "uniformes_public_read" on storage.objects;
create policy "uniformes_public_read"
  on storage.objects for select
  using (bucket_id = 'uniformes');

drop policy if exists "uniformes_auth_insert" on storage.objects;
create policy "uniformes_auth_insert"
  on storage.objects for insert
  with check (bucket_id = 'uniformes' and auth.role() = 'authenticated');

drop policy if exists "uniformes_owner_delete" on storage.objects;
create policy "uniformes_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'uniformes' and auth.role() = 'authenticated');

-- Comunidad: publicaciones y comentarios entre usuarios de la I.E. La Candelaria.
create table if not exists public.comunidad_posts (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comunidad_comentarios (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.comunidad_posts(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

alter table public.comunidad_posts enable row level security;
alter table public.comunidad_comentarios enable row level security;

drop policy if exists "comunidad_posts_select_public" on public.comunidad_posts;
create policy "comunidad_posts_select_public"
  on public.comunidad_posts for select
  using (true);

drop policy if exists "comunidad_posts_insert_own" on public.comunidad_posts;
create policy "comunidad_posts_insert_own"
  on public.comunidad_posts for insert
  with check (auth.uid() = usuario_id);

drop policy if exists "comunidad_posts_delete_own" on public.comunidad_posts;
create policy "comunidad_posts_delete_own"
  on public.comunidad_posts for delete
  using (auth.uid() = usuario_id);

drop policy if exists "comunidad_comentarios_select_public" on public.comunidad_comentarios;
create policy "comunidad_comentarios_select_public"
  on public.comunidad_comentarios for select
  using (true);

drop policy if exists "comunidad_comentarios_insert_own" on public.comunidad_comentarios;
create policy "comunidad_comentarios_insert_own"
  on public.comunidad_comentarios for insert
  with check (auth.uid() = usuario_id);

drop policy if exists "comunidad_comentarios_delete_own" on public.comunidad_comentarios;
create policy "comunidad_comentarios_delete_own"
  on public.comunidad_comentarios for delete
  using (auth.uid() = usuario_id);

-- Formulario de contacto: cualquier visitante puede enviar un mensaje, nadie puede leerlos vía API pública.
create table if not exists public.mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  mensaje text not null,
  created_at timestamptz not null default now()
);

alter table public.mensajes_contacto enable row level security;

drop policy if exists "mensajes_contacto_insert_public" on public.mensajes_contacto;
create policy "mensajes_contacto_insert_public"
  on public.mensajes_contacto for insert
  with check (true);
