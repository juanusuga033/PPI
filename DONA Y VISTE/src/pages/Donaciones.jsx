import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

// Carga las donaciones activas y mantiene sus filtros de búsqueda.
export default function Donaciones() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')

  // Consulta Supabase y actualiza el catálogo público de donaciones.
  const load = useCallback(async () => {
    setLoading(true); setError('')
    let query = supabase.from('publicaciones').select('*').eq('tipo', 'donacion').eq('estado', 'activo').order('created_at', { ascending: false })
    if (search.trim()) query = query.or(`titulo.ilike.%${search.trim()}%,descripcion.ilike.%${search.trim()}%`)
    if (size) query = query.eq('talla', size)
    if (condition) query = query.eq('condicion', condition)
    const { data, error: queryError } = await query
    if (queryError) setError(queryError.message); else setItems(data || [])
    setLoading(false)
  }, [search, size, condition])

  // Refresca las donaciones al montar la página y cuando cambia un filtro.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  return <div className="catalog-page"><header className="catalog-hero"><div><span className="eyebrow">Compartir transforma</span><h1>Donaciones</h1></div><p>Prendas listas para empezar una nueva etapa, sin costo para quien las necesite.</p></header><div className="filters"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar una donación..." /><select value={size} onChange={event => setSize(event.target.value)}><option value="">Todas las tallas</option>{['XS', 'S', 'M', 'L', 'XL', '6', '8', '10', '12', '14'].map(item => <option key={item}>{item}</option>)}</select><select value={condition} onChange={event => setCondition(event.target.value)}><option value="">Todas las condiciones</option><option>Como nuevo</option><option>Buen estado</option><option>Uso visible</option></select></div>{loading ? <div className="page-state">Cargando donaciones...</div> : error ? <div className="form-error">{error}</div> : items.length ? <div className="product-grid">{items.map((item, index) => <ProductCard product={item} index={index} key={item.id} />)}</div> : <div className="empty-state">No encontramos donaciones disponibles por ahora.</div>}</div>
}
