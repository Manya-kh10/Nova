import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Upload, Trash2, FileText, Loader, ChevronDown, ChevronUp } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: 'Inter, Segoe UI, sans-serif' },
  header: { marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#a78bfa' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  uploadCard: { background: '#12121a', border: '2px dashed #1e1e2e', borderRadius: '12px', padding: '40px', textAlign: 'center', marginBottom: '24px', cursor: 'pointer', transition: 'border-color 0.2s' },
  uploadIcon: { color: '#3d3d5c', marginBottom: '12px' },
  uploadText: { fontSize: '14px', color: '#64748b', marginBottom: '8px' },
  uploadHint: { fontSize: '12px', color: '#3d3d5c' },
  fileInput: { display: 'none' },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  loadingCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' },
  loadingText: { fontSize: '14px', color: '#64748b', marginTop: '12px' },
  summaryCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '20px', marginBottom: '12px' },
  summaryHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  summaryFilename: { fontSize: '14px', fontWeight: '700', color: '#e2e8f0', flex: 1 },
  summaryDate: { fontSize: '11px', color: '#3d3d5c' },
  summaryText: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  badge: (color) => ({ padding: '2px 8px', borderRadius: '999px', background: `${color}22`, color, fontSize: '11px', fontWeight: '600' }),
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#3d3d5c', padding: '0' },
  toggleBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0' },
  empty: { textAlign: 'center', color: '#3d3d5c', padding: '40px', fontSize: '14px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' },
}

const FILE_COLORS = { pdf: '#f87171', txt: '#34d399', md: '#60a5fa', docx: '#a78bfa' }

export default function Vault() {
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const fetchSummaries = async () => {
    const res = await axios.get(`${API}/vault/summaries`)
    setSummaries(res.data.summaries)
  }

  useEffect(() => { fetchSummaries() }, [])

  const handleFile = async (file) => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await axios.post(`${API}/vault/summarize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchSummaries()
    } catch {
      alert('Error summarizing file — make sure backend is running')
    }
    setLoading(false)
  }

  const deleteSummary = async (id) => {
    await axios.delete(`${API}/vault/summaries/${id}`)
    fetchSummaries()
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getExt = (filename) => filename?.split('.').pop()?.toLowerCase() || 'txt'

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>📁 Vault</div>
        <div style={styles.subtitle}>File Summarizer · Powered by local LLM · Nova</div>
      </div>

      <div
        style={{ ...styles.uploadCard, borderColor: dragOver ? '#a78bfa' : '#1e1e2e' }}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <Upload size={32} style={styles.uploadIcon} />
        <div style={styles.uploadText}>Drop a file here or click to upload</div>
        <div style={styles.uploadHint}>Supports .txt · .md · .pdf · .docx</div>
        <input
          ref={fileRef}
          type="file"
          style={styles.fileInput}
          accept=".txt,.md,.pdf,.docx"
          onChange={e => handleFile(e.target.files[0])}
        />
        <button style={styles.uploadBtn} onClick={e => { e.stopPropagation(); fileRef.current.click() }}>
          <Upload size={14} /> Choose File
        </button>
      </div>

      {loading && (
        <div style={styles.loadingCard}>
          <Loader size={24} color="#a78bfa" />
          <div style={styles.loadingText}>Nova is reading and summarizing your document...</div>
        </div>
      )}

      {summaries.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Past Summaries ({summaries.length})</div>
          {summaries.map(s => {
            const ext = getExt(s.filename)
            const color = FILE_COLORS[ext] || '#64748b'
            const isExpanded = expanded[s.id]
            return (
              <div key={s.id} style={styles.summaryCard}>
                <div style={styles.summaryHeader}>
                  <FileText size={16} color={color} />
                  <div style={styles.summaryFilename}>{s.filename}</div>
                  <span style={styles.badge(color)}>.{ext}</span>
                  <div style={styles.summaryDate}>{s.created_at?.slice(0, 10)}</div>
                  <button style={styles.toggleBtn} onClick={() => toggleExpand(s.id)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button style={styles.deleteBtn} onClick={() => deleteSummary(s.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {isExpanded && (
                  <div style={styles.summaryText}>{s.summary}</div>
                )}
                {!isExpanded && (
                  <div style={{ ...styles.summaryText, color: '#3d3d5c' }}>{s.summary?.slice(0, 120)}...</div>
                )}
              </div>
            )
          })}
        </>
      )}

      {!loading && summaries.length === 0 && (
        <div style={styles.empty}>
          <FileText size={40} color="#2d2d3d" style={{ margin: '0 auto 12px', display: 'block' }} />
          No summaries yet — upload a document to get started
        </div>
      )}
    </div>
  )
}