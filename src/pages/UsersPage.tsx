import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import { useUsers } from '../data/users'
import { useGyms } from '../data/gyms'

// ── Types ──────────────────────────────────────────────────────────────────────
type Role = 'member' | 'trainer' | 'admin'

const ROLES: Role[] = ['member', 'trainer', 'admin']

const ROLE_COLOR: Record<Role, 'default' | 'primary' | 'secondary'> = {
  member:  'default',
  trainer: 'primary',
  admin:   'secondary',
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
  gymId: number
  role: Role
}

interface Gym {
  id: number
  name: string
}

// ── Create User Dialog ─────────────────────────────────────────────────────────
interface CreateDialogProps {
  open: boolean
  onClose: () => void
  gyms: Gym[]
}

function CreateUserDialog({ open, onClose, gyms }: CreateDialogProps) {
  const { create } = useUsers()
  const [form, setForm] = useState({ name: '', email: '', phone: '', gym_id: '' })
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const result = await create.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        gym_id: Number(form.gym_id),
      })
      setTempPassword(result.tempPassword)
    } catch {
      setError('Failed to create user. Check that the email is not already in use.')
    }
  }

  const handleClose = () => {
    setForm({ name: '', email: '', phone: '', gym_id: '' })
    setTempPassword(null)
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle>Create User</DialogTitle>
      {tempPassword ? (
        <>
          <DialogContent>
            <Alert severity='success' sx={{ mb: 2 }}>
              User created successfully. Share the temporary password below — it cannot be shown again.
            </Alert>
            <TextField
              label='Temporary Password'
              value={tempPassword}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant='contained'>Done</Button>
          </DialogActions>
        </>
      ) : (
        <Box component='form' onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label='Full Name' value={form.name} onChange={handleChange('name')} required fullWidth />
            <TextField label='Email' type='email' value={form.email} onChange={handleChange('email')} required fullWidth />
            <TextField label='Phone (optional)' value={form.phone} onChange={handleChange('phone')} fullWidth />
            <FormControl fullWidth required>
              <InputLabel>Gym</InputLabel>
              <Select
                label='Gym'
                value={form.gym_id}
                onChange={(e) => setForm((prev) => ({ ...prev, gym_id: e.target.value as string }))}
              >
                {gyms.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && <Alert severity='error'>{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  )
}

// ── Delete Confirm Dialog ──────────────────────────────────────────────────────
interface DeleteDialogProps {
  user: User | null
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

function DeleteDialog({ user, onClose, onConfirm, loading }: DeleteDialogProps) {
  return (
    <Dialog open={!!user} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Remove User</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to remove <strong>{user?.name}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color='error' variant='contained' disabled={loading}>
          {loading ? 'Removing…' : 'Remove'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [gymFilter, setGymFilter] = useState<number | ''>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [pendingRole, setPendingRole] = useState<Record<number, Role>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Record<number, { msg: string; ok: boolean }>>({})

  const gymId = gymFilter !== '' ? gymFilter : undefined
  const { getAll, changeRole, remove } = useUsers(gymId)
  const { getAll: getGyms } = useGyms()

  const handleRoleChange = (userId: number, role: Role) =>
    setPendingRole((prev) => ({ ...prev, [userId]: role }))

  const handleSave = async (user: User) => {
    const role = pendingRole[user.id] ?? user.role
    setSavingId(user.id)
    try {
      await changeRole.mutateAsync({ id: user.id, role })
      setFeedback((prev) => ({ ...prev, [user.id]: { msg: 'Saved', ok: true } }))
      setPendingRole((prev) => { const n = { ...prev }; delete n[user.id]; return n })
    } catch {
      setFeedback((prev) => ({ ...prev, [user.id]: { msg: 'Error', ok: false } }))
    } finally {
      setSavingId(null)
      setTimeout(() => setFeedback((prev) => { const n = { ...prev }; delete n[user.id]; return n }), 2500)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await remove.mutateAsync(userToDelete.id)
    } finally {
      setUserToDelete(null)
    }
  }

  const gyms: Gym[] = getGyms.data ?? []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h5'>Users</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage gym members, trainers and admins.
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Add User
        </Button>
      </Box>

      {/* Gym filter */}
      <FormControl size='small' sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Filter by gym</InputLabel>
        <Select
          label='Filter by gym'
          value={gymFilter}
          onChange={(e) => setGymFilter(e.target.value as number | '')}
        >
          <MenuItem value=''>All gyms</MenuItem>
          {gyms.map((g) => (
            <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Table */}
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Gym</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getAll.isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {getAll.isError && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Alert severity='error'>Failed to load users.</Alert>
                </TableCell>
              </TableRow>
            )}
            {getAll.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {(getAll.data as User[] | undefined)?.map((user) => {
              const selectedRole = pendingRole[user.id] ?? user.role
              const dirty = selectedRole !== user.role
              const fb = feedback[user.id]
              const gymName = gyms.find((g) => g.id === user.gymId)?.name ?? `#${user.gymId}`

              return (
                <TableRow key={user.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone ?? '—'}</TableCell>
                  <TableCell>{gymName}</TableCell>
                  <TableCell>
                    <Select
                      size='small'
                      value={selectedRole}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      variant='outlined'
                      sx={{ minWidth: 110, fontSize: 13 }}
                      renderValue={(val) => (
                        <Chip
                          label={val}
                          size='small'
                          color={ROLE_COLOR[val as Role]}
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      )}
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {fb && (
                        <Typography variant='caption' color={fb.ok ? 'success.main' : 'error.main'} fontWeight={600}>
                          {fb.msg}
                        </Typography>
                      )}
                      <Tooltip title='Save role change'>
                        <span>
                          <IconButton
                            size='small'
                            color='primary'
                            disabled={!dirty || savingId === user.id}
                            onClick={() => handleSave(user)}
                          >
                            {savingId === user.id ? <CircularProgress size={16} /> : <SaveIcon fontSize='small' />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title='Remove user'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => setUserToDelete(user)}
                        >
                          <DeleteOutlineIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} gyms={gyms} />
      <DeleteDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        loading={remove.isPending}
      />
    </Box>
  )
}
