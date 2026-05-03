import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { apiClient } from '../api/client'

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <PageShell>
        <Alert severity='error' sx={{ mb: 2 }}>
          Invalid link — no token found.
        </Alert>
        <Button component={Link} to='/login' variant='outlined' fullWidth>
          Go to login
        </Button>
      </PageShell>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/auth/set-password', { token, password })
      setDone(true)
    } catch (err: any) {
      const code = err?.response?.data?.error
      if (
        err?.response?.status === 410 ||
        code === 'TOKEN_INVALID_OR_EXPIRED'
      ) {
        setError(
          'This link has expired or was already used. Ask your admin to resend the invite.'
        )
      } else if (code) {
        setError(code)
      } else {
        setError('Could not connect to the server. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <PageShell>
        <Alert severity='success' sx={{ mb: 3 }}>
          Password set successfully!
        </Alert>
        <Typography variant='body2' color='text.secondary' mb={3}>
          You can now log in with your new password.
        </Typography>
        <Button
          component={Link}
          to='/login'
          variant='contained'
          fullWidth
          size='large'
        >
          Go to login
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Typography variant='h5' mb={0.5}>
        Set your password
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Choose a strong password to activate your account.
      </Typography>

      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label='New password'
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete='new-password'
          required
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge='end'
                    size='small'
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
          helperText='Min 8 chars, uppercase, lowercase, number and special character'
        />

        <TextField
          label='Confirm password'
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete='new-password'
          required
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowConfirm((s) => !s)}
                    edge='end'
                    size='small'
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        {error && <Alert severity='error'>{error}</Alert>}

        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Setting password…' : 'Set password'}
        </Button>
      </Box>
    </PageShell>
  )
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant='h6' color='primary.main' fontWeight={700}>
              GymApp
            </Typography>
          </Box>
          {children}
        </CardContent>
      </Card>
    </Box>
  )
}
