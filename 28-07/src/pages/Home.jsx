import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { getCatalogImage } from '../lib/catalogImages'
import '../styles/Home.css'

export default function Home() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDonations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('publicaciones')
        .select('*')
        .eq('tipo', 'donacion')
        .limit(4)
      if (error) throw error
      setDonations(data || [])
    } catch (err) {
      console.error('Error fetching donations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load the public donation preview from Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDonations()
  }, [fetchDonations])

  return (
    <div className="home-page">
      <section className="donations-hero">
        <div className="hero-content">
          <h1>GRACIAS POR TU<br />DONACIÓN</h1>
          <div className="upload-box">
            <div className="upload-icon">+</div>
            <Link to="/venta" className="upload-btn">¡Publica tu donación aquí!</Link>
          </div>
        </div>
        <div className="hero-images">
          {loading ? (
            <p className="loading">Cargando donaciones...</p>
          ) : (
            donations.map((donation, idx) => (
              <div key={donation.id} className="heart-image" style={{ order: idx }}>
                <img src={donation.imagen_url || getCatalogImage(idx)} alt={donation.titulo || 'donación'} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}