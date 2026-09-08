import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
const AuthContext = createContext({ user: null, profile: null, loading: true })

// Comparte la sesión, el perfil y las acciones de autenticación con toda la interfaz.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { let alive = true
    // Carga el perfil asociado al usuario autenticado.
    async function loadProfile(currentUser) {
      if (!currentUser) { setProfile(null); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
      if (alive) setProfile(data || null)
    }
    // Recupera la sesión guardada y evita dejar la aplicación bloqueada si Supabase no responde.
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!alive) return
      if (error) console.error('No se pudo recuperar la sesión:', error.message)
      setUser(data?.session?.user ?? null)
      await loadProfile(data?.session?.user)
      setLoading(false)
    }).catch((sessionError) => {
      if (!alive) return
      console.error('Error de autenticación:', sessionError.message)
      setUser(null); setProfile(null); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false); void loadProfile(session?.user) })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])
  // Cierra la sesión actual y permite que el listener limpie el estado local.
  async function signOut() { return supabase.auth.signOut() }
  // Actualiza la contraseña del usuario mediante el flujo seguro de Supabase Auth.
  async function updatePassword(password) { return supabase.auth.updateUser({ password }) }
  return <AuthContext.Provider value={{ user, profile, loading, signOut, updatePassword }}>{children}</AuthContext.Provider>
}
// Permite consumir el estado de autenticación desde cualquier componente React.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
