-- Apply with the Supabase CLI or the SQL editor.  This preserves RLS: no service key is used by the client.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  apellido text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Profiles are private" on public.profiles;
drop policy if exists "Users create own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
create policy "Profiles are private" on public.profiles for select using (auth.uid() = id);
create policy "Users create own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, apellido, email)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name', new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.publicaciones enable row level security;
drop policy if exists "Public can read publications" on public.publicaciones;
drop policy if exists "Users create own publications" on public.publicaciones;
drop policy if exists "Users update own publications" on public.publicaciones;
drop policy if exists "Users delete own publications" on public.publicaciones;
create policy "Public can read publications" on public.publicaciones for select using (estado is null or estado = 'activo');
create policy "Users create own publications" on public.publicaciones for insert to authenticated with check (auth.uid() = usuario_id);
create policy "Users update own publications" on public.publicaciones for update to authenticated using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
create policy "Users delete own publications" on public.publicaciones for delete to authenticated using (auth.uid() = usuario_id);

-- Create bucket 'uniformes' as public in the dashboard once, then keep files inside publicaciones/<user-id>/.
drop policy if exists "Public reads uniform images" on storage.objects;
drop policy if exists "Users upload own uniform images" on storage.objects;
drop policy if exists "Users update own uniform images" on storage.objects;
drop policy if exists "Users delete own uniform images" on storage.objects;
create policy "Public reads uniform images" on storage.objects for select using (bucket_id = 'uniformes');
create policy "Users upload own uniform images" on storage.objects for insert to authenticated with check (bucket_id = 'uniformes' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "Users update own uniform images" on storage.objects for update to authenticated using (bucket_id = 'uniformes' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "Users delete own uniform images" on storage.objects for delete to authenticated using (bucket_id = 'uniformes' and (storage.foldername(name))[2] = auth.uid()::text);
