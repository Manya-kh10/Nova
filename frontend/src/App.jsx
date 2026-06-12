import { useState } from 'react'
import Chat from './pages/Chat'
import Forge from './pages/Forge'
import Stack from './pages/Stack'
import Orbit from './pages/Orbit'
import Pulse from './pages/Pulse'
import Flux from './pages/Flux'
import './index.css'

const styles = {
  app: { display: 'flex', height: '100vh', background: '#0a0a0f' },
  sidebar: { width: '56px', background: '#0d0d14', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', gap: '8px' },
  navBtn: (active) => ({ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: active ? '#1e1030' : 'transparent', color: active ? '#a78bfa' : '#3d3d5c', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  content: { flex: 1, overflow: 'auto' }
}

export default function App() {
  const [page, setPage] = useState('chat')

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <button style={styles.navBtn(page === 'chat')} onClick={() => setPage('chat')} title="Nova Chat">✦</button>
        <button style={styles.navBtn(page === 'stack')} onClick={() => setPage('stack')} title="Stack">✅</button>
        <button style={styles.navBtn(page === 'orbit')} onClick={() => setPage('orbit')} title="Orbit">🗂</button>
        <button style={styles.navBtn(page === 'pulse')} onClick={() => setPage('pulse')} title="Pulse">📬</button>
        <button style={styles.navBtn(page === 'flux')} onClick={() => setPage('flux')} title="Flux">🍅</button>
        <button style={styles.navBtn(page === 'forge')} onClick={() => setPage('forge')} title="Forge">⚡</button>
      </div>
      <div style={styles.content}>
        {page === 'chat' && <Chat />}
        {page === 'stack' && <Stack />}
        {page === 'orbit' && <Orbit />}
        {page === 'pulse' && <Pulse />}
        {page === 'flux' && <Flux />}
        {page === 'forge' && <Forge />}
      </div>
    </div>
  )
}