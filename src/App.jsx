import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { supabase } from './supabaseClient'
import { Music, Shield, LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Pages
import Board from './pages/Board'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'

function UserMenu({ profile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen(o => !o)}
        style={{ gap: '0.5rem', paddingLeft: '0.625rem' }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(124,58,237,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <User size={14} color="var(--accent-light)" />
        </div>
        <span style={{ fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile?.username || 'Unknown User'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="var(--text-muted)" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: 180, background: 'var(--bg-elevated)',
              border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)',
              overflow: 'hidden', zIndex: 200,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{profile?.username || 'Unknown User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Member</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '0.625rem', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s', textAlign: 'left'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function App() {
  const { session, profile, isAdmin, authReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleAdminLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!authReady) return null // wait for auth to resolve before rendering

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <Music size={18} color="#9d5ff5" />
            </div>
            <span className="brand-name">Archive<span>Tune</span></span>
          </Link>

          <div className="navbar-actions">
            {!session && (
              <>
                <Link to="/login"  className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 0.25rem' }} />
                <Link to="/admin" className="btn btn-ghost btn-sm">
                  <Shield size={14} /> Admin
                </Link>
              </>
            )}

            {session && profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-ghost btn-sm" style={{ gap: '0.375rem', color: 'var(--accent-light)' }}>
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                )}
                <UserMenu profile={profile} />
              </div>
            )}

            {/* Fallback for broken accounts (logged in, not admin, no profile) */}
            {session && !isAdmin && !profile && (
              <button onClick={handleAdminLogout} className="btn btn-ghost btn-sm" style={{ color: '#f87171' }}>
                <LogOut size={14} /> Log out (Setup Incomplete)
              </button>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/"        element={<Board />} />
        <Route path="/signup"  element={session && !isAdmin ? <Navigate to="/" /> : <SignupPage />} />
        <Route path="/login"   element={session && !isAdmin ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/admin"   element={
          !session      ? <AdminLogin /> :
          isAdmin       ? <AdminDashboard /> :
                          <Navigate to="/" />
        } />
      </Routes>
    </>
  )
}

export default App
