import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { getCatalogImage } from '../lib/catalogImages'
import '../styles/Compra.css'

export default function Compra() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  const fetchProductos = useCallback(async () => {
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
  }, [filtro])

  useEffect(() => {
    // Load remote publications when the filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProductos()
  }, [fetchProductos])

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
          productos.map((producto, index) => (
            <Link key={producto.id} to={`/producto/${producto.id}`} className="producto-card">
              <div className="producto-imagen">
                <img src={producto.imagen_url || getCatalogImage(index)} alt={producto.titulo} />
              </div>
              <div className="producto-precio">
                {producto.titulo || 'Uniforme disponible'}
                <span>{producto.precio ? `$${producto.precio}` : '$$$'}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}