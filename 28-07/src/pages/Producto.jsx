import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getCatalogImage } from '../lib/catalogImages'
import { removePublicationImage, uploadPublicationImage, validateImage } from '../lib/publicationService'
import { useAuth } from '../lib/AuthContext'
import '../styles/Producto.css'

export default function Producto() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [draft, setDraft] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  // Obtiene desde Supabase el detalle público de una publicación.
  const fetchProducto = useCallback(async () => {
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.from('publicaciones').select('*').eq('id', id).single()
    if (queryError) { setError(queryError.message); setLoading(false); return }
    setProducto(data); setDraft(data); setLoading(false)
  }, [id])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { fetchProducto() }, [fetchProducto])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Abre el medio de contacto que el propietario dejó disponible.
  function handleContact() {
    if (!producto?.contacto) return setError('Esta publicación no tiene información de contacto.')
    const contact = producto.contacto.trim()
    window.location.href = contact.includes('@') ? `mailto:${contact}` : `tel:${contact}`
  }

  // Guarda los cambios propios y reemplaza la imagen anterior de forma segura.
  async function savePublication(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      let imageUrl = producto.imagen_url
      let imageUrls = producto.imagenes?.length ? producto.imagenes : [producto.imagen_url].filter(Boolean)
      let uploadedUrl = null
      if (newImage) {
        validateImage(newImage)
        const uploaded = await uploadPublicationImage(newImage, user.id)
        imageUrl = uploaded.url; uploadedUrl = uploaded.url; imageUrls = [uploaded.url]
      }
      const { data, error: updateError } = await supabase.from('publicaciones').update({ titulo: draft.titulo.trim(), descripcion: draft.descripcion.trim(), precio: Number(draft.precio) || 0, talla: draft.talla.trim(), categoria: draft.categoria, condicion: draft.condicion, contacto: draft.contacto.trim(), imagen_url: imageUrl, imagenes: imageUrls }).eq('id', producto.id).eq('usuario_id', user.id).select().single()
      if (updateError) { if (uploadedUrl) await removePublicationImage(uploadedUrl); throw updateError }
      if (newImage) await Promise.all((producto.imagenes?.length ? producto.imagenes : [producto.imagen_url]).filter(Boolean).map(removePublicationImage))
      setProducto(data); setDraft(data); setNewImage(null); setEditing(false)
    } catch (saveError) { setError(saveError.message) } finally { setSaving(false) }
  }

  // Cambia el estado de la publicación únicamente si pertenece al usuario actual.
  async function changeStatus(estado) {
    setError('')
    const { data, error: updateError } = await supabase.from('publicaciones').update({ estado }).eq('id', producto.id).eq('usuario_id', user.id).select().single()
    if (updateError) return setError(updateError.message)
    setProducto(data); setDraft(data)
  }

  // Elimina la publicación propia y limpia sus imágenes de Storage.
  async function deletePublication() {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return
    const { error: deleteError } = await supabase.from('publicaciones').delete().eq('id', producto.id).eq('usuario_id', user.id)
    if (deleteError) return setError(deleteError.message)
    try {
      const imageUrls = producto.imagenes?.length ? producto.imagenes : [producto.imagen_url]
      await Promise.all(imageUrls.filter(Boolean).map(removePublicationImage))
    } catch (storageError) { setError(storageError.message) }
    navigate('/perfil')
  }

  if (loading) return <p className="loading">Cargando...</p>
  if (!producto) return <div className="producto-detail-page"><p className="error">No se pudo cargar la publicación: {error}</p></div>
  const owner = user?.id === producto.usuario_id
  // Actualiza un campo del formulario de edición sin perder los demás valores.
  const setField = (field, value) => setDraft({ ...draft, [field]: value })

  return <div className="producto-detail-page">
    <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>
    {error && <div className="form-error">{error}</div>}
    {editing ? <form onSubmit={savePublication} className="producto-detail"><div className="detail-image"><img src={producto.imagen_url || getCatalogImage(0)} alt={producto.titulo} /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setNewImage(event.target.files?.[0] || null)} /></div><div className="detail-info"><label>Título<input value={draft.titulo} onChange={event => setField('titulo', event.target.value)} required /></label><label>Precio<input type="number" min="0" value={draft.precio} onChange={event => setField('precio', event.target.value)} required /></label><label>Talla<input value={draft.talla} onChange={event => setField('talla', event.target.value)} required /></label><label>Categoría<input value={draft.categoria} onChange={event => setField('categoria', event.target.value)} required /></label><label>Condición<input value={draft.condicion} onChange={event => setField('condicion', event.target.value)} required /></label><label>Descripción<textarea value={draft.descripcion} onChange={event => setField('descripcion', event.target.value)} /></label><label>Contacto<input value={draft.contacto} onChange={event => setField('contacto', event.target.value)} /></label><button className="contactar-btn" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button><button type="button" className="back-btn" onClick={() => { setDraft(producto); setNewImage(null); setEditing(false) }}>Cancelar</button></div></form> : <div className="producto-detail"><div className="detail-image"><img src={producto.imagen_url || getCatalogImage(0)} alt={producto.titulo} /></div><div className="detail-info"><h1>{producto.titulo}</h1><p className="precio">{producto.tipo === 'donacion' ? 'DONACIÓN · Gratis' : `$${Number(producto.precio || 0).toLocaleString('es-CO')}`}</p><p className="talla"><b>Talla:</b> {producto.talla || 'Por confirmar'} · <b>Estado:</b> {producto.condicion || 'Buen estado'}</p><p className="descripcion">{producto.descripcion || 'El vendedor aún no agregó una descripción.'}</p><p className="contacto"><b>Publicado por la comunidad</b><br />{producto.created_at ? new Date(producto.created_at).toLocaleDateString('es-CO') : 'Fecha no disponible'}</p>{owner ? <div className="item-actions"><button className="contactar-btn" onClick={() => setEditing(true)}>Editar</button><button className="contactar-btn" onClick={() => changeStatus(producto.estado === 'activo' ? 'pausado' : 'activo')}>{producto.estado === 'activo' ? 'Pausar' : 'Activar'}</button><button className="delete-btn" onClick={deletePublication}>Eliminar</button></div> : <button className="contactar-btn" onClick={handleContact}>Contactar vendedor</button>}</div></div>}
  </div>
}
