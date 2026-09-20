-- Crea el almacenamiento requerido por las publicaciones y perfiles.
insert into storage.buckets (id, name, public)
values ('uniformes', 'uniformes', true)
on conflict (id) do update set public = true;

drop policy if exists "uniformes_read_public" on storage.objects;
create policy "uniformes_read_public" on storage.objects
for select using (bucket_id = 'uniformes');

drop policy if exists "uniformes_insert_own_folder" on storage.objects;
create policy "uniformes_insert_own_folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'uniformes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uniformes_update_own_folder" on storage.objects;
create policy "uniformes_update_own_folder" on storage.objects
for update to authenticated
using (
  bucket_id = 'uniformes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'uniformes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uniformes_delete_own_folder" on storage.objects;
create policy "uniformes_delete_own_folder" on storage.objects
for delete to authenticated
using (
  bucket_id = 'uniformes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
