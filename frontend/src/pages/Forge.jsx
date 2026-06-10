import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Zap, Clock, Activity, Thermometer, Play, Loader } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const MODELS = ['llama3.2:latest', 'qwen2.5-coder:7b']
const TEMPS = [0.0, 0.5, 1.0]

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: 'Inter, Segoe UI, sans-serif' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#a78bfa', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  card: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' },
  cardTitle: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
  label: { fontSize: '13px', color: '#94a3b8', marginBottom: '8px' },
  input: { width: '100%', background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px' },
  select: { background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer' },
  tempBtn: (active) => ({ padding: '6px 14px', borderRadius: '6px', border: '1px solid', borderColor: active ? '#a78bfa' : '#1e1e2e', background: active ? '#1e1030' : 'transparent', color: active ? '#a78bfa' : '#64748b', cursor: 'pointer', fontSize: '13px' }),
  runBtn: (loading) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', border: 'none', background: loading ? '#1e1030' : '#7c3aed', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }),
  statCard: (color) => ({ background: '#12121a', border: `1px solid ${color}22`, borderRadius: '12px', padding: '20px' }),
  statValue: (color) => ({ fontSize: '28px', fontWeight: '700', color, marginBottom: '4px' }),
  statLabel: { fontSize: '12px', color: '#64748b' },
  resultCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '12px' },
  badge: (color) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: '999px', background: `${color}22`, color, fontSize: '12px', fontWeight: '600' }),
  responseBox: { background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#94a3b8', marginTop: '12px', lineHeight: '1.6', maxHeight: '120px', overflowY: 'auto' },
  error: { color: '#f87171', fontSize: '13px', marginTop: '8px' },
  divider: { height: '1px', background: '#1e1e2e', margin: '24px 0' },
  fullCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
}

export default function Forge() {
  const [mode, setMode] = useState('compare')
  const [prompt, setPrompt] = useState('Explain what a binary search tree is in simple terms.')
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [selectedTemp, setSelectedTemp] = useState(0.7)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runBenchmark = async () => {
    setLoading(true)
    setError('')
    setResults([])
    try {
      if (mode === 'compare') {
        const res = await axios.post(`${API}/forge/benchmark/compare`, { prompt, temperature: selectedTemp })
        setResults(res.data.results)
      } else if (mode === 'single') {
        const res = await axios.post(`${API}/forge/benchmark/single`, { model: selectedModel, prompt, temperature: selectedTemp })
        setResults([res.data.result])
      } else {
        const res = await axios.get(`${API}/forge/benchmark/full`)
        setResults(res.data.results)
      }
    } catch (e) {
      setError('Backend error — make sure Nova backend is running on port 8000')
    }
    setLoading(false)
  }

  const chartData = results
    .filter(r => r.status === 'success')
    .map(r => ({
      name: `${r.model.split(':')[0]} t=${r.temperature}`,
      'Tokens/sec': r.tokens_per_second,
      'Latency (s)': r.total_latency_sec,
      'First Token (s)': r.time_to_first_token_sec,
    }))

  const avgTps = results.length ? (results.reduce((a, b) => a + (b.tokens_per_second || 0), 0) / results.length).toFixed(1) : '--'
  const avgLatency = results.length ? (results.reduce((a, b) => a + (b.total_latency_sec || 0), 0) / results.length).toFixed(2) : '--'
  const avgFirstToken = results.length ? (results.reduce((a, b) => a + (b.time_to_first_token_sec || 0), 0) / results.length).toFixed(2) : '--'

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>⚡ Forge</div>
        <div style={styles.subtitle}>LLM Benchmarking & Observability — Nova</div>
      </div>

      {/* Config */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}><Zap size={12} /> Mode</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['compare', 'single', 'full'].map(m => (
              <button key={m} style={styles.tempBtn(mode === m)} onClick={() => setMode(m)}>
                {m === 'compare' ? 'Model Comparison' : m === 'single' ? 'Single Run' : 'Full Benchmark'}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}><Thermometer size={12} /> Temperature</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {TEMPS.map(t => (
              <button key={t} style={styles.tempBtn(selectedTemp === t)} onClick={() => setSelectedTemp(t)}>{t}</button>
            ))}
            <input
              type="number" min="0" max="2" step="0.1"
              value={selectedTemp}
              onChange={e => setSelectedTemp(parseFloat(e.target.value))}
              style={{ ...styles.select, width: '70px' }}
            />
          </div>
        </div>
      </div>

      <div style={styles.fullCard}>
        <div style={styles.cardTitle}><Activity size={12} /> Prompt</div>
        <textarea
          style={styles.input}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter your benchmark prompt..."
        />
        {mode === 'single' && (
          <div style={{ marginTop: '12px' }}>
            <div style={styles.label}>Model</div>
            <select style={styles.select} value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={styles.runBtn(loading)} onClick={runBenchmark} disabled={loading}>
            {loading ? <Loader size={16} /> : <Play size={16} />}
            {loading ? 'Running...' : 'Run Benchmark'}
          </button>
          {error && <span style={styles.error}>{error}</span>}
        </div>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={styles.statCard('#a78bfa')}>
              <div style={styles.statValue('#a78bfa')}>{avgTps}</div>
              <div style={styles.statLabel}>Avg Tokens / Second</div>
            </div>
            <div style={styles.statCard('#34d399')}>
              <div style={styles.statValue('#34d399')}>{avgLatency}s</div>
              <div style={styles.statLabel}>Avg Total Latency</div>
            </div>
            <div style={styles.statCard('#60a5fa')}>
              <div style={styles.statValue('#60a5fa')}>{avgFirstToken}s</div>
              <div style={styles.statLabel}>Avg Time to First Token</div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div style={{ ...styles.fullCard, marginBottom: '24px' }}>
              <div style={styles.cardTitle}><BarChart size={12} /> Performance Chart</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '16px' }} />
                  <Bar dataKey="Tokens/sec" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Latency (s)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="First Token (s)" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Results */}
          <div style={styles.cardTitle}><Clock size={12} /> Raw Results</div>
          {results.map((r, i) => (
            <div key={i} style={styles.resultCard}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={styles.badge('#a78bfa')}>{r.model}</span>
                <span style={styles.badge('#60a5fa')}>temp={r.temperature}</span>
                <span style={styles.badge(r.status === 'success' ? '#34d399' : '#f87171')}>{r.status}</span>
                {r.status === 'success' && <>
                  <span style={styles.badge('#f59e0b')}>{r.tokens_per_second} tok/s</span>
                  <span style={styles.badge('#94a3b8')}>{r.total_latency_sec}s latency</span>
                  <span style={styles.badge('#818cf8')}>{r.time_to_first_token_sec}s first token</span>
                </>}
              </div>
              <div style={styles.responseBox}>{r.response || 'No response'}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}