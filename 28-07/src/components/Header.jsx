import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import '../styles/Header.css'

export default function Header() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkUser()
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user || null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="app-header">
      <nav className="nav-container">
        <div className="nav-buttons">
          <Link to="/donaciones" className={`nav-btn ${isActive('/donaciones') ? 'active' : ''}`}>Donaciones</Link>
          <Link to="/" className={`nav-btn ${isActive('/') ? 'active' : ''}`}>Inicio</Link>
          <Link to="/compra" className={`nav-btn ${isActive('/compra') ? 'active' : ''}`}>Compra</Link>
          <Link to={user ? '/venta' : '/login'} className={`nav-btn ${isActive('/venta') ? 'active' : ''}`}>Venta</Link>
        </div>
        <div className="user-section">
          {user ? (
            <>
              <Link to="/perfil" className="perfil-link">Perfil</Link>
              <button onClick={handleLogout} className="logout-btn">Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
              <Link to="/register" className="nav-link">Registro</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}