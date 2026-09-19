import './FormField.css'

/**
 * FormField — Input o textarea con label fijo encima del campo.
 *
 * Props:
 *   label      {string}  Texto del label (requerido)
 *   required   {boolean} Muestra asterisco y agrega atributo required
 *   error      {string}  Mensaje de error inline (rojo)
 *   dark       {boolean} Variante sobre fondo oscuro
 *   multiline  {boolean} Usa <textarea> en vez de <input>
 *   ...rest    Se pasa directamente al <input> / <textarea>
 */
export default function FormField({
  label,
  required = false,
  error = '',
  dark = false,
  multiline = false,
  id,
  className = '',
  ...rest
}) {
  const fieldId = id || `ff-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const wrapClass = [
    'ff-wrapper',
    dark ? 'ff-dark' : '',
    error ? 'has-error' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapClass}>
      <label className="ff-label" htmlFor={fieldId}>
        {label}
        {required && <span className="ff-required" aria-hidden="true"> *</span>}
      </label>

      {multiline ? (
        <textarea
          id={fieldId}
          className="ff-textarea"
          required={required}
          {...rest}
        />
      ) : (
        <input
          id={fieldId}
          className="ff-input"
          required={required}
          {...rest}
        />
      )}

      {error && <span className="ff-error-msg" role="alert">{error}</span>}
    </div>
  )
}

