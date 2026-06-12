import { useState } from 'react'
import axios from 'axios'
import { Mail, Star, RefreshCw, Loader } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const CATEGORIES = [
  { key: 'jobs', label: '💼 Jobs/Internships', color: '#34d399' },
  { key: 'hackathons', label: '🏆 Hackathons', color: '#f59e0b' },
  { key: 'college', label: '🎓 College (VIT)', color: '#60a5fa' },
  { key: 'others', label: '📩 Others', color: '#64748b' },
]

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', padding: '32px', fontFamily: 'Inter, Segoe UI, sans-serif' },
  header: { marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '24px', fontWeight: '700', color: '#a78bfa' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  fetchBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: (color) => ({ background: '#12121a', border: `1px solid ${color}22`, borderRadius: '10px', padding: '16px' }),
  statVal: (color) => ({ fontSize: '24px', fontWeight: '700', color }),
  statLabel: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  emailCard: { background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px', marginBottom: '10px' },
  emailHeader: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' },
  emailFrom: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0', flex: 1 },
  emailDate: { fontSize: '11px', color: '#3d3d5c', flexShrink: 0 },
  emailSubject: { fontSize: '14px', fontWeight: '700', color: '#a78bfa', marginBottom: '6px' },
  emailSnippet: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
  empty: { textAlign: 'center', color: '#3d3d5c', padding: '60px', fontSize: '14px' },
  sectionTitle: (color) => ({ fontSize: '15px', fontWeight: '700', color, margin: '24px 0 12px' }),
}

export default function Pulse() {
  const [categories, setCategories] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/pulse/unread`)
      setCategories(res.data)
    } catch {
      setCategories(null)
    }
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return dateStr }
  }

  const formatFrom = (from) => {
    const match = from.match(/^(.*?)\s*</)
    return match ? match[1].trim().replace(/"/g, '') : from
  }

  const total = categories ? Object.values(categories).reduce((a, b) => a + b.length, 0) : 0

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>📬 Pulse</div>
          <div style={styles.subtitle}>Gmail Agent · Categorized Inbox · Nova</div>
        </div>
        <button style={styles.fetchBtn} onClick={fetchEmails} disabled={loading}>
          {loading ? <Loader size={15} /> : <RefreshCw size={15} />}
          {loading ? 'Fetching...' : 'Fetch Emails'}
        </button>
      </div>

      {!categories ? (
        <div style={styles.empty}>
          <Mail size={40} color="#2d2d3d" style={{ margin: '0 auto 12px', display: 'block' }} />
          Click "Fetch Emails" to load and categorize your inbox
        </div>
      ) : (
        <>
          <div style={styles.stats}>
            <div style={styles.statCard('#a78bfa')}>
              <div style={styles.statVal('#a78bfa')}>{total}</div>
              <div style={styles.statLabel}>Total Unread</div>
            </div>
            {CATEGORIES.slice(0, 3).map(c => (
              <div key={c.key} style={styles.statCard(c.color)}>
                <div style={styles.statVal(c.color)}>{categories[c.key]?.length || 0}</div>
                <div style={styles.statLabel}>{c.label}</div>
              </div>
            ))}
          </div>

          {CATEGORIES.map(c => (
            categories[c.key]?.length > 0 && (
              <div key={c.key}>
                <div style={styles.sectionTitle(c.color)}>{c.label} ({categories[c.key].length})</div>
                {categories[c.key].map((email, i) => (
                  <div key={i} style={styles.emailCard}>
                    <div style={styles.emailHeader}>
                      <div style={styles.emailFrom}>{formatFrom(email.from)}</div>
                      <div style={styles.emailDate}>{formatDate(email.date)}</div>
                    </div>
                    <div style={styles.emailSubject}>{email.subject || '(no subject)'}</div>
                    <div style={styles.emailSnippet}>{email.snippet}</div>
                  </div>
                ))}
              </div>
            )
          ))}
        </>
      )}
    </div>
  )
}