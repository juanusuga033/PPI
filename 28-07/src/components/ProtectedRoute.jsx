import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (!data.session) {
        navigate('/login')
        return
      }
      setStatus('ready')
    })
    return () => {
      active = false
    }
  }, [navigate])

  if (status === 'checking') return <p className="loading">Cargando...</p>
  return children
}
