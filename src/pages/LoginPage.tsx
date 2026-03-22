import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      navigate(from, { replace: true })
    } catch (err: any) {
      const code = err?.response?.data?.error
      if (code === 'INVALID_CREDENTIALS') {
        setError('Incorrect email or password')
      } else if (code) {
        setError(code)
      } else {
        setError('Could not connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete='email'
              required
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              required
              style={styles.input}
            />
          </label>
          {error && <p style={styles.error}>{error}</p>}
          <button type='submit' disabled={loading} style={styles.button}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5'
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '40px 48px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 24,
    margin: '0 0 24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 14
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 16,
    outline: 'none'
  },
  error: {
    color: '#c0392b',
    fontSize: 14,
    margin: 0
  },
  button: {
    marginTop: 8,
    padding: '12px 0',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer'
  }
}
