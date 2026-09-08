-- Amplía las publicaciones sin borrar datos y unifica las reglas de Storage.
alter table public.publicaciones add column if not exists cantidad integer not null default 1;
alter table public.publicaciones add column if not exists imagenes jsonb not null default '[]'::jsonb;

update public.publicaciones
set imagenes = jsonb_build_array(imagen_url)
where imagen_url is not null and jsonb_array_length(imagenes) = 0;

alter table public.publicaciones drop constraint if exists publicaciones_cantidad_check;
alter table public.publicaciones add constraint publicaciones_cantidad_check check (cantidad > 0);

drop policy if exists "Users upload own uniform images" on storage.objects;
drop policy if exists "Users update own uniform images" on storage.objects;
drop policy if exists "Users delete own uniform images" on storage.objects;
drop policy if exists "uniformes_insert_own_folder" on storage.objects;
drop policy if exists "uniformes_update_own_folder" on storage.objects;
drop policy if exists "uniformes_delete_own_folder" on storage.objects;

create policy "uniformes_insert_own_folder" on storage.objects for insert to authenticated
with check (bucket_id = 'uniformes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "uniformes_update_own_folder" on storage.objects for update to authenticated
using (bucket_id = 'uniformes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "uniformes_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id = 'uniformes' and (storage.foldername(name))[1] = auth.uid()::text);