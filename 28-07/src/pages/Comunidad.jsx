import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import '../styles/Comunidad.css'

export default function Comunidad() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contenido, setContenido] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [comentarioTexto, setComentarioTexto] = useState({})

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('comunidad_posts')
        .select('*, comunidad_comentarios(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('No se pudo cargar la comunidad. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [fetchPosts])

  async function handlePublicar(e) {
    e.preventDefault()
    if (!user) return
    if (!contenido.trim()) {
      setError('Escribe algo antes de publicar.')
      return
    }
    setPublicando(true)
    setError('')
    try {
      const { error } = await supabase
        .from('comunidad_posts')
        .insert([{ usuario_id: user.id, contenido: contenido.trim() }])
      if (error) throw error
      setContenido('')
      await fetchPosts()
    } catch (err) {
      setError('No se pudo publicar: ' + err.message)
    } finally {
      setPublicando(false)
    }
  }

  async function handleComentar(postId) {
    const texto = (comentarioTexto[postId] || '').trim()
    if (!user || !texto) return
    try {
      const { error } = await supabase
        .from('comunidad_comentarios')
        .insert([{ post_id: postId, usuario_id: user.id, contenido: texto }])
      if (error) throw error
      setComentarioTexto((c) => ({ ...c, [postId]: '' }))
      await fetchPosts()
    } catch (err) {
      alert('No se pudo comentar: ' + err.message)
    }
  }

  async function handleDeletePost(post) {
    if (!confirm('¿Eliminar esta publicación de la comunidad?')) return
    try {
      const { error } = await supabase.from('comunidad_posts').delete().eq('id', post.id)
      if (error) throw error
      setPosts((current) => current.filter((p) => p.id !== post.id))
    } catch (err) {
      alert('No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <div className="comunidad-page">
      <h1>Comunidad</h1>
      <p className="subtitle">Comparte experiencias, dudas o agradecimientos con otras familias de la I.E. La Candelaria.</p>

      {user ? (
        <form className="post-form" onSubmit={handlePublicar}>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe algo para la comunidad..."
            rows={3}
          />
          <button type="submit" disabled={publicando}>{publicando ? 'Publicando...' : 'Publicar'}</button>
        </form>
      ) : (
        <p className="empty">Inicia sesión para participar en la comunidad.</p>
      )}

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="loading">Cargando publicaciones...</p>
      ) : posts.length === 0 ? (
        <p className="empty">Aún no hay publicaciones en la comunidad. ¡Sé el primero!</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-content">{post.contenido}</div>
              <div className="post-meta">
                {new Date(post.created_at).toLocaleString('es-CO')}
                {user?.id === post.usuario_id && (
                  <button className="delete-post-btn" onClick={() => handleDeletePost(post)}>Eliminar</button>
                )}
              </div>

              <div className="comentarios-list">
                {(post.comunidad_comentarios || [])
                  .slice()
                  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                  .map((c) => (
                    <div key={c.id} className="comentario-item">{c.contenido}</div>
                  ))}
              </div>

              {user && (
                <div className="comentario-form">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={comentarioTexto[post.id] || ''}
                    onChange={(e) => setComentarioTexto((c) => ({ ...c, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComentar(post.id)}
                  />
                  <button onClick={() => handleComentar(post.id)}>Responder</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
