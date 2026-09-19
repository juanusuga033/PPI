import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import FormField from '../components/ui/FormField'

// Registra una cuenta nueva y solicita la confirmación del correo electrónico.
export default function Register() {
  const [form, setForm] = useState({ first: '', last: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm({ ...form, [k]: v })

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { first_name: form.first.trim(), last_name: form.last.trim() },
      },
    })
    setLoading(false)
    if (authError) return setError(authError.message)
    setSuccess(true)
  }

  if (success) return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h1>Una nueva historia comienza.</h1>
      </aside>
      <main className="auth-panel">
        <section className="auth-form">
          <span className="eyebrow">Cuenta creada</span>
          <h2>Revisa tu correo</h2>
          <div className="form-success">
            Te enviamos un enlace de confirmación a <b>{form.email}</b>. Ábrelo para activar tu cuenta y luego podrás iniciar sesión.
          </div>
          <p><Link to="/login">Volver a iniciar sesión</Link></p>
        </section>
      </main>
    </div>
  )

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <span className="eyebrow">Únete a la comunidad</span>
        <h1>Una prenda puede hacer una gran diferencia.</h1>
        <p>Crea tu cuenta y participa en una economía escolar más cercana y sostenible.</p>
      </aside>
      <main className="auth-panel">
        <section className="auth-form">
          <span className="eyebrow">Crear cuenta</span>
          <h2>Únete a Dona y Viste</h2>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <FormField
                label="Nombre"
                required
                value={form.first}
                onChange={e => set('first', e.target.value)}
                placeholder="Juan"
                autoComplete="given-name"
              />
              <FormField
                label="Apellido"
                required
                value={form.last}
                onChange={e => set('last', e.target.value)}
                placeholder="García"
                autoComplete="family-name"
              />
            </div>
            <FormField
              label="Correo electrónico"
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
            <FormField
              label="Contraseña"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
            <FormField
              label="Confirmar contraseña"
              type="password"
              required
              minLength={6}
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
            />
            {error && <div className="form-error">{error}</div>}
            <button className="button primary" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
            </button>
          </form>
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </section>
      </main>
    </div>
  )
}
