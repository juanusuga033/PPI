import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRecovering, setIsRecovering] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (isRecovering) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) {
        alert(error.message)
        return
      }
      alert('Te enviamos un enlace para restablecer tu contraseña.')
      setIsRecovering(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
      return
    }
    console.log('Sesión iniciada:', data)
    navigate('/')
  }

  return (
    <section className="auth-form">
      <h2>{isRecovering ? 'Recuperar contraseña' : 'Iniciar sesión'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {!isRecovering && <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>}
        <button type="submit">{isRecovering ? 'Enviar enlace' : 'Entrar'}</button>
      </form>
      <button type="button" className="auth-secondary-btn" onClick={() => setIsRecovering(!isRecovering)}>
        {isRecovering ? 'Volver a iniciar sesión' : '¿Olvidaste tu contraseña?'}
      </button>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </section>
  )
}
