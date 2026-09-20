import { ChevronDown } from 'lucide-react'
import './CustomSelect.css'

/**
 * CustomSelect — Dropdown estilizado que reemplaza el <select> nativo sin estilo.
 *
 * Props:
 *   label    {string}   Texto del label
 *   required {boolean}  Muestra asterisco
 *   dark     {boolean}  Variante sobre fondo oscuro
 *   ...rest  Pasa al <select> nativo (value, onChange, etc.)
 */
export default function CustomSelect({
  label,
  required = false,
  dark = false,
  id,
  children,
  className = '',
  ...rest
}) {
  const fieldId = id || `cs-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const wrapClass = ['cs-wrapper', dark ? 'cs-dark' : '', className]
    .filter(Boolean).join(' ')

  return (
    <div className={wrapClass}>
      {label && (
        <label className="cs-label" htmlFor={fieldId}>
          {label}
          {required && <span className="cs-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className="cs-container">
        <select id={fieldId} className="cs-select" required={required} {...rest}>
          {children}
        </select>
        <span className="cs-arrow" aria-hidden="true">
          <ChevronDown size={16} strokeWidth={2.5} />
        </span>
      </div>
    </div>
  )
}

