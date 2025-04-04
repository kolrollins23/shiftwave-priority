import { useState } from 'react'
import Dashboard from './Dashboard'

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [input, setInput] = useState('')

  const handleLogin = () => {
    if (input === 'shiftwave') {
      setIsAuthorized(true)
    } else {
      alert('Incorrect password')
    }
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h2>🔐 Shiftwave Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🛠 Shiftwave Admin Dashboard</h1>
      <Dashboard />
    </div>
  )
}
