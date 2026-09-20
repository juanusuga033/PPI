import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import '../styles/Admin.css'

export default function Admin() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [publicaciones, setPublicaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactSaving, setContactSaving] = useState(false)
  const [contactForm, setContactForm] = useState({ title: '', subtitle: '', phone: '', email: '', website: '', address: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadAdminData = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: userData, error: userError }, { data: publicationData, error: publicationError }, { data: contactData, error: contactError }] = await Promise.all([
      supabase.from('profiles').select('id,nombre,apellido,email,role,status,created_at').order('created_at', { ascending: false }),
      supabase.from('publicaciones').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_settings').select('*').eq('id', 1).maybeSingle(),
    ])
    if (userError || publicationError || contactError) setError('No fue posible cargar el centro de administración. Verifica que las migraciones de roles y contacto estén aplicadas.')
    else {
      setUsers(userData || [])
      setPublicaciones(publicationData || [])
      setContactForm(contactData || { title: '', subtitle: '', phone: '', email: '', website: '', address: '' })
    }
    setLoading(false)
  }, [])

  async function saveContactSettings(event) {
    event.preventDefault()
    setContactSaving(true)
    setError('')
    setMessage('')
    const { data, error: updateError } = await supabase.from('contact_settings').update({ ...contactForm }).eq('id', 1).select().single()
    if (updateError) setError(updateError.message)
    else { setContactForm(data); setMessage('La información de Contacto fue actualizada.') }
    setContactSaving(false)
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (profile?.role === 'admin') loadAdminData()
    else setLoading(false)
  }, [profile, loadAdminData])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function changeRole(user, role) {
    if (user.id === profile.id && role === 'user') return setError('Conserva al menos una cuenta administradora activa para no perder el acceso al panel.')
    setError('')
    setMessage('')
    const { error: updateError } = await supabase.from('profiles').update({ role }).eq('id', user.id)
    if (updateError) return setError(updateError.message)
    setUsers(current => current.map(item => item.id === user.id ? { ...item, role } : item))
    setMessage(`${user.email} ahora tiene rol ${role === 'admin' ? 'administrador' : 'usuario'}.`)
  }

  async function changeUserStatus(user) {
    if (user.id === profile.id) return setError('No puedes dar de baja la cuenta administradora con la que estás trabajando.')
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    if (!confirm(`${nextStatus === 'inactive' ? 'Dar de baja' : 'Reactivar'} a ${user.email}?`)) return
    setError('')
    setMessage('')
    const { error: updateError } = await supabase.from('profiles').update({ status: nextStatus }).eq('id', user.id)
    if (updateError) return setError(updateError.message)
    if (nextStatus === 'inactive') {
      const { error: publicationError } = await supabase.from('publicaciones').update({ estado: 'pausado' }).eq('usuario_id', user.id)
      if (publicationError) return setError(publicationError.message)
    }
    setUsers(current => current.map(item => item.id === user.id ? { ...item, status: nextStatus } : item))
    setPublicaciones(current => nextStatus === 'inactive' ? current.map(item => item.usuario_id === user.id ? { ...item, estado: 'pausado' } : item) : current)
    setMessage(nextStatus === 'inactive' ? 'Usuario dado de baja y publicaciones pausadas.' : 'Usuario reactivado.')
  }

  async function changePublicationStatus(publication) {
    const estado = publication.estado === 'activo' ? 'pausado' : 'activo'
    const { data, error: updateError } = await supabase.from('publicaciones').update({ estado }).eq('id', publication.id).select().single()
    if (updateError) return setError(updateError.message)
    setPublicaciones(current => current.map(item => item.id === publication.id ? data : item))
  }

  async function deletePublication(publication) {
    if (!confirm(`Eliminar la publicación “${publication.titulo}”?`)) return
    const { error: deleteError } = await supabase.from('publicaciones').delete().eq('id', publication.id)
    if (deleteError) return setError(deleteError.message)
    setPublicaciones(current => current.filter(item => item.id !== publication.id))
    setMessage('Publicación eliminada.')
  }

  if (profile?.role !== 'admin') {
    return <div className="admin-page"><div className="admin-empty"><h1>Este espacio es privado</h1><p>El centro de administración está reservado para las personas responsables de la comunidad.</p><Link className="button primary" to="/">Volver al inicio</Link></div></div>
  }

  return <div className="admin-page">
    <header className="admin-hero">
      <div><span className="eyebrow">Centro de control</span><h1>Administración</h1><p>Cuida la comunidad, sus cuentas y las prendas que comparten.</p></div>
      <Link className="button secondary" to="/perfil">Volver a mi perfil</Link>
    </header>
    {message && <div className="form-success">{message}</div>}
    {error && <div className="form-error">{error}</div>}
    {loading ? <div className="page-state">Preparando el centro de control...</div> : <>
      <section className="admin-panel admin-contact-panel"><div className="section-heading"><div><span className="eyebrow">Contenido público</span><h2>Sección Contacto</h2></div><span className="admin-pill admin-pill--admin">Solo admins</span></div><p className="admin-panel-note">Actualiza los datos que aparecen en la página Contacto. Los cambios se reflejan para toda la comunidad.</p><form className="admin-contact-form" onSubmit={saveContactSettings}><label>Título<input value={contactForm.title} onChange={event => setContactForm({ ...contactForm, title: event.target.value })} required /></label><label>Subtítulo<input value={contactForm.subtitle} onChange={event => setContactForm({ ...contactForm, subtitle: event.target.value })} required /></label><label>Teléfono<input value={contactForm.phone} onChange={event => setContactForm({ ...contactForm, phone: event.target.value })} required /></label><label>Correo<input type="email" value={contactForm.email} onChange={event => setContactForm({ ...contactForm, email: event.target.value })} required /></label><label>Sitio web<input value={contactForm.website} onChange={event => setContactForm({ ...contactForm, website: event.target.value })} required /></label><label>Ubicación<input value={contactForm.address} onChange={event => setContactForm({ ...contactForm, address: event.target.value })} required /></label><button className="button primary" disabled={contactSaving}>{contactSaving ? 'Guardando...' : 'Guardar Contacto'}</button></form></section>
      <div className="admin-summary"><div><span>Usuarios</span><strong>{users.length}</strong></div><div><span>Administradores</span><strong>{users.filter(user => user.role === 'admin').length}</strong></div><div><span>Publicaciones activas</span><strong>{publicaciones.filter(item => item.estado === 'activo').length}</strong></div><div><span>En revisión</span><strong>{publicaciones.filter(item => item.estado !== 'activo').length}</strong></div></div>
      <div className="admin-grid">
      <section className="admin-panel"><div className="section-heading"><div><span className="eyebrow">Personas</span><h2>Usuarios</h2></div><span className="admin-count">{users.length}</span></div><div className="admin-list">{users.map(user => <article className="admin-row" key={user.id}><div><strong>{user.nombre || 'Sin nombre'} {user.apellido}</strong><span>{user.email}</span></div><div className="admin-row-meta"><span className={`admin-pill admin-pill--${user.role}`}>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</span><span className={`admin-pill admin-pill--${user.status}`}>{user.status === 'active' ? 'Activo' : 'De baja'}</span><button className="admin-action" onClick={() => changeRole(user, user.role === 'admin' ? 'user' : 'admin')}>{user.role === 'admin' ? 'Quitar admin' : 'Dar admin'}</button><button className="admin-action admin-action--danger" onClick={() => changeUserStatus(user)}>{user.status === 'active' ? 'Dar de baja' : 'Reactivar'}</button></div></article>)}</div></section>
      <section className="admin-panel"><div className="section-heading"><div><span className="eyebrow">Moderación</span><h2>Publicaciones</h2></div><span className="admin-count">{publicaciones.length}</span></div><div className="admin-list">{publicaciones.map(publication => <article className="admin-row admin-publication" key={publication.id}><div><strong>{publication.titulo || 'Sin título'}</strong><span>{publication.tipo === 'donacion' ? 'Donación' : 'Venta'} · Contacto: {publication.contacto || 'No indicado'}</span></div><div className="admin-row-meta"><span className={`admin-pill admin-pill--${publication.estado}`}>{publication.estado}</span><Link className="admin-action" to={`/producto/${publication.id}`}>Editar contacto</Link><button className="admin-action" onClick={() => changePublicationStatus(publication)}>{publication.estado === 'activo' ? 'Dar de baja' : 'Activar'}</button><button className="admin-action admin-action--danger" onClick={() => deletePublication(publication)}>Eliminar</button></div></article>)}</div></section>
      </div>
    </>}
  </div>
}
