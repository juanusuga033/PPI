import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import '../styles/Donaciones.css'

export default function Donaciones() {
  const [donaciones, setDonaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    fetchDonaciones()
  }, [filtro])

  async function fetchDonaciones() {
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
  }

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
          donaciones.map((donacion) => (
            <Link key={donacion.id} to={`/donacion/${donacion.id}`} className="donacion-card">
              <div className="donacion-imagen">
                {donacion.imagen_url && <img src={donacion.imagen_url} alt={donacion.titulo} />}
              </div>
              <div className="donacion-info">Donación</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}