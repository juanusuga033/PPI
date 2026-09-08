import { Link } from 'react-router-dom'
// Muestra los enlaces secundarios y la identidad de la aplicación.
export default function Footer() { return <footer className="site-footer"><div><Link className="brand" to="/">Donay<span>Viste</span></Link><p>Uniformes con nuevas historias para una comunidad que crece junta.</p></div><div className="footer-links"><Link to="/compra">Comprar</Link><Link to="/donaciones">Donaciones</Link><Link to="/contacto">Contacto</Link></div><small>© {new Date().getFullYear()} DonayViste · Economía circular educativa</small></footer> }
