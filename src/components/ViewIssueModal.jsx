import { X, ArrowBigUp, Bug, Lightbulb, User, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_MAP = {
  open:     { label: 'Open',     cls: 'badge-open' },
  underway: { label: 'Underway', cls: 'badge-underway' },
  resolved: { label: 'Resolved', cls: 'badge-resolved' },
  denied:   { label: 'Denied',   cls: 'badge-denied' },
}

export default function ViewIssueModal({ issue, isOpen, onClose }) {
  if (!isOpen || !issue) return null

  const status = STATUS_MAP[issue.status] || STATUS_MAP.open
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(new Date(issue.created_at))

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22 }}
        style={{ maxWidth: '640px', width: '100%' }}
      >
        <div className="modal-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: '1rem' }}>
            <div className="card-chips" style={{ marginBottom: '0.75rem' }}>
              <span className="type-chip">
                {issue.type === 'bug'
                  ? <><Bug size={11} /> Bug</>
                  : <><Lightbulb size={11} /> Suggestion</>
                }
              </span>
              <span className={`badge ${status.cls}`}>{status.label}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>{issue.title}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '120px' }}>
          <div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Description</h4>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {issue.description}
            </p>
          </div>

          {issue.steps_to_reproduce && (
            <div style={{ marginTop: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Steps to Reproduce</h4>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
                {issue.steps_to_reproduce}
              </p>
            </div>
          )}

          {issue.contact_method && issue.contact_details && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
              <MessageCircle size={16} color="var(--accent-light)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Contact via <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{issue.contact_method}</strong>:
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                {issue.contact_details}
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {issue.author_username && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={11} color="var(--accent-light)" />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {issue.author_username}
                </span>
              </div>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Submitted {formattedDate}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-base)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-soft)' }}>
            <ArrowBigUp size={16} color="var(--accent-light)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {issue.upvotes} upvotes
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
