import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Trash2, Bot, User, Loader } from 'lucide-react'

const API = 'http://127.0.0.1:8000'

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0f', fontFamily: 'Inter, Segoe UI, sans-serif' },
  header: { padding: '16px 24px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', fontWeight: '700', color: '#a78bfa' },
  subtitle: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'transparent', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#64748b', fontSize: '13px', cursor: 'pointer' },
  messages: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  messageBubble: (role) => ({
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    flexDirection: role === 'user' ? 'row-reverse' : 'row'
  }),
  avatar: (role) => ({
    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
    background: role === 'user' ? '#1e1030' : '#0f2027',
    border: `1px solid ${role === 'user' ? '#a78bfa' : '#34d399'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }),
  bubble: (role) => ({
    maxWidth: '70%', padding: '12px 16px', borderRadius: '12px',
    background: role === 'user' ? '#1e1030' : '#12121a',
    border: `1px solid ${role === 'user' ? '#a78bfa33' : '#1e1e2e'}`,
    fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0',
    whiteSpace: 'pre-wrap'
  }),
  inputArea: { padding: '16px 24px', borderTop: '1px solid #1e1e2e' },
  inputRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  textarea: { flex: 1, background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', minHeight: '48px', maxHeight: '160px', fontFamily: 'inherit', lineHeight: '1.5' },
  sendBtn: (loading) => ({ width: '44px', height: '44px', borderRadius: '10px', border: 'none', background: loading ? '#1e1030' : '#7c3aed', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2d2d3d' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#3d3d5c', marginTop: '16px' },
  emptySubtitle: { fontSize: '13px', color: '#2d2d3d', marginTop: '6px' },
  modelBadge: { fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'right' }
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await axios.post(`${API}/chat`, { message: userMsg })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error — make sure Nova backend is running.' }])
    }
    setLoading(false)
  }

  const clearChat = async () => {
    await axios.delete(`${API}/chat/history`)
    setMessages([])
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>✦ Nova</div>
          <div style={styles.subtitle}>Personal AI Assistant · llama3.2 · local</div>
        </div>
        <button style={styles.clearBtn} onClick={clearChat}>
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {messages.length === 0 ? (
        <div style={styles.empty}>
          <Bot size={48} color="#2d2d3d" />
          <div style={styles.emptyTitle}>Nova is ready</div>
          <div style={styles.emptySubtitle}>Running locally on llama3.2 · Ask me anything</div>
        </div>
      ) : (
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={styles.messageBubble(msg.role)}>
              <div style={styles.avatar(msg.role)}>
                {msg.role === 'user' ? <User size={14} color="#a78bfa" /> : <Bot size={14} color="#34d399" />}
              </div>
              <div style={styles.bubble(msg.role)}>{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div style={styles.messageBubble('assistant')}>
              <div style={styles.avatar('assistant')}><Bot size={14} color="#34d399" /></div>
              <div style={styles.bubble('assistant')}>
                <Loader size={14} color="#64748b" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <textarea
            style={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Nova anything... (Enter to send, Shift+Enter for new line)"
            rows={1}
          />
          <button style={styles.sendBtn(loading)} onClick={sendMessage} disabled={loading}>
            {loading ? <Loader size={16} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}