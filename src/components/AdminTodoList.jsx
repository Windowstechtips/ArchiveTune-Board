import { useState, useEffect } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function AdminTodoList() {
  const { session } = useAuth()
  const [todos, setTodos] = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTodos() }, [])

  const fetchTodos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('admin_todos')
      .select('*')
      .order('created_at', { ascending: false })
    setTodos(data || [])
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    const { data } = await supabase
      .from('admin_todos')
      .insert([{ title: newTask.trim(), user_id: session.user.id }])
      .select()
    if (data) { setTodos([data[0], ...todos]); setNewTask('') }
  }

  const toggleTodo = async (id, current) => {
    await supabase.from('admin_todos').update({ is_completed: !current }).eq('id', id)
    setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !current } : t))
  }

  const deleteTodo = async (id) => {
    await supabase.from('admin_todos').delete().eq('id', id)
    setTodos(todos.filter(t => t.id !== id))
  }

  const completed = todos.filter(t => t.is_completed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '560px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Internal To-Do</h2>
        <p style={{ fontSize: '0.875rem' }}>
          {todos.length === 0
            ? 'No tasks yet'
            : `${completed} of ${todos.length} completed`}
        </p>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(completed / todos.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      )}

      {/* Add task */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.625rem' }}>
        <input
          type="text"
          className="input"
          placeholder="Add a new task…"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={16} />
          Add
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="loading-text">Loading tasks…</p>
      ) : todos.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem' }}>
          <div className="empty-state-icon"><Plus size={22} /></div>
          <p>Add your first task above</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {todos.map(todo => (
            <li key={todo.id} className="todo-item">
              <button
                className={`todo-check ${todo.is_completed ? 'checked' : ''}`}
                onClick={() => toggleTodo(todo.id, todo.is_completed)}
              >
                {todo.is_completed && <Check size={12} color="#fff" strokeWidth={3} />}
              </button>

              <span
                className={`todo-text ${todo.is_completed ? 'done' : ''}`}
                onClick={() => toggleTodo(todo.id, todo.is_completed)}
              >
                {todo.title}
              </span>

              <button
                className="btn btn-danger btn-icon"
                onClick={() => deleteTodo(todo.id)}
                style={{ flexShrink: 0, fontSize: '0.75rem', padding: '0.375rem' }}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
