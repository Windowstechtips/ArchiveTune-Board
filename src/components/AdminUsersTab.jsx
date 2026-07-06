import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Ban, CheckCircle, User, AlertTriangle, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminUsersTab() {
  const [profiles, setProfiles]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // id of user being acted on

  useEffect(() => { fetchProfiles() }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setProfiles(data || [])
    setLoading(false)
  }

  const toggleBan = async (profileId, currentBanState) => {
    setActionLoading(profileId)
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentBanState })
      .eq('id', profileId)

    if (error) {
      console.error('Failed to update ban status', error)
      alert('Failed to update. Please try again.')
    } else {
      setProfiles(prev =>
        prev.map(p => p.id === profileId ? { ...p, is_banned: !currentBanState } : p)
      )
    }
    setActionLoading(null)
  }

  const filtered = profiles.filter(p =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const bannedCount = profiles.filter(p => p.is_banned).length

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>User Management</h2>
        <p style={{ fontSize: '0.875rem' }}>
          {profiles.length} registered user{profiles.length !== 1 ? 's' : ''}
          {bannedCount > 0 && (
            <span style={{ color: 'var(--status-denied-text)', marginLeft: '0.5rem' }}>
              · {bannedCount} banned
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          className="input"
          placeholder="Search users…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {loading ? (
        <p className="loading-text">Loading users…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem' }}>
          <div className="empty-state-icon"><User size={22} /></div>
          <p>{searchQuery ? 'No users match your search' : 'No registered users yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                background: profile.is_banned ? 'rgba(239,68,68,0.04)' : 'var(--bg-surface)',
                border: `1px solid ${profile.is_banned ? 'rgba(239,68,68,0.15)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: profile.is_banned ? 'rgba(239,68,68,0.1)' : 'var(--accent-dim)',
                border: `1px solid ${profile.is_banned ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={16} color={profile.is_banned ? '#f87171' : 'var(--accent-light)'} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{profile.username}</span>
                  {profile.is_banned && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', padding: '0.15em 0.5em',
                      background: 'rgba(239,68,68,0.12)', color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.25)', borderRadius: '99px'
                    }}>
                      Banned
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  Joined {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(profile.created_at))}
                </div>
              </div>

              {/* Action */}
              <button
                className={`btn btn-sm ${profile.is_banned ? 'btn-outline' : 'btn-danger'}`}
                onClick={() => toggleBan(profile.id, profile.is_banned)}
                disabled={actionLoading === profile.id}
                style={{
                  flexShrink: 0,
                  ...(profile.is_banned ? {
                    borderColor: 'rgba(16,185,129,0.35)',
                    color: 'var(--status-resolved-text)',
                    background: 'rgba(16,185,129,0.08)'
                  } : {})
                }}
              >
                {actionLoading === profile.id
                  ? '…'
                  : profile.is_banned
                    ? <><CheckCircle size={14} /> Unban</>
                    : <><Ban size={14} /> Ban</>
                }
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {bannedCount > 0 && (
        <div className="alert" style={{ marginTop: '1.25rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--status-underway-text)' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          Banned users can still view the board but cannot submit new posts.
        </div>
      )}
    </div>
  )
}
