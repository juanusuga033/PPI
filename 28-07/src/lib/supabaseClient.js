import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function makeFallbackQuery() {
  return {
    data: [],
    error: null,
    select() { return this },
    eq() { return this },
    order() { return this },
    limit() { return this },
    maybeSingle() { this.data = null; return this },
    single() { this.data = null; return this },
    insert() { return this },
    update() { return this },
    delete() { return this },
    upsert() { return this },
    filter() { return this },
    neq() { return this },
    gte() { return this },
    lte() { return this },
    like() { return this },
    ilike() { return this },
    in() { return this },
    contains() { return this },
  }
}

const fallbackSupabase = {
  auth: {
    async getSession() {
      return { data: { session: null }, error: null }
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } }
    },
    async signInWithPassword() {
      return { data: { user: null }, error: null }
    },
    async signOut() {
      return { error: null }
    },
    async updateUser() {
      return { data: { user: null }, error: null }
    },
    async signUp() {
      return { data: { user: null }, error: null }
    },
    async resetPasswordForEmail() {
      return { data: null, error: null }
    },
  },
  from() {
    return makeFallbackQuery()
  },
  storage: {
    from() {
      return {
        async upload() { return { error: null } },
        async remove() { return { error: null } },
        getPublicUrl() { return { data: { publicUrl: '' } } },
      }
    },
  },
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase no está configurado; la app sigue cargando en modo seguro sin base de datos.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : fallbackSupabase
