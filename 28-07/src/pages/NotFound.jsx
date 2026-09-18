import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>La página que buscas no existe o fue movida.</p>
      <Link to="/" className="not-found-btn">Volver al inicio</Link>
    </div>
  )
}
