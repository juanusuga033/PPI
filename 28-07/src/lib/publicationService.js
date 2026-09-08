import { supabase } from './supabaseClient'

export const IMAGE_BUCKET = 'uniformes'

// Valida que los archivos subidos sean imágenes pequeñas y seguras para la aplicación.
export function validateImage(file, maxSize = 5 * 1024 * 1024) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!file || !validTypes.includes(file.type)) {
    throw new Error('La imagen debe ser JPG, PNG o WebP.')
  }
  if (file.size > maxSize) throw new Error('La imagen no puede superar los 5 MB.')
}

// Sube una imagen de publicación dentro de la carpeta del usuario autenticado.
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

// Extrae la ruta interna de Storage a partir de una URL pública del bucket.
export function storagePathFromUrl(url) {
  if (!url) return null
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`
  const index = url.indexOf(marker)
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length))
}

// Elimina de Storage una imagen cuya URL pertenece al bucket de publicaciones.
export async function removePublicationImage(url) {
  const path = storagePathFromUrl(url)
  if (!path) return
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path])
  if (error) throw error
}

// Sube la fotografía de perfil del usuario autenticado a su carpeta privada.
export async function uploadProfileImage(file, userId) {
  validateImage(file, 3 * 1024 * 1024)
  const path = `${userId}/perfil-${crypto.randomUUID()}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600', contentType: file.type, upsert: false,
  })
  if (error) throw error
  return { path, url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl }
}

// Elimina una fotografía de perfil usando únicamente la ruta perteneciente al usuario.
export async function removeProfileImage(url) {
  return removePublicationImage(url)
}