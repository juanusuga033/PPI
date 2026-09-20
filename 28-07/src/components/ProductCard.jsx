import { Link } from 'react-router-dom'
import { getCatalogImage } from '../lib/catalogImages'

// Formatea el precio con separador de miles en pesos colombianos.
function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString('es-CO')}`
}

// Presenta una publicación con su imagen, tipo, precio legible y enlace al detalle.
export default function ProductCard({ product, index = 0 }) {
  const donation = product.tipo === 'donacion'

  return (
    <article className="product-card">
      <Link to={`/producto/${product.id}`} className="product-card-image">
        <img
          src={product.imagen_url || getCatalogImage(index)}
          alt={product.titulo || 'Uniforme disponible'}
          loading="lazy"
        />
        {/* Badge tipo: Donación / Venta */}
        <span className={`badge badge-donacion${donation ? ' badge-donacion--free' : ''}`}>
          {donation ? '🎁 Gratis' : 'Venta'}
        </span>
        {/* Badge condición */}
        <span className="badge badge-condicion">
          {product.condicion || 'Buen estado'}
        </span>
      </Link>

      <div className="product-card-body">
        <p className="product-card-category">{product.categoria || 'Uniformes'}</p>
        <h3 className="product-card-title">{product.titulo || 'Uniforme disponible'}</h3>
        <p className="product-card-meta">
          <span>Talla {product.talla || '—'}</span>
        </p>
        <div className="product-card-footer">
          <strong className={`product-card-price${donation ? ' product-card-price--free' : ''}`}>
            {donation ? 'Gratis' : formatPrice(product.precio)}
          </strong>
          <Link to={`/producto/${product.id}`} className="product-card-cta">
            Ver →
          </Link>
        </div>
      </div>
    </article>
  )
}
