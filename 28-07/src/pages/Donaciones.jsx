import { useCallback, useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { supabase } from '../lib/supabaseClient'
import '../styles/Donaciones.css'

// Consulta las donaciones activas aplicando los filtros elegidos por la comunidad.
export default function Donaciones() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')

  // Carga desde Supabase las publicaciones cuyo tipo es donacion.
  const loadDonations = useCallback(async () => {
    setLoading(true)
    setError('')
    let query = supabase.from('publicaciones').select('*').eq('tipo', 'donacion').eq('estado', 'activo').order('created_at', { ascending: false })
    if (search.trim()) query = query.or(`titulo.ilike.%${search.trim()}%,descripcion.ilike.%${search.trim()}%`)
    if (size) query = query.eq('talla', size)
    if (condition) query = query.eq('condicion', condition)
    const { data, error: queryError } = await query
    if (queryError) setError('No fue posible cargar las donaciones. Intenta nuevamente.')
    else setItems(data || [])
    setLoading(false)
  }, [search, size, condition])

  // Actualiza el listado cuando cambia un filtro o se monta la pagina.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { loadDonations() }, [loadDonations])
  /* eslint-enable react-hooks/set-state-in-effect */

  return <div className="catalog-page donaciones-page">
    <header className="catalog-hero"><div><span className="eyebrow">Compartir transforma</span><h1>Donaciones</h1></div><p>Prendas listas para empezar una nueva etapa, sin costo para quien las necesite.</p></header>
    <div className="donation-intro"><strong>Encuentra una prenda para tu proxima etapa.</strong><span>{items.length} disponibles en la comunidad</span></div>
    <div className="filters"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar una donacion..." aria-label="Buscar donaciones" /><select value={size} onChange={event => setSize(event.target.value)} aria-label="Filtrar por talla"><option value="">Todas las tallas</option>{['XS', 'S', 'M', 'L', 'XL', '6', '8', '10', '12', '14'].map(item => <option key={item}>{item}</option>)}</select><select value={condition} onChange={event => setCondition(event.target.value)} aria-label="Filtrar por estado"><option value="">Todas las condiciones</option><option>Como nuevo</option><option>Buen estado</option><option>Uso visible</option></select></div>
    {loading ? <div className="page-state">Cargando donaciones...</div> : error ? <div className="form-error">{error}</div> : items.length ? <div className="product-grid">{items.map((item, index) => <ProductCard product={item} index={index} key={item.id} />)}</div> : <div className="empty-state"><strong>No hay donaciones disponibles por ahora.</strong><span>Prueba con otros filtros o publica una prenda desde tu perfil.</span></div>}
  </div>
}
