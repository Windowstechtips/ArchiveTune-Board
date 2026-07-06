import { useState } from 'react'
import { Bug, Lightbulb, Trash2, Maximize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import CustomDropdown from './CustomDropdown'

const STATUS_MAP = {
  open:     { label: 'Open',     cls: 'badge-open' },
  underway: { label: 'Underway', cls: 'badge-underway' },
  resolved: { label: 'Resolved', cls: 'badge-resolved' },
  denied:   { label: 'Denied',   cls: 'badge-denied' },
}

const STATUS_OPTIONS = [
  { value: 'open',     label: 'Open' },
  { value: 'underway', label: 'Underway' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'denied',   label: 'Denied' },
]

export default function AdminIssueCard({ issue, onStatusChange, onDelete, onView }) {
  const status = STATUS_MAP[issue.status] || STATUS_MAP.open
  const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(issue.created_at))

  return (
    <motion.div
      className="issue-card"
      style={{ flexDirection: 'column', gap: '1rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="type-chip">
            {issue.type === 'bug'
              ? <><Bug size={11} /> Bug</>
              : <><Lightbulb size={11} /> Suggestion</>
            }
          </span>
          <span className={`badge ${status.cls}`}>{status.label}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: 600 }}>
            ↑ {issue.upvotes}
          </span>
        </div>

        <button
          className="btn btn-danger btn-icon"
          onClick={() => onDelete(issue.id)}
          title="Delete issue"
          style={{ flexShrink: 0 }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Title & description */}
      <div>
        <h3 className="card-title" style={{ marginBottom: '0.375rem' }}>{issue.title}</h3>
        <p className="card-description">{issue.description}</p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
          <button
            className="btn btn-ghost btn-icon"
            style={{ width: 24, height: 24, padding: 0 }}
            onClick={() => onView && onView(issue)}
            title="View full issue"
          >
            <Maximize2 size={14} color="var(--text-muted)" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status</span>
          <CustomDropdown
            value={issue.status}
            onChange={(val) => onStatusChange(issue.id, val)}
            options={STATUS_OPTIONS}
            openUp
          />
        </div>
      </div>
    </motion.div>
  )
}
