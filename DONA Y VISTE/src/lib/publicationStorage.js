import { supabase } from './supabaseClient'

const bucket = 'uniformes'
export async function uploadPublicationImage(userId, file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `publicaciones/${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  return { path, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl }
}
export async function removePublicationImage(imageUrl) {
  if (!imageUrl) return
  const marker = `/storage/v1/object/public/${bucket}/`
  const path = imageUrl.includes(marker) ? decodeURIComponent(imageUrl.split(marker)[1].split('?')[0]) : null
  if (!path) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
