import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { removePublicationImage, removeProfileImage, uploadProfileImage, validateImage } from '../lib/publicationService'
import { useAuth } from '../lib/AuthContext'
import FormField from '../components/ui/FormField'
import ImageUpload from '../components/ui/ImageUpload'
import '../styles/Perfil.css'

// Enmascara parcialmente un email para proteger la privacidad en la vista del encabezado.
function maskEmail(email) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = Math.min(3, local.length)
  const masked = local.slice(0, visible) + '*'.repeat(Math.max(4, local.length - visible))
  return `${masked}@${domain}`
}

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
  const [emailVisible, setEmailVisible] = useState(false)

  const fetchPublicaciones = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('publicaciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setPublicaciones(data || [])
    setLoading(false)
  }, [user])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) return
    setForm({
      nombre: profile?.nombre || user.user_metadata?.first_name || '',
      apellido: profile?.apellido || user.user_metadata?.last_name || '',
      avatar_url: profile?.avatar_url || '',
    })
    fetchPublicaciones()
  }, [user, profile, fetchPublicaciones])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Guarda datos básicos y fotografía del perfil en Supabase Storage.
  async function saveProfile(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    let uploadedUrl = null
    try {
      let avatarUrl = form.avatar_url || null
      if (avatarFile) {
        avatarUrl = (await uploadProfileImage(avatarFile, user.id)).url
        uploadedUrl = avatarUrl
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: user.email, avatar_url: avatarUrl }, { onConflict: 'id' })
      if (updateError) throw updateError
      if (avatarFile && profile?.avatar_url) await removeProfileImage(profile.avatar_url)
      setForm(current => ({ ...current, avatar_url: avatarUrl || '' }))
      setAvatarFile(null)
      setAvatarPreview('')
      setMessage('Perfil actualizado correctamente.')
    } catch (profileError) {
      if (uploadedUrl) await removeProfileImage(uploadedUrl).catch(() => {})
      setError(profileError.message)
    } finally {
      setSaving(false)
    }
  }

  // Maneja la selección de avatar desde el componente ImageUpload.
  function handleAvatarChange(files) {
    const file = files?.[0]
    if (!file) return
    try {
      validateImage(file, 3 * 1024 * 1024)
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setError('')
    } catch (imageError) {
      setError(imageError.message)
    }
  }

  // Elimina la fotografía almacenada y deja el perfil sin avatar.
  async function deleteAvatar() {
    if (!form.avatar_url || !confirm('¿Deseas eliminar tu foto de perfil?')) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await removeProfileImage(form.avatar_url)
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
      if (updateError) throw updateError
      setForm(current => ({ ...current, avatar_url: '' }))
      setAvatarPreview('')
      setMessage('Foto de perfil eliminada.')
    } catch (avatarError) {
      setError(avatarError.message)
    } finally {
      setSaving(false)
    }
  }

  // Cambia el estado de una publicación que pertenece al usuario autenticado.
  async function changeStatus(publication, estado) {
    setError('')
    const { data, error: updateError } = await supabase
      .from('publicaciones')
      .update({ estado })
      .eq('id', publication.id)
      .eq('usuario_id', user.id)
      .select()
      .single()
    if (updateError) return setError(updateError.message)
    setPublicaciones(current => current.map(item => item.id === publication.id ? data : item))
  }

  // Elimina la publicación propia y todas sus imágenes después de confirmarlo.
  async function handleDelete(publication) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return
    setError('')
    try {
      const { error: deleteError } = await supabase
        .from('publicaciones')
        .delete()
        .eq('id', publication.id)
        .eq('usuario_id', user.id)
      if (deleteError) throw deleteError
      const imageUrls = publication.imagenes?.length ? publication.imagenes : [publication.imagen_url]
      await Promise.all(imageUrls.filter(Boolean).map(removePublicationImage))
      setPublicaciones(current => current.filter(item => item.id !== publication.id))
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  if (!user || loading) return <p className="loading">Cargando tu perfil...</p>

  const active = publicaciones.filter(item => item.estado === 'activo').length
  const donations = publicaciones.filter(item => item.tipo === 'donacion').length

  return (
    <div className="perfil-page">

      {/* ENCABEZADO DE PERFIL */}
      <section className="perfil-header">
        <div className="perfil-identity">
          <div className="profile-avatar profile-avatar-large">
            {avatarPreview || form.avatar_url
              ? <img src={avatarPreview || form.avatar_url} alt="Foto de perfil" />
              : <span>{form.nombre?.[0] || user.email?.[0] || '?'}</span>}
          </div>
          <div>
            <span className="eyebrow">Mi cuenta</span>
            <h1>{form.nombre || 'Tu perfil'} {form.apellido}</h1>
            {/* Email enmascarado con toggle de visibilidad */}
            <div className="email-row">
              <p className="email-display">
                {emailVisible ? user.email : maskEmail(user.email)}
              </p>
              <button
                type="button"
                className="email-toggle"
                onClick={() => setEmailVisible(v => !v)}
                aria-label={emailVisible ? 'Ocultar correo' : 'Mostrar correo completo'}
                title={emailVisible ? 'Ocultar correo' : 'Mostrar correo'}
              >
                {emailVisible ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
              </button>
            </div>
            <p className="profile-note">Gestiona tu información y tus prendas publicadas.</p>
          </div>
        </div>

        {/* ESTADÍSTICAS COMO CHIPS */}
        <div className="profile-stats">
          <div className="stat-chip">
            <strong>{publicaciones.length}</strong>
            <span>Publicaciones</span>
          </div>
          <div className="stat-chip stat-chip--active">
            <strong>{active}</strong>
            <span>Activas</span>
          </div>
          <div className="stat-chip stat-chip--donation">
            <strong>{donations}</strong>
            <span>Donaciones</span>
          </div>
        </div>
      </section>

      <div className="perfil-content">

        {/* PANEL — DATOS PERSONALES */}
        <section className="profile-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Información personal</span>
              <h2>Datos de tu cuenta</h2>
            </div>
            <span className="profile-status">Cuenta activa</span>
          </div>

          <form onSubmit={saveProfile} className="perfil-form">
            {/* Avatar */}
            <div className="avatar-editor">
              <div className="profile-avatar">
                {avatarPreview || form.avatar_url
                  ? <img src={avatarPreview || form.avatar_url} alt="Vista previa" />
                  : <span>{form.nombre?.[0] || '?'}</span>}
              </div>
              <ImageUpload
                label="Foto de perfil"
                light
                maxSizeMB={3}
                onChange={handleAvatarChange}
              />
              {form.avatar_url && (
                <button type="button" className="danger-link" onClick={deleteAvatar} disabled={saving}>
                  Eliminar foto
                </button>
              )}
            </div>

            {/* Campos de datos */}
            <div className="profile-fields">
              <FormField
                label="Nombre"
                required
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
              <FormField
                label="Apellido"
                required
                value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })}
              />
              <FormField
                label="Correo electrónico"
                type="email"
                value={user.email || ''}
                readOnly
                className="field-full"
              />
              <div className="profile-actions">
                <button className="button primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}

        {/* PANEL — MIS PUBLICACIONES */}
        <section className="profile-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Tu actividad</span>
              <h2>Mis publicaciones</h2>
            </div>
            <Link className="edit-btn" to="/donar">Nueva donación</Link>
          </div>

          {publicaciones.length === 0 ? (
            <div className="empty-state">
              Aún no tienes publicaciones. Comparte una prenda para darle una nueva historia.
            </div>
          ) : (
            <div className="publicaciones-list">
              {publicaciones.map(pub => (
                <article key={pub.id} className="publicacion-item">
                  <div className="item-image">
                    {pub.imagen_url
                      ? <img src={pub.imagen_url} alt={pub.titulo} />
                      : <span>Sin foto</span>}
                  </div>
                  <div className="item-info">
                    <div className="publication-kicker">
                      <span className={`kicker-badge ${pub.tipo === 'donacion' ? 'kicker-badge--donation' : 'kicker-badge--sale'}`}>
                        {pub.tipo === 'donacion' ? 'Donación' : 'Venta'}
                      </span>
                      <span className={`kicker-badge kicker-badge--state kicker-badge--${pub.estado}`}>
                        {pub.estado}
                      </span>
                    </div>
                    <h3>{pub.titulo}</h3>
                    {/* Precio y talla con contraste garantizado */}
                    <p className="item-meta">
                      <span className="item-size">Talla {pub.talla || 'por confirmar'}</span>
                      <span className="item-price">
                        {pub.tipo === 'donacion'
                          ? <span className="price-free">Gratis</span>
                          : `$${Number(pub.precio || 0).toLocaleString('es-CO')}`}
                      </span>
                    </p>
                    <p className="item-condition">{pub.condicion || 'Estado no indicado'}</p>
                    <div className="item-actions">
                      <Link className="edit-btn" to={`/producto/${pub.id}`}>Ver / Editar</Link>
                      <button
                        className="edit-btn"
                        onClick={() => changeStatus(pub, pub.estado === 'activo' ? 'pausado' : 'activo')}
                      >
                        {pub.estado === 'activo' ? 'Pausar' : 'Activar'}
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(pub)}>Eliminar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
