import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { getCatalogImage } from '../lib/catalogImages'
import '../styles/Donaciones.css'

export default function Donaciones() {
  const [donaciones, setDonaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  const fetchDonaciones = useCallback(async () => {
    try {
      let query = supabase
        .from('publicaciones')
        .select('*')
        .eq('tipo', 'donacion')
      
      if (filtro) {
        query = query.or(`titulo.ilike.%${filtro}%,descripcion.ilike.%${filtro}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      setDonaciones(data || [])
    } catch (err) {
      console.error('Error fetching donaciones:', err)
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => {
    // Load remote donations when the filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDonaciones()
  }, [fetchDonaciones])

  return (
    <div className="donaciones-page">
      <div className="search-box">
        <input
          type="text"
          placeholder="BUSCAR..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>
      
      <div className="donaciones-grid">
        {loading ? (
          <p className="loading">Cargando...</p>
        ) : donaciones.length === 0 ? (
          <p className="empty">No hay donaciones disponibles</p>
        ) : (
          donaciones.map((donacion, index) => (
            <Link key={donacion.id} to={`/donacion/${donacion.id}`} className="donacion-card">
              <div className="donacion-imagen">
                <img src={donacion.imagen_url || getCatalogImage(index)} alt={donacion.titulo} />
              </div>
              <div className="donacion-info">{donacion.titulo || 'Donación'}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}