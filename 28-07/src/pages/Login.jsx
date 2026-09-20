import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import FormField from '../components/ui/FormField'

// Gestiona el inicio de sesión y verifica que el correo esté confirmado.
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) {
      setLoading(false)
      return setError(authError.message)
    }
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      setLoading(false)
      return setError('Confirma tu correo electrónico antes de iniciar sesión.')
    }
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <span className="eyebrow">Dona y Viste · comunidad circular</span>
        <h1>Lo que cuidas, vuelve a servir.</h1>
        <p>Ingresa para comprar, publicar y compartir uniformes que todavía tienen mucho por dar.</p>
      </aside>
      <main className="auth-panel">
        <section className="auth-form">
          <span className="eyebrow">Bienvenida de vuelta</span>
          <h2>Inicia sesión</h2>
          <p style={{ textAlign: 'left', marginTop: 0 }}>Continúa en tu comunidad Dona y Viste.</p>

          <form onSubmit={submit}>
            <FormField
              label="Correo electrónico"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />

            {/* Campo de contraseña con toggle ver/ocultar */}
            <div className="ff-wrapper">
              <label className="ff-label" htmlFor="login-password">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="ff-input"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    color: '#5e6d67',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="button primary" disabled={loading}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <Link className="auth-secondary-btn" to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
          <p>¿Aún no tienes cuenta? <Link to="/register">Créala aquí</Link></p>
        </section>
      </main>
    </div>
  )
}
