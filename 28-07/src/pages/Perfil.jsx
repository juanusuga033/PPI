import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { removePublicationImage, removeProfileImage, uploadProfileImage, validateImage } from '../lib/publicationService'
import { useAuth } from '../lib/AuthContext'
import '../styles/Perfil.css'

export default function Perfil() {
  const { user, profile } = useAuth()
  const [publicaciones, setPublicaciones] = useState([])
  const [form, setForm] = useState({ nombre: '', apellido: '', avatar_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchPublicaciones = useCallback(async () => {
    const { data, error: queryError } = await supabase.from('publicaciones').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setPublicaciones(data || [])
    setLoading(false)
  }, [user])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) return
    setForm({ nombre: profile?.nombre || user.user_metadata?.first_name || '', apellido: profile?.apellido || user.user_metadata?.last_name || '', avatar_url: profile?.avatar_url || '' })
    fetchPublicaciones()
  }, [user, profile, fetchPublicaciones])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Guarda los datos básicos y la fotografía del perfil en Supabase Storage.
  async function saveProfile(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    let uploadedUrl = null
    try {
      let avatarUrl = form.avatar_url || null
      if (avatarFile) {
        avatarUrl = (await uploadProfileImage(avatarFile, user.id)).url
        uploadedUrl = avatarUrl
      }
      const { error: updateError } = await supabase.from('profiles').upsert({ id: user.id, nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: user.email, avatar_url: avatarUrl }, { onConflict: 'id' })
      if (updateError) throw updateError
      if (avatarFile && profile?.avatar_url) await removeProfileImage(profile.avatar_url)
      setForm(current => ({ ...current, avatar_url: avatarUrl || '' })); setAvatarFile(null); setAvatarPreview('')
      setMessage('Perfil actualizado correctamente.')
    } catch (profileError) {
      if (uploadedUrl) await removeProfileImage(uploadedUrl).catch(() => {})
      setError(profileError.message)
    } finally { setSaving(false) }
  }

  // Valida y muestra inmediatamente la nueva fotografía antes de guardarla.
  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try { validateImage(file, 3 * 1024 * 1024); setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); setError('') }
    catch (imageError) { setError(imageError.message); event.target.value = '' }
  }

  // Elimina la fotografía almacenada y deja el perfil sin avatar.
  async function deleteAvatar() {
    if (!form.avatar_url || !confirm('¿Deseas eliminar tu foto de perfil?')) return
    setSaving(true); setError(''); setMessage('')
    try {
      await removeProfileImage(form.avatar_url)
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
      if (updateError) throw updateError
      setForm(current => ({ ...current, avatar_url: '' })); setMessage('Foto de perfil eliminada.')
    } catch (avatarError) { setError(avatarError.message) } finally { setSaving(false) }
  }

  // Cambia el estado de una publicación que pertenece al usuario autenticado.
  async function changeStatus(publication, estado) {
    setError('')
    const { data, error: updateError } = await supabase.from('publicaciones').update({ estado }).eq('id', publication.id).eq('usuario_id', user.id).select().single()
    if (updateError) return setError(updateError.message)
    setPublicaciones(current => current.map(item => item.id === publication.id ? data : item))
  }

  // Elimina la publicación propia y todas sus imágenes después de confirmarlo.
  async function handleDelete(publication) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return
    setError('')
    try {
      const { error: deleteError } = await supabase.from('publicaciones').delete().eq('id', publication.id).eq('usuario_id', user.id)
      if (deleteError) throw deleteError
      const imageUrls = publication.imagenes?.length ? publication.imagenes : [publication.imagen_url]
      await Promise.all(imageUrls.filter(Boolean).map(removePublicationImage))
      setPublicaciones(current => current.filter(item => item.id !== publication.id))
    } catch (deleteError) { setError(deleteError.message) }
  }

  if (!user || loading) return <p className="loading">Cargando tu perfil...</p>
  const active = publicaciones.filter(item => item.estado === 'activo').length
  const donations = publicaciones.filter(item => item.tipo === 'donacion').length

  return <div className="perfil-page">
    <section className="perfil-header">
      <div className="perfil-identity">
        <div className="profile-avatar profile-avatar-large">{avatarPreview || form.avatar_url ? <img src={avatarPreview || form.avatar_url} alt="Foto de perfil" /> : <span>{form.nombre?.[0] || user.email?.[0] || '?'}</span>}</div>
        <div><span className="eyebrow">Mi cuenta</span><h1>{form.nombre || 'Tu perfil'} {form.apellido}</h1><p className="email">{user.email}</p><p className="profile-note">Gestiona tu información y tus prendas publicadas.</p></div>
      </div>
      <div className="profile-stats"><div><strong>{publicaciones.length}</strong><span>Publicaciones</span></div><div><strong>{active}</strong><span>Activas</span></div><div><strong>{donations}</strong><span>Donaciones</span></div></div>
    </section>
    <div className="perfil-content">
      <section className="profile-panel"><div className="section-heading"><div><span className="eyebrow">Información personal</span><h2>Datos de tu cuenta</h2></div><span className="profile-status">Cuenta activa</span></div>
        <form onSubmit={saveProfile} className="perfil-form"><div className="avatar-editor"><div className="profile-avatar">{avatarPreview || form.avatar_url ? <img src={avatarPreview || form.avatar_url} alt="Vista previa de perfil" /> : <span>{form.nombre?.[0] || '?'}</span>}</div><label className="file-button">Cambiar foto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} /></label><small>JPG, PNG o WebP · máximo 3 MB</small>{form.avatar_url && <button type="button" className="danger-link" onClick={deleteAvatar} disabled={saving}>Eliminar foto</button>}</div><div className="profile-fields"><label>Nombre<input value={form.nombre} onChange={event => setForm({ ...form, nombre: event.target.value })} required /></label><label>Apellido<input value={form.apellido} onChange={event => setForm({ ...form, apellido: event.target.value })} required /></label><label>Correo electrónico<input value={user.email || ''} readOnly /></label><div className="profile-actions"><button className="button primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button></div></div></form>
      </section>
      {message && <div className="form-success">{message}</div>}{error && <div className="form-error">{error}</div>}
      <section className="profile-panel"><div className="section-heading"><div><span className="eyebrow">Tu actividad</span><h2>Mis publicaciones</h2></div><Link className="edit-btn" to="/donar">Nueva donación</Link></div>{publicaciones.length === 0 ? <div className="empty-state">Aún no tienes publicaciones. Comparte una prenda para darle una nueva historia.</div> : <div className="publicaciones-list">{publicaciones.map(pub => <article key={pub.id} className="publicacion-item"><div className="item-image">{pub.imagen_url ? <img src={pub.imagen_url} alt={pub.titulo} /> : <span>Sin foto</span>}</div><div className="item-info"><div className="publication-kicker"><span>{pub.tipo === 'donacion' ? 'Donación' : 'Venta'}</span><span>{pub.estado}</span></div><h3>{pub.titulo}</h3><p>Talla {pub.talla || 'por confirmar'} · {pub.condicion || 'Estado no indicado'}</p><div className="item-actions"><Link className="edit-btn" to={`/producto/${pub.id}`}>Editar</Link><button className="edit-btn" onClick={() => changeStatus(pub, pub.estado === 'activo' ? 'pausado' : 'activo')}>{pub.estado === 'activo' ? 'Pausar' : 'Activar'}</button><button className="delete-btn" onClick={() => handleDelete(pub)}>Eliminar</button></div></div></article>)}</div>}</section>
    </div>
  </div>
}
