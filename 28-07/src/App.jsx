import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Compra from './pages/Compra'
import Venta from './pages/Venta'
import Donaciones from './pages/Donaciones'
import Perfil from './pages/Perfil'
import Producto from './pages/Producto'
import Contacto from './pages/Contacto'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/compra" element={<Compra />} />
          <Route path="/venta" element={<Venta />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/donacion/:id" element={<Producto />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
