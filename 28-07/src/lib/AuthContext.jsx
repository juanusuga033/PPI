import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
const AuthContext = createContext({ user: null, loading: true })
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { let alive = true
    supabase.auth.getSession().then(({ data }) => { if (alive) { setUser(data.session?.user ?? null); setLoading(false) } })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false) })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
