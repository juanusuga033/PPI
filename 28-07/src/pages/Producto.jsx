import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getCatalogImage } from '../lib/catalogImages'
import { useAuth } from '../lib/AuthContext'
import '../styles/Producto.css'

export default function Producto() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchProducto = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('publicaciones')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setProducto(data)
    } catch (err) {
      console.error('Error fetching producto:', err)
      navigate('/compra')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  function handleContact() {
    if (!producto?.contacto) {
      alert('Esta publicación no tiene información de contacto.')
      return
    }

    const contact = producto.contacto.trim()
    window.location.href = contact.includes('@') ? `mailto:${contact}` : `tel:${contact}`
  }

  useEffect(() => {
    // Load the selected publication from Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducto()
  }, [fetchProducto])

  if (loading) return <p className="loading">Cargando...</p>
  if (!producto) return <p className="error">Producto no encontrado</p>
  const owner = user?.id === producto.usuario_id

  return (
    <div className="producto-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>
      
      <div className="producto-detail">
        <div className="detail-image">
          <img src={producto.imagen_url || getCatalogImage(0)} alt={producto.titulo} />
        </div>
        
        <div className="detail-info">
          <h1>{producto.titulo}</h1>
          <p className="precio">{producto.tipo === 'donacion' ? 'DONACIÓN · Gratis' : `$${Number(producto.precio || 0).toLocaleString('es-CO')}`}</p>
          <p className="talla"><b>Talla:</b> {producto.talla || 'Por confirmar'} · <b>Estado:</b> {producto.condicion || 'Buen estado'}</p>
          <p className="descripcion">{producto.descripcion || 'El vendedor aún no agregó una descripción.'}</p>
          <p className="contacto"><b>Publicado por la comunidad</b><br />{producto.created_at ? new Date(producto.created_at).toLocaleDateString('es-CO') : 'Fecha no disponible'}</p>
          {owner ? <button className="contactar-btn" onClick={() => navigate('/perfil')}>Gestionar publicación</button> : <button className="contactar-btn" onClick={handleContact}>Contactar vendedor</button>}
        </div>
      </div>
    </div>
  )
}
