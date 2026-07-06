import { useState, useEffect } from 'react'
import { Plus, SlidersHorizontal, Inbox } from 'lucide-react'
import { supabase } from '../supabaseClient'
import IssueCard from '../components/IssueCard'
import CreateIssueModal from '../components/CreateIssueModal'
import ViewIssueModal from '../components/ViewIssueModal'
import CustomDropdown from '../components/CustomDropdown'
import { AnimatePresence, motion } from 'framer-motion'

const FILTER_OPTIONS = [
  { value: 'all',      label: 'All Issues' },
  { value: 'open',     label: 'Open' },
  { value: 'underway', label: 'Underway' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'denied',   label: 'Denied' },
]

const TYPE_OPTIONS = [
  { value: 'all',        label: 'All Types' },
  { value: 'suggestion', label: 'Suggestions' },
  { value: 'bug',        label: 'Bugs' },
]

export default function Board() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => { fetchIssues() }, [])

  const fetchIssues = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setIssues(data || [])
    setLoading(false)
  }

  const handleIssueCreated = (newIssue) => {
    setIssues(prev => [newIssue, ...prev])
  }

  const handleVote = (id, newUpvotes) => {
    setIssues(prev =>
      prev
        .map(i => i.id === id ? { ...i, upvotes: newUpvotes } : i)
        .sort((a, b) => b.upvotes - a.upvotes)
    )
  }

  const filtered = issues.filter(i => {
    const statusOk = statusFilter === 'all' || i.status === statusFilter
    const typeOk   = typeFilter   === 'all' || i.type   === typeFilter
    return statusOk && typeOk
  })

  return (
    <>
      <div className="page">
        {/* Hero header */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                Community Feedback
              </p>
              <h1 className="page-title">Feedback Pinboard</h1>
              <p className="page-subtitle" style={{ marginTop: '0.5rem', maxWidth: '480px' }}>
                Share ideas, report bugs, and vote on what matters most to the ArchiveTune community.
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ height: 'fit-content' }}>
              <Plus size={17} />
              New Submission
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',    value: issues.length },
              { label: 'Open',     value: issues.filter(i => i.status === 'open').length },
              { label: 'Underway', value: issues.filter(i => i.status === 'underway').length },
              { label: 'Resolved', value: issues.filter(i => i.status === 'resolved').length },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <CustomDropdown value={statusFilter} onChange={setStatusFilter} options={FILTER_OPTIONS} />
            <CustomDropdown value={typeFilter}   onChange={setTypeFilter}   options={TYPE_OPTIONS} />
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* Cards */}
        {loading ? (
          <p className="loading-text">Loading submissions…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Inbox size={24} /></div>
            <h3>Nothing here yet</h3>
            <p>Be the first to submit feedback!</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Submission
            </button>
          </div>
        ) : (
          <motion.div className="cards-grid" layout>
            <AnimatePresence>
              {filtered.map(issue => (
                <IssueCard key={issue.id} issue={issue} onVote={handleVote} onView={setSelectedIssue} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateIssueModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreated={handleIssueCreated}
          />
        )}
        
        {selectedIssue && (
          <ViewIssueModal
            isOpen={!!selectedIssue}
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
