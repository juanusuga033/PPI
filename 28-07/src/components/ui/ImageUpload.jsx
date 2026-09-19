import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import './ImageUpload.css'

/**
 * ImageUpload — Zona drag-and-drop para subir imágenes.
 *
 * Props:
 *   label     {string}     Texto del label
 *   multiple  {boolean}    Permite múltiples archivos
 *   maxFiles  {number}     Límite de archivos (default 5)
 *   maxSizeMB {number}     Límite en MB (default 5)
 *   light     {boolean}    Variante clara (para perfil)
 *   onChange  {function}   Recibe el array de File[]
 *   accept    {string}     Tipos MIME aceptados
 */
export default function ImageUpload({
  label = 'Imágenes',
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 5,
  light = false,
  onChange,
  accept = 'image/jpeg,image/png,image/webp',
}) {
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState([]) // { url, name }
  const [dragOver, setDragOver] = useState(false)

  function processFiles(fileList) {
    const files = Array.from(fileList)
    const valid = files.filter(f => {
      if (!accept.split(',').includes(f.type)) return false
      if (f.size > maxSizeMB * 1024 * 1024) return false
      return true
    })
    const limited = multiple ? valid.slice(0, maxFiles) : valid.slice(0, 1)
    const newPreviews = limited.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setPreviews(newPreviews)
    onChange?.(limited)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    processFiles(e.dataTransfer.files)
  }

  function removeThumb(index) {
    const next = previews.filter((_, i) => i !== index)
    setPreviews(next)
    // Si no quedan imágenes, limpiar el input
    if (next.length === 0 && inputRef.current) inputRef.current.value = ''
    onChange?.(next.map(() => null)) // informa al padre que se limpió
  }

  const hint = `JPG, PNG o WebP · máx. ${maxSizeMB} MB${multiple ? ` · hasta ${maxFiles} fotos` : ''}`

  return (
    <div className={`iu-wrapper${light ? ' iu-light' : ''}`}>
      <span className="iu-label-text">{label}</span>

      <div
        className={`iu-dropzone${dragOver ? ' drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={`Subir ${label}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="iu-input"
          accept={accept}
          multiple={multiple}
          onChange={e => processFiles(e.target.files)}
          tabIndex={-1}
          aria-hidden="true"
        />
        <UploadCloud size={36} strokeWidth={1.5} className="iu-icon" />
        <span className="iu-main-text">
          Arrastra una imagen o <span style={{ textDecoration: 'underline' }}>haz clic para seleccionar</span>
        </span>
        <span className="iu-sub-text">{hint}</span>
      </div>

      {previews.length > 0 && (
        <div className="iu-previews">
          {previews.map((p, i) => (
            <div key={p.url} className="iu-thumb">
              <img src={p.url} alt={`Vista previa ${i + 1}`} />
              <button
                type="button"
                className="iu-thumb-remove"
                onClick={e => { e.stopPropagation(); removeThumb(i) }}
                aria-label="Quitar imagen"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

