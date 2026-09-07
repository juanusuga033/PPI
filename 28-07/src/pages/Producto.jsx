import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getCatalogImage } from '../lib/catalogImages'
import '../styles/Producto.css'

export default function Producto() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  return (
    <div className="producto-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>
      
      <div className="producto-detail">
        <div className="detail-image">
          <img src={producto.imagen_url || getCatalogImage(0)} alt={producto.titulo} />
        </div>
        
        <div className="detail-info">
          <h1>{producto.titulo}</h1>
          <p className="precio">Precio: ${producto.precio}</p>
          <p className="talla">Talla: {producto.talla}</p>
          <p className="descripcion">{producto.descripcion}</p>
          <p className="contacto">Contacto: {producto.contacto}</p>
          <button className="contactar-btn" onClick={handleContact}>Contactar</button>
        </div>
      </div>
    </div>
  )
}