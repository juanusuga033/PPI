import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

// Carga y filtra las publicaciones de venta activas desde Supabase.
export default function Compra() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')
  const [category, setCategory] = useState('')
  const [order, setOrder] = useState('recent')
  const [params] = useSearchParams()

  // Consulta las ventas y aplica los filtros de búsqueda seleccionados.
  const load = useCallback(async () => {
    setLoading(true); setError('')
    let query = supabase.from('publicaciones').select('*').eq('tipo', 'venta').eq('estado', 'activo')
    const selectedCategory = category || params.get('categoria') || ''
    if (search.trim()) query = query.or(`titulo.ilike.%${search.trim()}%,descripcion.ilike.%${search.trim()}%`)
    if (size) query = query.eq('talla', size)
    if (condition) query = query.eq('condicion', condition)
    if (selectedCategory) query = query.eq('categoria', selectedCategory)
    query = query.order(order === 'price-low' || order === 'price-high' ? 'precio' : 'created_at', { ascending: order === 'price-low' })
    const { data, error: queryError } = await query
    if (queryError) setError(queryError.message); else setItems(data || [])
    setLoading(false)
  }, [search, size, condition, category, order, params])

  // Refresca el catálogo al montar la página o modificar un filtro.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load() }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  return <div className="catalog-page"><header className="catalog-hero"><div><span className="eyebrow">Marketplace escolar</span><h1>Compra con propósito</h1></div><p>Encuentra uniformes en excelente estado, cerca de tu comunidad y a precios justos.</p></header><div className="filters"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar camisa, sudadera, colegio..." /><select value={size} onChange={event => setSize(event.target.value)}><option value="">Todas las tallas</option>{['XS', 'S', 'M', 'L', 'XL', '6', '8', '10', '12', '14'].map(item => <option key={item}>{item}</option>)}</select><select value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas las categorías</option>{['Uniformes', 'Camisas', 'Pantalones', 'Sudaderas', 'Zapatos', 'Accesorios'].map(item => <option key={item}>{item}</option>)}</select><select value={condition} onChange={event => setCondition(event.target.value)}><option value="">Todas las condiciones</option><option>Como nuevo</option><option>Buen estado</option><option>Uso visible</option></select><select value={order} onChange={event => setOrder(event.target.value)}><option value="recent">Más recientes</option><option value="price-low">Menor precio</option><option value="price-high">Mayor precio</option></select></div>{loading ? <div className="page-state">Cargando publicaciones...</div> : error ? <div className="form-error">{error}</div> : items.length ? <div className="product-grid">{items.map((item, index) => <ProductCard product={item} index={index} key={item.id} />)}</div> : <div className="empty-state">No encontramos publicaciones que coincidan con tu búsqueda.</div>}</div>
}
