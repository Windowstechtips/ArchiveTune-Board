import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const navigate  = useNavigate()
  const { refreshProfile } = useAuth()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores.')
      return
    }

    setLoading(true)

    // 1. Check username availability before creating auth user
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle()

    if (existing) {
      setError('That username is already taken.')
      setLoading(false)
      return
    }

    // 2. Create auth user — pass username as metadata.
    //    The DB trigger (handle_new_user) will auto-create the profiles row.
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: trimmedUsername },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // If Supabase email confirmation is OFF, the user is instantly logged in.
    // If it's ON, show a "check your email" message instead of redirecting.
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={22} color="#9d5ff5" />
          </div>
          <h2>Create Account</h2>
          <p style={{ marginTop: '0.375rem', fontSize: '0.875rem' }}>
            Join the ArchiveTune community
          </p>
        </div>

        <div className="auth-body">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="text"
                className="input"
                placeholder="cooluser123"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                maxLength={30}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Letters, numbers, and underscores only
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Email address <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span style={{ color: '#f87171' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', padding: 0
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', paddingTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
