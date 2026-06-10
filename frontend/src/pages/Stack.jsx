import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_COLORS = { low: '#34d399', medium: '#f59e0b', high: '#f87171' }
const PRIORITY_ICONS = { low: Circle, medium: Clock, high: AlertCircle }

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: 'Inter, Segoe UI, sans-serif' },
  header: { marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '24px', fontWeight: '700', color: '#a78bfa' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  addCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' },
  input: { flex: 1, minWidth: '200px', background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none' },
  select: { background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 12px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: (active) => ({ padding: '6px 14px', borderRadius: '6px', border: '1px solid', borderColor: active ? '#a78bfa' : '#1e1e2e', background: active ? '#1e1030' : 'transparent', color: active ? '#a78bfa' : '#64748b', cursor: 'pointer', fontSize: '13px' }),
  taskCard: (done) => ({ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px', marginBottom: '10px', opacity: done ? 0.5 : 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }),
  taskTitle: (done) => ({ fontSize: '14px', fontWeight: '600', color: done ? '#64748b' : '#e2e8f0', textDecoration: done ? 'line-through' : 'none' }),
  taskMeta: { fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' },
  badge: (color) => ({ padding: '2px 8px', borderRadius: '999px', background: `${color}22`, color, fontSize: '11px', fontWeight: '600' }),
  doneBtn: (done) => ({ background: 'none', border: 'none', cursor: 'pointer', color: done ? '#34d399' : '#3d3d5c', padding: '0', flexShrink: 0, marginTop: '2px' }),
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#3d3d5c', padding: '0', marginLeft: 'auto', flexShrink: 0 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: (color) => ({ background: '#12121a', border: `1px solid ${color}22`, borderRadius: '10px', padding: '16px' }),
  statVal: (color) => ({ fontSize: '24px', fontWeight: '700', color }),
  statLabel: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  empty: { textAlign: 'center', color: '#3d3d5c', padding: '40px', fontSize: '14px' }
}

export default function Stack() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', project: '', priority: 'medium', due_date: '' })

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/stack/tasks`)
    setTasks(res.data.tasks)
  }

  useEffect(() => { fetchTasks() }, [])

  const addTask = async () => {
    if (!form.title.trim()) return
    await axios.post(`${API}/stack/tasks`, form)
    setForm({ title: '', description: '', project: '', priority: 'medium', due_date: '' })
    fetchTasks()
  }

  const toggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await axios.patch(`${API}/stack/tasks/${task.id}`, { status: newStatus })
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API}/stack/tasks/${id}`)
    fetchTasks()
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const pending = tasks.filter(t => t.status === 'todo').length

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>✅ Stack</div>
          <div style={styles.subtitle}>Tasks & To-Do Management · Nova</div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard('#a78bfa')}>
          <div style={styles.statVal('#a78bfa')}>{total}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={styles.statCard('#34d399')}>
          <div style={styles.statVal('#34d399')}>{done}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard('#f59e0b')}>
          <div style={styles.statVal('#f59e0b')}>{pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>

      {/* Add Task */}
      <div style={styles.addCard}>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Task title..."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <select style={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Project (optional)"
            value={form.project}
            onChange={e => setForm({ ...form, project: e.target.value })}
          />
          <input
            style={{ ...styles.input, flex: 'none', width: '160px' }}
            type="date"
            value={form.due_date}
            onChange={e => setForm({ ...form, due_date: e.target.value })}
          />
          <button style={styles.addBtn} onClick={addTask}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {['all', 'todo', 'done'].map(f => (
          <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'todo' ? 'Pending' : 'Completed'}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>No tasks here — add one above</div>
      ) : (
        filtered.map(task => {
          const PIcon = PRIORITY_ICONS[task.priority] || Circle
          const done = task.status === 'done'
          return (
            <div key={task.id} style={styles.taskCard(done)}>
              <button style={styles.doneBtn(done)} onClick={() => toggleDone(task)}>
                {done ? <CheckCircle size={18} /> : <Circle size={18} />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={styles.taskTitle(done)}>{task.title}</div>
                <div style={styles.taskMeta}>
                  {task.project && <span style={styles.badge('#60a5fa')}>{task.project}</span>}
                  <span style={styles.badge(PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                  {task.due_date && <span style={{ color: '#64748b' }}>due {task.due_date}</span>}
                </div>
              </div>
              <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}