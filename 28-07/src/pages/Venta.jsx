import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { uploadPublicationImage, removePublicationImage, validateImage } from '../lib/publicationService'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/Venta.css'

export default function Venta({ donationOnly = false }) {
  const { user, loading: authLoading } = useAuth()
  const [titulo, setTitulo] = useState('')
  const [precio, setPrecio] = useState('')
  const [talla, setTalla] = useState('')
  const [categoria, setCategoria] = useState('Uniformes')
  const [condicion, setCondicion] = useState('Buen estado')
  const [descripcion, setDescripcion] = useState('')
  const [contacto, setContacto] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [isDonacion, setIsDonacion] = useState(donationOnly)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  // Valida las fotografías seleccionadas y prepara sus vistas previas locales.
  function handleImageChange(e) {
    const files = Array.from(e.target.files || [])
    try {
      files.forEach(file => validateImage(file))
      if (files.length > 5) throw new Error('Puedes agregar hasta 5 fotografías.')
      setError('')
      setImagenes(files)
      setPreviewUrls(files.map(file => URL.createObjectURL(file)))
    } catch (imageError) {
      setError(imageError.message)
      e.target.value = ''
    }
  }

  // Sube las imágenes y crea la publicación asociada al usuario autenticado.
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) throw new Error('Debes iniciar sesión para publicar.')
      if (!titulo.trim() || (!isDonacion && (!precio || !Number.isFinite(Number(precio)))) || !talla.trim()) {
        throw new Error('Por favor completa todos los campos')
      }
      if (isDonacion && !imagenes.length) throw new Error('Agrega al menos una fotografía de la prenda donada.')
      if (isDonacion && !contacto.trim()) throw new Error('Agrega un medio de contacto para coordinar la entrega.')
      if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) throw new Error('La cantidad debe ser mayor que cero.')

      const uploads = await Promise.all(imagenes.map(file => uploadPublicationImage(file, user.id)))
      const imageUrls = uploads.map(upload => upload.url)

      const { error: insertError } = await supabase
        .from('publicaciones')
        .insert([
          {
            titulo: titulo.trim(),
            precio: isDonacion ? 0 : parseFloat(precio),
            talla: talla.trim(),
            categoria,
            condicion,
            descripcion: descripcion.trim(),
            contacto: contacto.trim(),
            imagen_url: imageUrls[0] || null,
            imagenes: imageUrls,
            cantidad: Number(cantidad),
            tipo: isDonacion ? 'donacion' : 'venta',
            usuario_id: user.id,
            estado: 'activo',
            created_at: new Date().toISOString()
          }
        ])

      if (insertError) {
        await Promise.all(imageUrls.map(removePublicationImage))
        throw insertError
      }

      setSuccess(isDonacion ? 'Donación publicada correctamente.' : 'Publicación creada correctamente.')
      setTitulo('')
      setPrecio('')
      setTalla('')
      setDescripcion('')
      setContacto('')
      setImagenes([])
      setPreviewUrls([])
      setCantidad(1)
      setTimeout(() => navigate(isDonacion ? '/donaciones' : '/compra'), 700)
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) return <p className="loading">Cargando...</p>

  return (
    <div className="venta-page">
      <div className="venta-container">
        <form onSubmit={handleSubmit} className="venta-form">
          {!donationOnly && <button type="button" className="donacion-btn" onClick={() => setIsDonacion(!isDonacion)}>
            {isDonacion ? 'Cambiar a venta' : 'Publicar como donación'}
          </button>}
          {!isDonacion && <div className="form-group">
            <input
              type="number"
              placeholder="Pon tu precio: ______"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>}
          
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad disponible</label>
            <input id="cantidad" type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Talla: ___"
              value={talla}
              onChange={(e) => setTalla(e.target.value)}
              required
            />
          </div>
          <div className="form-group"><select value={categoria} onChange={(e) => setCategoria(e.target.value)}><option>Uniformes</option><option>Camisas</option><option>Pantalones</option><option>Sudaderas</option><option>Zapatos</option><option>Accesorios</option></select></div>
          <div className="form-group"><select value={condicion} onChange={(e) => setCondicion(e.target.value)}><option>Como nuevo</option><option>Buen estado</option><option>Uso visible</option></select></div>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Descripción: __________"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Contacto: __________________"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Título del uniforme"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <button type="submit" className="publicar-btn" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>

        <div className="venta-preview">
          <div className="preview-box">
            {previewUrls.length ? (
              <div className="preview-gallery">{previewUrls.map((url, index) => <img key={url} src={url} alt={`Vista previa ${index + 1}`} />)}</div>
            ) : (
              <div className="preview-placeholder">
                <div className="plus-icon">+</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
