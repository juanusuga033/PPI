import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import '../styles/Perfil.css'

export default function Perfil() {
  const [user, setUser] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [loading, setLoading] = useState(true)
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
    fetchPublicaciones(data.session.user.id)
  }

  async function fetchPublicaciones(userId) {
    try {
      const { data, error } = await supabase
        .from('publicaciones')
        .select('*')
        .eq('usuario_id', userId)
      if (error) throw error
      setPublicaciones(data || [])
    } catch (err) {
      console.error('Error fetching publicaciones:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, imagenUrl) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return
    try {
      // Eliminar imagen si existe
      if (imagenUrl) {
        const fileName = imagenUrl.split('/').pop()
        await supabase.storage
          .from('uniformes')
          .remove([`publicaciones/${fileName}`])
      }

      const { error } = await supabase
        .from('publicaciones')
        .delete()
        .eq('id', id)
      if (error) throw error
      setPublicaciones(publicaciones.filter(p => p.id !== id))
      alert('Publicación eliminada')
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (!user) return <p className="loading">Cargando...</p>

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p className="email">{user.email}</p>
      </div>

      <div className="perfil-content">
        <h2>Mis Publicaciones</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : publicaciones.length === 0 ? (
          <p className="empty">No tienes publicaciones aún</p>
        ) : (
          <div className="publicaciones-list">
            {publicaciones.map((pub) => (
              <div key={pub.id} className="publicacion-item">
                <div className="item-image">
                  {pub.imagen_url && <img src={pub.imagen_url} alt={pub.titulo} />}
                </div>
                <div className="item-info">
                  <h3>{pub.titulo}</h3>
                  <p>Precio: ${pub.precio}</p>
                  <p>Talla: {pub.talla}</p>
                  <p>Tipo: {pub.tipo === 'donacion' ? 'Donación' : 'Venta'}</p>
                  <div className="item-actions">
                    <button className="edit-btn">Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(pub.id, pub.imagen_url)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}