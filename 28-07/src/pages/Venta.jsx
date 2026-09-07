import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import '../styles/Venta.css'

export default function Venta() {
  const [user, setUser] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [precio, setPrecio] = useState('')
  const [talla, setTalla] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [contacto, setContacto] = useState('')
  const [imagen, setImagen] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDonacion, setIsDonacion] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      navigate('/login')
      return
    }
    setUser(data.session.user)
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setImagen(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  async function handleImageUpload(file) {
    if (!file) return null
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`
      const { error } = await supabase.storage
        .from('uniformes')
        .upload(`publicaciones/${fileName}`, file)
      if (error) throw error
      const { data } = supabase.storage
        .from('uniformes')
        .getPublicUrl(`publicaciones/${fileName}`)
      return data.publicUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      throw err
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!titulo.trim() || !precio || !talla.trim()) {
        throw new Error('Por favor completa todos los campos')
      }

      let imagenUrl = null
      if (imagen) {
        imagenUrl = await handleImageUpload(imagen)
      }

      const { error: insertError } = await supabase
        .from('publicaciones')
        .insert([
          {
            titulo: titulo.trim(),
            precio: parseFloat(precio),
            talla: talla.trim(),
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
          <div className="form-group">
            <input
              type="number"
              placeholder="Pon tu precio: ______"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
            {isDonacion && (
              <button type="button" className="donacion-btn" onClick={() => setIsDonacion(false)}>Donación</button>
            )}
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