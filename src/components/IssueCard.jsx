import { useState } from 'react'
import { ArrowBigUp, Bug, Lightbulb, User, Maximize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const STATUS_MAP = {
  open:     { label: 'Open',     cls: 'badge-open' },
  underway: { label: 'Underway', cls: 'badge-underway' },
  resolved: { label: 'Resolved', cls: 'badge-resolved' },
  denied:   { label: 'Denied',   cls: 'badge-denied' },
}

export default function IssueCard({ issue, hasVoted, onVote, onView }) {
  const { session } = useAuth()
  const [isVoting, setIsVoting] = useState(false)
  const status   = STATUS_MAP[issue.status] || STATUS_MAP.open

  const handleVote = async () => {
    if (isVoting) return
    if (!session) {
      alert("You must be logged in to upvote.")
      return
    }

    setIsVoting(true)
    if (hasVoted) {
      // Remove vote
      const { error } = await supabase
        .from('issue_votes')
        .delete()
        .eq('issue_id', issue.id)
        .eq('user_id', session.user.id)
      
      if (!error) {
        onVote(issue.id, issue.upvotes - 1, false)
      }
    } else {
      // Add vote
      const { error } = await supabase
        .from('issue_votes')
        .insert({ issue_id: issue.id, user_id: session.user.id })
      
      if (!error) {
        onVote(issue.id, issue.upvotes + 1, true)
      }
    }
    setIsVoting(false)
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(issue.created_at))

  return (
    <motion.div
      className="issue-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Upvote */}
      <div className="upvote-col">
        <button
          className={`upvote-btn ${hasVoted ? 'voted' : ''}`}
          onClick={handleVote}
          disabled={isVoting}
          title={hasVoted ? 'Already upvoted' : 'Upvote'}
        >
          <ArrowBigUp size={20} strokeWidth={hasVoted ? 2.5 : 2} />
          <span className="upvote-count">{issue.upvotes}</span>
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Meta row */}
        <div className="card-meta">
          <div className="card-chips" style={{ flex: 1 }}>
            <span className="type-chip">
              {issue.type === 'bug'
                ? <><Bug size={11} /> Bug</>
                : <><Lightbulb size={11} /> Suggestion</>
              }
            </span>
            <span className={`badge ${status.cls}`}>{status.label}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="card-date">{formattedDate}</span>
            <button
              className="btn btn-ghost btn-icon"
              style={{ width: 24, height: 24, padding: 0 }}
              onClick={() => onView && onView(issue)}
              title="View full issue"
            >
              <Maximize2 size={14} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        <h3 className="card-title">{issue.title}</h3>
        <p className="card-description">{issue.description}</p>

        {/* Author */}
        {issue.author_username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: 'auto', paddingTop: '0.75rem' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={11} color="var(--accent-light)" />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {issue.author_username}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
