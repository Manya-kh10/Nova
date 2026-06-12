import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Play, Pause, RotateCcw, Coffee, Target, Zap } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const DEFAULT_DURATIONS = { work: 25, short_break: 5, long_break: 15 }

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: 'Inter, Segoe UI, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { width: '100%', maxWidth: '500px', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#a78bfa' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  card: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center', marginBottom: '24px' },
  modeRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' },
  modeBtn: (active, color) => ({ padding: '8px 18px', borderRadius: '8px', border: '1px solid', borderColor: active ? color : '#1e1e2e', background: active ? `${color}22` : 'transparent', color: active ? color : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }),
  durationInput: { width: '60px', background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '6px', padding: '4px 8px', color: '#e2e8f0', fontSize: '13px', textAlign: 'center', marginBottom: '12px' },
  timer: { fontSize: '72px', fontWeight: '700', color: '#e2e8f0', fontFamily: 'monospace', letterSpacing: '4px', marginBottom: '8px' },
  timerLabel: { fontSize: '13px', color: '#64748b', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '2px' },
  controls: { display: 'flex', gap: '12px', justifyContent: 'center' },
  controlBtn: (primary) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: primary ? 'none' : '1px solid #1e1e2e', background: primary ? '#7c3aed' : 'transparent', color: primary ? '#fff' : '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }),
  projectInput: { width: '100%', maxWidth: '500px', background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '24px' },
  focusOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  focusTimer: { fontSize: '120px', fontWeight: '700', color: '#a78bfa', fontFamily: 'monospace', letterSpacing: '8px' },
  focusLabel: { fontSize: '16px', color: '#64748b', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '3px' },
  focusProject: { fontSize: '14px', color: '#3d3d5c', marginTop: '8px' },
  exitFocus: { marginTop: '40px', padding: '10px 24px', background: 'transparent', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#64748b', fontSize: '13px', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', maxWidth: '500px' },
  statCard: (color) => ({ background: '#12121a', border: `1px solid ${color}22`, borderRadius: '10px', padding: '16px', textAlign: 'center' }),
  statVal: (color) => ({ fontSize: '24px', fontWeight: '700', color }),
  statLabel: { fontSize: '11px', color: '#64748b', marginTop: '2px' },
  focusBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1px solid #a78bfa44', background: '#1e1030', color: '#a78bfa', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
}

export default function Flux() {
  const [mode, setMode] = useState('work')
  const [durations, setDurations] = useState(DEFAULT_DURATIONS)
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATIONS.work * 60)
  const [running, setRunning] = useState(false)
  const [project, setProject] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [stats, setStats] = useState({ sessions_completed: 0, total_focus_minutes: 0, total_focus_hours: 0 })
  const intervalRef = useRef(null)

  const fetchStats = async () => {
    const res = await axios.get(`${API}/flux/today`)
    setStats(res.data)
  }

  useEffect(() => { fetchStats() }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const handleComplete = async () => {
    setRunning(false)
    await axios.post(`${API}/flux/sessions`, {
      project, duration_minutes: durations[mode], type: mode, completed: true
    })
    fetchStats()
    setFocusMode(false)
    new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play().catch(() => {})
  }

  const switchMode = (m) => {
    setMode(m)
    setSecondsLeft(durations[m] * 60)
    setRunning(false)
  }

  const reset = () => {
    setSecondsLeft(durations[mode] * 60)
    setRunning(false)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const modeColors = { work: '#a78bfa', short_break: '#34d399', long_break: '#60a5fa' }
  const modeLabels = { work: 'Focus', short_break: 'Short Break', long_break: 'Long Break' }

  if (focusMode) {
    return (
      <div style={styles.focusOverlay}>
        <Target size={32} color="#a78bfa" />
        <div style={styles.focusTimer}>{formatTime(secondsLeft)}</div>
        <div style={styles.focusLabel}>{modeLabels[mode]}</div>
        {project && <div style={styles.focusProject}>Working on: {project}</div>}
        <button style={styles.exitFocus} onClick={() => setFocusMode(false)}>Exit Focus Mode</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🍅 Flux</div>
        <div style={styles.subtitle}>Pomodoro & Focus Mode · Nova</div>
      </div>

      <input
        style={styles.projectInput}
        placeholder="What are you working on? (optional)"
        value={project}
        onChange={e => setProject(e.target.value)}
      />

      <div style={styles.card}>
        <div style={styles.modeRow}>
          {Object.keys(durations).map(m => (
            <button key={m} style={styles.modeBtn(mode === m, modeColors[m])} onClick={() => switchMode(m)}>
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {!running && (
          <input
            type="number"
            min="1"
            max="180"
            value={durations[mode]}
            onChange={e => {
              const val = parseInt(e.target.value) || 1
              setDurations(prev => ({ ...prev, [mode]: val }))
              setSecondsLeft(val * 60)
            }}
            style={styles.durationInput}
          />
        )}

        <div style={styles.timer}>{formatTime(secondsLeft)}</div>
        <div style={styles.timerLabel}>{modeLabels[mode]}</div>

        <div style={styles.controls}>
          <button style={styles.controlBtn(true)} onClick={() => setRunning(!running)}>
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button style={styles.controlBtn(false)} onClick={reset}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {running && mode === 'work' && (
          <button style={styles.focusBtn} onClick={() => setFocusMode(true)}>
            <Zap size={14} /> Enter Focus Mode
          </button>
        )}
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard('#a78bfa')}>
          <div style={styles.statVal('#a78bfa')}>{stats.sessions_completed}</div>
          <div style={styles.statLabel}>Sessions Today</div>
        </div>
        <div style={styles.statCard('#34d399')}>
          <div style={styles.statVal('#34d399')}>{stats.total_focus_minutes}</div>
          <div style={styles.statLabel}>Minutes Focused</div>
        </div>
        <div style={styles.statCard('#60a5fa')}>
          <div style={styles.statVal('#60a5fa')}>{stats.total_focus_hours}</div>
          <div style={styles.statLabel}>Hours Today</div>
        </div>
      </div>
    </div>
  )
}