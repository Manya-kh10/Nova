import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, FolderOpen, GitBranch, Star } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const STATUS_COLORS = { active: '#34d399', paused: '#f59e0b', done: '#a78bfa' }
const STACK_COLORS = { Python: '#60a5fa', JavaScript: '#f59e0b', Unknown: '#64748b' }

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: 'Inter, Segoe UI, sans-serif' },
  header: { marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#a78bfa' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: (active) => ({ padding: '8px 18px', borderRadius: '8px', border: '1px solid', borderColor: active ? '#a78bfa' : '#1e1e2e', background: active ? '#1e1030' : 'transparent', color: active ? '#a78bfa' : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '600' : '400' }),
  card: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '12px' },
  addCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' },
  input: { flex: 1, minWidth: '180px', background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  scanBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'transparent', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' },
  badge: (color) => ({ padding: '2px 8px', borderRadius: '999px', background: `${color}22`, color, fontSize: '11px', fontWeight: '600' }),
  projectCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px', marginBottom: '10px' },
  projectName: { fontSize: '15px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' },
  projectMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' },
  projectPath: { fontSize: '11px', color: '#3d3d5c', fontFamily: 'monospace', marginTop: '4px' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
  actionBtn: (color) => ({ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', border: `1px solid ${color}33`, background: 'transparent', color, fontSize: '12px', cursor: 'pointer' }),
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#3d3d5c', marginLeft: 'auto' },
  ghCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px', marginBottom: '10px' },
  ghName: { fontSize: '14px', fontWeight: '700', color: '#a78bfa', marginBottom: '4px' },
  ghDesc: { fontSize: '13px', color: '#64748b', marginBottom: '8px' },
  ghMeta: { display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' },
  commitsBox: { background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '12px', marginTop: '10px' },
  commitLine: { fontSize: '12px', color: '#64748b', fontFamily: 'monospace', marginBottom: '4px' },
  ghInput: { display: 'flex', gap: '10px', marginBottom: '20px' },
  empty: { textAlign: 'center', color: '#3d3d5c', padding: '40px', fontSize: '14px' },
  select: { background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 12px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer' },
}

export default function Orbit() {
  const [tab, setTab] = useState('projects')
  const [projects, setProjects] = useState([])
  const [ghRepos, setGhRepos] = useState([])
  const [ghUsername, setGhUsername] = useState('Manya-kh10')
  const [commits, setCommits] = useState({})
  const [scanPath, setScanPath] = useState('E:\\')
  const [scanned, setScanned] = useState([])
  const [form, setForm] = useState({ name: '', path: '', description: '', stack: '', github_repo: '' })

  const fetchProjects = async () => {
    const res = await axios.get(`${API}/orbit/projects`)
    setProjects(res.data.projects)
  }

  useEffect(() => { fetchProjects() }, [])

  const addProject = async () => {
    if (!form.name.trim()) return
    await axios.post(`${API}/orbit/projects`, form)
    setForm({ name: '', path: '', description: '', stack: '', github_repo: '' })
    fetchProjects()
  }

  const deleteProject = async (id) => {
    await axios.delete(`${API}/orbit/projects/${id}`)
    fetchProjects()
  }

  const updateStatus = async (id, status) => {
    await axios.patch(`${API}/orbit/projects/${id}`, { status })
    fetchProjects()
  }

  const loadCommits = async (project) => {
    if (commits[project.id]) {
      setCommits(prev => { const n = { ...prev }; delete n[project.id]; return n })
      return
    }
    const res = await axios.get(`${API}/orbit/git/${project.id}`)
    setCommits(prev => ({ ...prev, [project.id]: res.data.commits }))
  }

  const fetchGithub = async () => {
    const res = await axios.get(`${API}/orbit/github/${ghUsername}`)
    setGhRepos(res.data.repos)
  }

  const scanFolder = async () => {
    const res = await axios.get(`${API}/orbit/scan?path=${encodeURIComponent(scanPath)}`)
    setScanned(res.data.projects)
  }

  const importScanned = async (p) => {
    await axios.post(`${API}/orbit/projects`, {
      name: p.name, path: p.path, description: '', stack: p.stack, github_repo: ''
    })
    fetchProjects()
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🗂 Orbit</div>
        <div style={styles.subtitle}>Projects & GitHub · Nova</div>
      </div>

      <div style={styles.tabs}>
        {['projects', 'github', 'scan'].map(t => (
          <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'projects' ? '📁 My Projects' : t === 'github' ? '🐙 GitHub' : '🔍 Scan Folders'}
          </button>
        ))}
      </div>

      {/* PROJECTS TAB */}
      {tab === 'projects' && (
        <>
          <div style={styles.addCard}>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Project name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input style={styles.input} placeholder="Local path (optional)" value={form.path} onChange={e => setForm({ ...form, path: e.target.value })} />
            </div>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={styles.input} placeholder="Stack (Python, React...)" value={form.stack} onChange={e => setForm({ ...form, stack: e.target.value })} />
              <button style={styles.addBtn} onClick={addProject}><Plus size={15} /> Add</button>
            </div>
          </div>

          {projects.length === 0 ? <div style={styles.empty}>No projects yet — add one or scan a folder</div> : (
            projects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.projectName}>{p.name}</div>
                    <div style={styles.projectMeta}>
                      <span style={styles.badge(STATUS_COLORS[p.status] || '#64748b')}>{p.status}</span>
                      {p.stack && <span style={styles.badge(STACK_COLORS[p.stack] || '#64748b')}>{p.stack}</span>}
                      {p.last_active && <span style={{ fontSize: '12px', color: '#3d3d5c' }}>last active {p.last_active}</span>}
                    </div>
                    {p.description && <div style={{ fontSize: '13px', color: '#64748b' }}>{p.description}</div>}
                    {p.path && <div style={styles.projectPath}>{p.path}</div>}
                  </div>
                  <button style={styles.deleteBtn} onClick={() => deleteProject(p.id)}><Trash2 size={14} /></button>
                </div>
                <div style={styles.actionRow}>
                  {['active', 'paused', 'done'].map(s => (
                    <button key={s} style={styles.actionBtn(STATUS_COLORS[s])} onClick={() => updateStatus(p.id, s)}>{s}</button>
                  ))}
                  {p.path && (
                    <button style={styles.actionBtn('#60a5fa')} onClick={() => loadCommits(p)}>
                      <GitBranch size={12} /> {commits[p.id] ? 'hide commits' : 'git log'}
                    </button>
                  )}
                </div>
                {commits[p.id] && (
                  <div style={styles.commitsBox}>
                    {commits[p.id].length === 0 ? <div style={styles.commitLine}>No commits found</div> :
                      commits[p.id].map((c, i) => <div key={i} style={styles.commitLine}>{c}</div>)}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* GITHUB TAB */}
      {tab === 'github' && (
        <>
          <div style={styles.ghInput}>
            <input style={styles.input} placeholder="GitHub username" value={ghUsername} onChange={e => setGhUsername(e.target.value)} />
            <button style={styles.addBtn} onClick={fetchGithub}>Fetch Repos</button>
          </div>
          {ghRepos.length === 0 ? <div style={styles.empty}>Enter a username and fetch repos</div> : (
            ghRepos.map((r, i) => (
              <div key={i} style={styles.ghCard}>
                <div style={styles.ghName}>{r.name}</div>
                {r.description && <div style={styles.ghDesc}>{r.description}</div>}
                <div style={styles.ghMeta}>
                  {r.language && <span style={styles.badge(STACK_COLORS[r.language] || '#64748b')}>{r.language}</span>}
                  <span>⭐ {r.stars}</span>
                  <span>🐛 {r.open_issues} issues</span>
                  <span>updated {r.updated_at}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* SCAN TAB */}
      {tab === 'scan' && (
        <>
          <div style={styles.ghInput}>
            <input style={styles.input} placeholder="Folder path to scan" value={scanPath} onChange={e => setScanPath(e.target.value)} />
            <button style={styles.addBtn} onClick={scanFolder}><FolderOpen size={15} /> Scan</button>
          </div>
          {scanned.length === 0 ? <div style={styles.empty}>Enter a folder path and scan for projects</div> : (
            scanned.map((p, i) => (
              <div key={i} style={styles.projectCard}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.projectName}>{p.name}</div>
                    <div style={styles.projectMeta}>
                      <span style={styles.badge(STACK_COLORS[p.stack] || '#64748b')}>{p.stack}</span>
                      {p.is_git && <span style={styles.badge('#34d399')}>git</span>}
                      <span style={{ fontSize: '12px', color: '#3d3d5c' }}>{p.last_modified}</span>
                    </div>
                    <div style={styles.projectPath}>{p.path}</div>
                  </div>
                  <button style={styles.addBtn} onClick={() => importScanned(p)}><Plus size={13} /> Import</button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}