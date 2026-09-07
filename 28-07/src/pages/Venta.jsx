import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { uploadPublicationImage } from '../lib/publicationStorage'
import '../styles/Venta.css'

export default function Venta() {
  const [user, setUser] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [precio, setPrecio] = useState('')
  const [talla, setTalla] = useState('')
  const [categoria, setCategoria] = useState('Uniformes')
  const [condicion, setCondicion] = useState('Buen estado')
  const [descripcion, setDescripcion] = useState('')
  const [contacto, setContacto] = useState('')
  const [imagen, setImagen] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDonacion, setIsDonacion] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const checkUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      navigate('/login')
      return
    }
    setUser(data.session.user)
  }, [navigate])

  useEffect(() => {
    // Resolve the current session before allowing a publication.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkUser()
  }, [checkUser])

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('La imagen debe ser JPG, PNG o WebP.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.')
      e.target.value = ''
      return
    }

    setError('')
    setImagen(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!titulo.trim() || (!isDonacion && !precio) || !talla.trim()) {
        throw new Error('Por favor completa todos los campos')
      }

      let imagenUrl = null
      if (imagen) {
        imagenUrl = (await uploadPublicationImage(user.id, imagen)).url
      }

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
            imagen_url: imagenUrl,
            tipo: isDonacion ? 'donacion' : 'venta',
            usuario_id: user.id,
            estado: 'activo',
            created_at: new Date().toISOString()
          }
        ])

      if (insertError) throw insertError

      alert('Publicación creada exitosamente')
      setTitulo('')
      setPrecio('')
      setTalla('')
      setDescripcion('')
      setContacto('')
      setImagen(null)
      setPreviewUrl(null)
      navigate(isDonacion ? '/donaciones' : '/compra')
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <p className="loading">Cargando...</p>

  return (
    <div className="venta-page">
      <div className="venta-container">
        <form onSubmit={handleSubmit} className="venta-form">
          <button type="button" className="donacion-btn" onClick={() => setIsDonacion(!isDonacion)}>
            {isDonacion ? 'Cambiar a venta' : 'Publicar como donación'}
          </button>
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
              onChange={handleImageChange}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="publicar-btn" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>

        <div className="venta-preview">
          <div className="preview-box">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" />
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
