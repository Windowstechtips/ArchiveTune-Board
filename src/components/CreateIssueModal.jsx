import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Bug, Lightbulb, AlertCircle, Lock, UserX } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const DAILY_LIMIT = 3

export default function CreateIssueModal({ isOpen, onClose, onCreated }) {
  const { session, profile } = useAuth()
  const [title, setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [type, setType]         = useState('suggestion')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]       = useState(null)

  if (!isOpen) return null

  // ── Not logged in ──
  if (!session) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.125rem' }}>Sign in required</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem', gap: '1.25rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Lock size={24} color="var(--accent-light)" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>You need an account to post</h3>
              <p style={{ fontSize: '0.9rem' }}>Create a free account to submit suggestions and report bugs.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary" onClick={onClose}>Create Account</Link>
              <Link to="/login"  className="btn btn-outline" onClick={onClose}>Sign In</Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Incomplete Profile (e.g. account created before the trigger fix) ──
  if (!profile) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.125rem' }}>Profile Incomplete</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem', gap: '1.25rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <AlertCircle size={24} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Missing Profile Information</h3>
              <p style={{ fontSize: '0.9rem' }}>Your account was created, but your profile setup failed (likely due to an earlier bug). Please log out, delete this account from your Supabase dashboard, and sign up again.</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Banned ──
  if (profile.is_banned) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.125rem' }}>Account Restricted</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem', gap: '1.25rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <UserX size={24} color="#f87171" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Your account has been banned</h3>
              <p style={{ fontSize: '0.9rem' }}>You are not able to submit posts. Please contact support if you believe this is a mistake.</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setIsSubmitting(true)
    setError(null)

    // ── Daily rate limit check ──
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('issues')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', todayStart.toISOString())

    if (countError) {
      setError('Could not verify your post limit. Please try again.')
      setIsSubmitting(false)
      return
    }

    if (count >= DAILY_LIMIT) {
      setError(`You've reached the daily limit of ${DAILY_LIMIT} submissions. Come back tomorrow!`)
      setIsSubmitting(false)
      return
    }

    // ── Insert ──
    const { data, error: insertError } = await supabase
      .from('issues')
      .insert([{
        title:           title.trim(),
        description:     description.trim(),
        type,
        user_id:         session.user.id,
        author_username: profile.username,
      }])
      .select()

    if (insertError) {
      setError('Failed to submit. Please try again.')
    } else if (data) {
      onCreated(data[0])
      setTitle('')
      setDescription('')
      setType('suggestion')
      onClose()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22 }}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.125rem' }}>Submit Feedback</h2>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.2rem' }}>
              Posting as <strong style={{ color: 'var(--accent-light)' }}>{profile.username}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>· up to {DAILY_LIMIT} posts/day</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Type toggle */}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {[
                  { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb size={16} /> },
                  { value: 'bug',        label: 'Bug Report',  icon: <Bug size={16} /> },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${type === opt.value ? 'rgba(124,58,237,0.5)' : 'var(--border-soft)'}`,
                      background: type === opt.value ? 'var(--accent-dim)' : 'var(--bg-base)',
                      color: type === opt.value ? 'var(--accent-light)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                      fontWeight: type === opt.value ? 600 : 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Brief, clear summary…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                placeholder="Describe in detail…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
