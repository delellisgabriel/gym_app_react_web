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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BusinessIcon from '@mui/icons-material/Business'
import { useGyms } from '../data/gyms'

interface Gym {
  id: number
  name: string
  address?: string
  createdAt: string
}

// ── Create Gym Dialog ──────────────────────────────────────────────────────────
interface CreateGymDialogProps {
  open: boolean
  onClose: () => void
}

function CreateGymDialog({ open, onClose }: CreateGymDialogProps) {
  const { create } = useGyms()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await create.mutateAsync({ name, address })
      setName('')
      setAddress('')
      onClose()
    } catch {
      setError('Failed to create gym. Please try again.')
    }
  }

  const handleClose = () => {
    setName('')
    setAddress('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle>Add Gym</DialogTitle>
      <Box component='form' onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label='Gym Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label='Address (optional)'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          {error && <Alert severity='error'>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained' disabled={create.isPending}>
            {create.isPending ? 'Adding…' : 'Add Gym'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function GymsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { getAll } = useGyms()

  const gyms: Gym[] = getAll.data ?? []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h5'>Gyms</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage your gym locations.
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Add Gym
        </Button>
      </Box>

      {/* Empty state */}
      {!getAll.isLoading && gyms.length === 0 && !getAll.isError && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 8,
            gap: 2,
            color: 'text.secondary',
          }}
        >
          <BusinessIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography>No gyms yet. Add your first gym to get started.</Typography>
          <Button variant='outlined' startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Add Gym
          </Button>
        </Box>
      )}

      {/* Table */}
      {(getAll.isLoading || gyms.length > 0 || getAll.isError) && (
        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getAll.isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))}
              {getAll.isError && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Alert severity='error'>Failed to load gyms.</Alert>
                  </TableCell>
                </TableRow>
              )}
              {gyms.map((gym) => (
                <TableRow key={gym.id} hover>
                  <TableCell sx={{ color: 'text.secondary', width: 60 }}>{gym.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{gym.name}</TableCell>
                  <TableCell>{gym.address ?? '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {gym.createdAt
                      ? new Date(gym.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateGymDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  )
}
