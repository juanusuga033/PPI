import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import '../styles/Producto.css'

export default function Producto() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducto()
  }, [id])

  async function fetchProducto() {
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
  }

  if (loading) return <p className="loading">Cargando...</p>
  if (!producto) return <p className="error">Producto no encontrado</p>

  return (
    <div className="producto-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>
      
      <div className="producto-detail">
        <div className="detail-image">
          {producto.imagen_url && <img src={producto.imagen_url} alt={producto.titulo} />}
        </div>
        
        <div className="detail-info">
          <h1>{producto.titulo}</h1>
          <p className="precio">Precio: ${producto.precio}</p>
          <p className="talla">Talla: {producto.talla}</p>
          <p className="descripcion">{producto.descripcion}</p>
          <p className="contacto">Contacto: {producto.contacto}</p>
          <button className="contactar-btn">Contactar</button>
        </div>
      </div>
    </div>
  )
}