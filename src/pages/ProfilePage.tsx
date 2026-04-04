import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  Divider,
  Skeleton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import { useUsers } from '../data/users'
import { useAuth } from '../hooks/useAuth'

type Role = 'member' | 'trainer' | 'admin'

const ROLE_COLOR: Record<Role, 'default' | 'primary' | 'secondary'> = {
  member:  'default',
  trainer: 'primary',
  admin:   'secondary',
}

interface UserProfile {
  name: string
  email: string
  phone?: string
  role: Role
  gymId: number
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { getMe, update } = useUsers()

  const profile = getMe.data as UserProfile | undefined

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, phone: profile.phone ?? '' })
    }
  }, [profile])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    try {
      await update.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
      })
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to update profile. Please try again.')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, phone: profile.phone ?? '' })
    }
    setEditing(false)
    setError('')
  }

  const initials = (authUser?.name ?? profile?.name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Box maxWidth={600}>
      <Typography variant='h5' mb={3}>Profile</Typography>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Avatar + role */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 22, fontWeight: 700 }}>
              {getMe.isLoading ? '?' : initials}
            </Avatar>
            <Box>
              {getMe.isLoading ? (
                <>
                  <Skeleton width={140} height={24} />
                  <Skeleton width={80} height={20} sx={{ mt: 0.5 }} />
                </>
              ) : (
                <>
                  <Typography variant='subtitle1'>{profile?.name}</Typography>
                  {profile?.role && (
                    <Chip
                      label={profile.role}
                      size='small'
                      color={ROLE_COLOR[profile.role]}
                      sx={{ textTransform: 'capitalize', mt: 0.5 }}
                    />
                  )}
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Feedback */}
          {success && <Alert severity='success' sx={{ mb: 2 }}>Profile updated successfully.</Alert>}
          {error   && <Alert severity='error'   sx={{ mb: 2 }}>{error}</Alert>}

          {/* Form */}
          {getMe.isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={56} />)}
            </Box>
          ) : (
            <Box
              component={editing ? 'form' : 'div'}
              onSubmit={editing ? handleSave : undefined}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                label='Full Name'
                value={form.name}
                onChange={handleChange('name')}
                disabled={!editing}
                required={editing}
                fullWidth
              />
              <TextField
                label='Email'
                type='email'
                value={form.email}
                onChange={handleChange('email')}
                disabled={!editing}
                required={editing}
                fullWidth
              />
              <TextField
                label='Phone (optional)'
                value={form.phone}
                onChange={handleChange('phone')}
                disabled={!editing}
                fullWidth
              />

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                {editing ? (
                  <>
                    <Button
                      type='submit'
                      variant='contained'
                      startIcon={<SaveIcon />}
                      disabled={update.isPending}
                    >
                      {update.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                    <Button
                      variant='outlined'
                      startIcon={<CloseIcon />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant='outlined'
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
