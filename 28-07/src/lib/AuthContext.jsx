import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
const AuthContext = createContext({ user: null, profile: null, loading: true })
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { let alive = true
    async function loadProfile(currentUser) {
      if (!currentUser) { setProfile(null); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
      if (alive) setProfile(data || null)
    }
    supabase.auth.getSession().then(async ({ data }) => { if (alive) { setUser(data.session?.user ?? null); await loadProfile(data.session?.user); setLoading(false) } })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false); void loadProfile(session?.user) })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])
  async function signOut() { return supabase.auth.signOut() }
  async function updatePassword(password) { return supabase.auth.updateUser({ password }) }
  return <AuthContext.Provider value={{ user, profile, loading, signOut, updatePassword }}>{children}</AuthContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
