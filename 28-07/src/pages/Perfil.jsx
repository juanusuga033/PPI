import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { removePublicationImage } from '../lib/publicationService'
import { useAuth } from '../lib/AuthContext'
import '../styles/Perfil.css'
import { removePublicationImage } from '../lib/publicationStorage'

export default function Perfil() {
  const { user, profile } = useAuth()
  const [publicaciones, setPublicaciones] = useState([])
  const [form, setForm] = useState({ nombre: '', apellido: '', avatar_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  async function saveProfile(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    const { error: updateError } = await supabase.from('profiles').upsert({ id: user.id, nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: user.email, avatar_url: form.avatar_url.trim() || null }, { onConflict: 'id' })
    setSaving(false)
    if (updateError) return setError(updateError.message)
    setMessage('Perfil actualizado correctamente.')
  }

  async function changeStatus(publication, estado) {
    setError('')
    const { data, error: updateError } = await supabase.from('publicaciones').update({ estado }).eq('id', publication.id).eq('usuario_id', user.id).select().single()
    if (updateError) return setError(updateError.message)
    setPublicaciones(current => current.map(item => item.id === publication.id ? data : item))
  }

  async function handleDelete(publication) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return
    setError('')
    try {
      const { error: deleteError } = await supabase.from('publicaciones').delete().eq('id', publication.id).eq('usuario_id', user.id)
      if (deleteError) throw deleteError
      await removePublicationImage(publication.imagen_url)
      setPublicaciones(current => current.filter(item => item.id !== publication.id))
    } catch (deleteError) { setError(deleteError.message) }
  }

  if (!user || loading) return <p className="loading">Cargando...</p>
  const active = publicaciones.filter(item => item.estado === 'activo').length
  const donations = publicaciones.filter(item => item.tipo === 'donacion').length

  return <div className="perfil-page">
    <div className="perfil-header"><h1>Mi Perfil</h1><p className="email">{user.email}</p><p>{publicaciones.length} publicaciones · {active} activas · {donations} donaciones</p></div>
    <div className="perfil-content">
      <h2>Mis datos</h2>
      <form onSubmit={saveProfile} className="perfil-form"><label>Nombre<input value={form.nombre} onChange={event => setForm({ ...form, nombre: event.target.value })} required /></label><label>Apellido<input value={form.apellido} onChange={event => setForm({ ...form, apellido: event.target.value })} required /></label><label>Avatar / foto<input type="url" value={form.avatar_url} onChange={event => setForm({ ...form, avatar_url: event.target.value })} placeholder="URL de imagen" /></label><button className="button primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar datos'}</button></form>
      {message && <div className="form-success">{message}</div>}{error && <div className="form-error">{error}</div>}
      <h2>Mis Publicaciones</h2>
      {publicaciones.length === 0 ? <p className="empty">No tienes publicaciones aún</p> : <div className="publicaciones-list">{publicaciones.map(pub => <div key={pub.id} className="publicacion-item"><div className="item-image">{pub.imagen_url && <img src={pub.imagen_url} alt={pub.titulo} />}</div><div className="item-info"><h3>{pub.titulo}</h3><p>Precio: ${pub.precio}</p><p>Talla: {pub.talla}</p><p>Tipo: {pub.tipo === 'donacion' ? 'Donación' : 'Venta'}</p><p>Estado: {pub.estado}</p><div className="item-actions"><Link className="edit-btn" to={`/producto/${pub.id}`}>Editar</Link><button className="edit-btn" onClick={() => changeStatus(pub, pub.estado === 'activo' ? 'pausado' : 'activo')}>{pub.estado === 'activo' ? 'Pausar' : 'Activar'}</button><button className="delete-btn" onClick={() => handleDelete(pub)}>Eliminar</button></div></div></div>)}</div>}
    </div>
  </div>
}
