import { supabase } from './supabaseClient'

export const IMAGE_BUCKET = 'uniformes'

// Sube una imagen de publicación a la carpeta del usuario autenticado.
export async function uploadPublicationImage(file, userId) {
  if (!file) return { url: null, path: null }
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

// Convierte una URL pública de Storage en la ruta interna del archivo.
export function storagePathFromUrl(url) {
  if (!url) return null
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`
  const index = url.indexOf(marker)
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length))
}

// Elimina de Storage una imagen asociada a una publicación.
export async function removePublicationImage(url) {
  const path = storagePathFromUrl(url)
  if (!path) return
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path])
  if (error) throw error
}