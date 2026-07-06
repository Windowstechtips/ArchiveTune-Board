import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, ListChecks, Users, Inbox } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import AdminTodoList from '../components/AdminTodoList'
import AdminIssueCard from '../components/AdminIssueCard'
import AdminUsersTab from '../components/AdminUsersTab'
import ViewIssueModal from '../components/ViewIssueModal'

export default function AdminDashboard() {
  const { session } = useAuth()
  const [issues, setIssues]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('feedback')
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => { fetchIssues() }, [])

  const fetchIssues = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setIssues(data || [])
    setLoading(false)
  }

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', id)
    if (!error) setIssues(issues.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this issue permanently?')) return
    const { error } = await supabase.from('issues').delete().eq('id', id)
    if (!error) setIssues(issues.filter(i => i.id !== id))
  }

  const tabs = [
    { id: 'feedback', label: 'Feedback',  icon: <ClipboardList size={15} />, count: issues.length },
    { id: 'users',    label: 'Users',     icon: <Users size={15} />,         count: null },
    { id: 'todo',     label: 'To-Do',     icon: <ListChecks size={15} />,    count: null },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
          Admin Panel
        </p>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle" style={{ marginTop: '0.375rem' }}>
          Manage community feedback, users, and internal tasks
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== null && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feedback' && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {loading ? (
              <p className="loading-text">Loading feedback…</p>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Inbox size={24} /></div>
                <h3>No feedback yet</h3>
                <p>Submissions from users will appear here</p>
              </div>
            ) : (
              <div className="cards-grid">
                {issues.map(issue => (
                  <AdminIssueCard
                    key={issue.id}
                    issue={issue}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onView={setSelectedIssue}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <AdminUsersTab />
          </motion.div>
        )}

        {activeTab === 'todo' && (
          <motion.div key="todo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <AdminTodoList session={session} />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedIssue && (
        <ViewIssueModal
          isOpen={!!selectedIssue}
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  )
}
