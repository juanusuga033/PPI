import '../styles/Contacto.css'

export default function Contacto() {
  return (
    <div className="contacto-page">
      <div className="contacto-container">
        <div className="contacto-info">
          <h1>DONA Y VISTE</h1>
          <p className="subtitle">Contáctanos!</p>
          
          <div className="info-item">
            <span className="icon">📱</span>
            <span>336-4824793</span>
          </div>
          
          <div className="info-item">
            <span className="icon">📧</span>
            <span>donayviste@gmail.com</span>
          </div>
          
          <div className="info-item">
            <span className="icon">🌐</span>
            <span>www.Donayviste.com</span>
          </div>
          
          <div className="info-item">
            <span className="icon">📍</span>
            <span>Santo domingo - Medellin</span>
          </div>
        </div>
        
        <div className="contacto-logo">
          <div className="shield">
            <img src="/catalog/uniforme-15-page-4.jpeg" alt="Escudo de la I.E. La Candelaria" />
          </div>
        </div>
      </div>
    </div>
  )
}