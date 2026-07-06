import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)   // null = not loaded yet or admin
  const [isAdmin, setIsAdmin]   = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setAuthReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setIsAdmin(false)
        setAuthReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      
    setProfile(data || null)
    
    // An admin is anyone who has is_admin set to true in their profile.
    // If they have no profile at all, they aren't admin (unless we explicitly want to support profile-less admins, but now they can just sign up).
    setIsAdmin(data?.is_admin === true)
    setAuthReady(true)
  }

  const refreshProfile = () => {
    if (session?.user?.id) fetchProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, profile, isAdmin, authReady, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
