import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { uploadPublicationImage, removePublicationImage, validateImage } from '../lib/publicationService'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/ui/FormField'
import CustomSelect from '../components/ui/CustomSelect'
import ImageUpload from '../components/ui/ImageUpload'
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
  const [cantidad, setCantidad] = useState(1)
  const [isDonacion, setIsDonacion] = useState(donationOnly)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  // Valida archivos provenientes del componente ImageUpload.
  function handleImageChange(files) {
    const valid = files.filter(Boolean)
    try {
      valid.forEach(file => validateImage(file))
      if (valid.length > 5) throw new Error('Puedes agregar hasta 5 fotografías.')
      setError('')
      setImagenes(valid)
    } catch (imageError) {
      setError(imageError.message)
      setImagenes([])
    }
  }

  // Sube las imágenes y crea la publicación asociada al usuario autenticado.
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) throw new Error('Debes iniciar sesión para publicar.')
      if (!titulo.trim()) throw new Error('El título es obligatorio.')
      if (!isDonacion && (!precio || !Number.isFinite(Number(precio)))) {
        throw new Error('El precio debe ser un número válido.')
      }
      if (!talla.trim()) throw new Error('La talla es obligatoria.')
      if (isDonacion && !imagenes.length) throw new Error('Agrega al menos una fotografía de la prenda donada.')
      if (isDonacion && !contacto.trim()) throw new Error('Agrega un medio de contacto para coordinar la entrega.')
      if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) {
        throw new Error('La cantidad debe ser mayor que cero.')
      }

      const uploads = await Promise.all(imagenes.map(file => uploadPublicationImage(file, user.id)))
      const imageUrls = uploads.map(upload => upload.url)

      const { error: insertError } = await supabase
        .from('publicaciones')
        .insert([{
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
          created_at: new Date().toISOString(),
        }])

      if (insertError) {
        await Promise.all(imageUrls.map(removePublicationImage))
        throw insertError
      }

      setSuccess(isDonacion ? '¡Donación publicada correctamente!' : '¡Publicación creada correctamente!')
      setTitulo('')
      setPrecio('')
      setTalla('')
      setDescripcion('')
      setContacto('')
      setImagenes([])
      setCantidad(1)
      setTimeout(() => navigate(isDonacion ? '/donaciones' : '/compra'), 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) return <p className="loading">Cargando...</p>

  return (
    <div className="venta-page">
      <div className="venta-inner">

        {/* Encabezado de la página */}
        <div className="venta-heading">
          <span className="eyebrow">{isDonacion ? 'Compartir una prenda' : 'Publicar para vender'}</span>
          <h1>{isDonacion ? 'Donar uniforme' : 'Vender uniforme'}</h1>
          <p>Completa la información para que otros miembros de la comunidad puedan encontrar tu prenda.</p>
          {!donationOnly && (
            <button
              type="button"
              className="toggle-type-btn"
              onClick={() => setIsDonacion(!isDonacion)}
            >
              {isDonacion ? '¿Prefieres venderlo? Cambiar a venta' : '¿Prefieres donarlo? Publicar como donación'}
            </button>
          )}
        </div>

        <div className="venta-layout">
          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className="venta-form" noValidate>

            {/* Título */}
            <FormField
              label="Título del uniforme"
              dark
              required
              placeholder="Ej: Camisa escolar Colegio San José, talla M"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />

            {/* Precio — solo para ventas */}
            {isDonacion ? (
              <div className="gratis-badge">
                <span className="gratis-label">Precio</span>
                <span className="gratis-chip">🎁 Gratis — Donación</span>
              </div>
            ) : (
              <FormField
                label="Precio"
                dark
                required
                type="number"
                min="0"
                placeholder="Ej: 45000"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
              />
            )}

            {/* Talla y cantidad en grid */}
            <div className="venta-row">
              <FormField
                label="Talla"
                dark
                required
                placeholder="Ej: M, 12, 38..."
                value={talla}
                onChange={e => setTalla(e.target.value)}
              />
              <FormField
                label="Cantidad disponible"
                dark
                required
                type="number"
                min="1"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
              />
            </div>

            {/* Categoría y condición en grid */}
            <div className="venta-row">
              <CustomSelect
                label="Categoría"
                dark
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                <option>Uniformes</option>
                <option>Camisas</option>
                <option>Pantalones</option>
                <option>Sudaderas</option>
                <option>Zapatos</option>
                <option>Accesorios</option>
              </CustomSelect>

              <CustomSelect
                label="Condición"
                dark
                value={condicion}
                onChange={e => setCondicion(e.target.value)}
              >
                <option>Como nuevo</option>
                <option>Buen estado</option>
                <option>Uso visible</option>
              </CustomSelect>
            </div>

            {/* Descripción */}
            <FormField
              label="Descripción"
              dark
              multiline
              placeholder="Cuéntanos más sobre la prenda: material, detalles adicionales, por qué la vendes o donas..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />

            {/* Contacto */}
            <FormField
              label="Contacto para coordinación"
              dark
              required={isDonacion}
              placeholder="WhatsApp, correo, o cómo prefieres que te escriban"
              value={contacto}
              onChange={e => setContacto(e.target.value)}
            />

            {/* Imágenes */}
            <ImageUpload
              label={`Fotos de la prenda${isDonacion ? ' *' : ''}`}
              multiple
              maxFiles={5}
              maxSizeMB={5}
              onChange={handleImageChange}
            />

            {/* Mensajes de estado */}
            {error && <div className="venta-error" role="alert">{error}</div>}
            {success && <div className="venta-success" role="status">{success}</div>}

            {/* Botón publicar */}
            <button
              type="submit"
              className={`venta-submit${isDonacion ? ' venta-submit--donation' : ''}`}
              disabled={loading}
            >
              {loading ? 'Publicando...' : isDonacion ? 'Publicar donación' : 'Publicar prenda'}
            </button>
          </form>

          {/* Panel lateral de ayuda */}
          <aside className="venta-sidebar">
            <div className="venta-tip-card">
              <h3>Consejos para una buena publicación</h3>
              <ul>
                <li>Usa fotos con buena iluminación</li>
                <li>Indica la talla exacta y la condición real</li>
                <li>Añade detalles como el colegio al que pertenece el uniforme</li>
                <li>Responde rápido para cerrar tratos más fácilmente</li>
              </ul>
            </div>
            <div className="venta-tip-card">
              <h3>Formatos de imagen</h3>
              <p>JPG, PNG o WebP · máximo 5 MB por foto · hasta 5 fotos por publicación</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
