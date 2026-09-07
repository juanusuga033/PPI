import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import '../styles/Compra.css'

export default function Compra() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    fetchProductos()
  }, [filtro])

  async function fetchProductos() {
    try {
      let query = supabase
        .from('publicaciones')
        .select('*')
        .eq('tipo', 'venta')
      
      if (filtro) {
        query = query.or(`titulo.ilike.%${filtro}%,descripcion.ilike.%${filtro}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      setProductos(data || [])
    } catch (err) {
      console.error('Error fetching productos:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="compra-page">
      <div className="search-box">
        <input
          type="text"
          placeholder="BUSCAR..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>
      
      <div className="productos-grid">
        {loading ? (
          <p className="loading">Cargando...</p>
        ) : productos.length === 0 ? (
          <p className="empty">No hay productos disponibles</p>
        ) : (
          productos.map((producto) => (
            <Link key={producto.id} to={`/producto/${producto.id}`} className="producto-card">
              <div className="producto-imagen">
                {producto.imagen_url && <img src={producto.imagen_url} alt={producto.titulo} />}
              </div>
              <div className="producto-precio">$$$</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}