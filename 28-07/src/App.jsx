import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Compra from './pages/Compra'
import Venta from './pages/Venta'
import Donaciones from './pages/Donaciones'
import Perfil from './pages/Perfil'
import Producto from './pages/Producto'
import Contacto from './pages/Contacto'
import PasswordReset from './pages/PasswordReset'

// Protege las rutas privadas y espera a que Supabase resuelva la sesión.
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-state">Cargando tu cuenta…</div>
  return user ? children : <Navigate to="/login" replace />
}

// Define el enrutamiento principal y registra los proveedores globales de la aplicación.
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}><AuthProvider>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/compra" element={<Compra />} />
          <Route path="/venta" element={<Protected><Venta /></Protected>} />
          <Route path="/donar" element={<Protected><Venta donationOnly /></Protected>} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/perfil" element={<Protected><Perfil /></Protected>} />
          <Route path="/mis-publicaciones" element={<Protected><Perfil /></Protected>} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/donacion/:id" element={<Producto />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/recuperar-password" element={<PasswordReset />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main><Footer />
    </AuthProvider></BrowserRouter>
  )
}

export default App
