import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from './supabase'

const AuthCtx = createContext({ user: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, loading, signOut }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)

export async function savePrediction({ kind, input, output, top_label, top_probability }) {
  if (!supabaseEnabled) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('predictions')
    .insert({ user_id: user.id, kind, input, output, top_label, top_probability })
    .select()
    .single()
  if (error) {
    console.warn('savePrediction failed', error)
    return null
  }
  return data
}
