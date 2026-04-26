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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { useClasses } from '../data/classes'
import { useTrainers } from '../data/trainers'
import { useAuth } from '../hooks/useAuth'

type ClassItem = {
  id: number
  name: string
  starts_at: string
  capacity: number
  trainerId: number
  _count: { bookings: number }
  trainer?: Trainer
}

type Trainer = {
  id: number
  userId: number
  specialty?: string
  user: { name: string }
}

// ── Occupancy indicator ────────────────────────────────────────────────────────
function OccupancyBar({
  booked,
  capacity
}: {
  booked: number
  capacity: number
}) {
  const pct = capacity > 0 ? Math.round((booked / capacity) * 100) : 0
  const color = pct >= 100 ? 'error' : pct >= 75 ? 'warning' : 'success'
  return (
    <Tooltip title={`${booked} / ${capacity} spots filled`}>
      <Box sx={{ minWidth: 90 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}
        >
          <Typography variant='caption' color='text.secondary'>
            {booked}/{capacity}
          </Typography>
          {pct >= 100 && (
            <Chip
              label='Full'
              size='small'
              color='error'
              sx={{ height: 16, fontSize: 10 }}
            />
          )}
        </Box>
        <LinearProgress
          variant='determinate'
          value={Math.min(pct, 100)}
          color={color}
          sx={{ borderRadius: 1, height: 5 }}
        />
      </Box>
    </Tooltip>
  )
}

// ── Create Class Dialog ────────────────────────────────────────────────────────
interface CreateClassDialogProps {
  open: boolean
  onClose: () => void
  trainers: Trainer[]
  gymId: number
}

function CreateClassDialog({
  open,
  onClose,
  trainers,
  gymId
}: CreateClassDialogProps) {
  const { createBatch } = useClasses()
  const [form, setForm] = useState({
    name: '',
    starts_at: '',
    capacity: '20',
    trainerId: ''
  })
  const [error, setError] = useState('')

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createBatch.mutateAsync([
        {
          name: form.name,
          starts_at: new Date(form.starts_at).toISOString(),
          capacity: Number(form.capacity),
          gymId,
          trainerId: Number(form.trainerId)
        }
      ])
      setForm({ name: '', starts_at: '', capacity: '20', trainerId: '' })
      onClose()
    } catch {
      setError(
        'Failed to create class. Check that a class with the same name and time does not already exist.'
      )
    }
  }

  const handleClose = () => {
    setForm({ name: '', starts_at: '', capacity: '20', trainerId: '' })
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle>Schedule Class</DialogTitle>
      <Box component='form' onSubmit={handleSubmit}>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label='Class Name'
            value={form.name}
            onChange={handleChange('name')}
            required
            fullWidth
            autoFocus
            placeholder='e.g. Morning Yoga'
          />
          <TextField
            label='Start Date & Time'
            type='datetime-local'
            value={form.starts_at}
            onChange={handleChange('starts_at')}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label='Capacity'
            type='number'
            value={form.capacity}
            onChange={handleChange('capacity')}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 1 } } }}
          />
          <FormControl fullWidth required>
            <InputLabel>Trainer</InputLabel>
            <Select
              label='Trainer'
              value={form.trainerId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  trainerId: e.target.value as string
                }))
              }
            >
              {trainers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.user.name}
                  {t.specialty && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      · {t.specialty}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && <Alert severity='error'>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type='submit'
            variant='contained'
            disabled={createBatch.isPending}
          >
            {createBatch.isPending ? 'Scheduling…' : 'Schedule'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ClassesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { getAvailable } = useClasses()
  const { getAll: getTrainers } = useTrainers()
  const { user } = useAuth()

  const classes: ClassItem[] = getAvailable.data?.data ?? []
  const trainers: Trainer[] = getTrainers.data ?? []
  const gymId = user?.gymId ?? 0

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant='h5'>Classes</Typography>
          <Typography variant='body2' color='text.secondary'>
            Upcoming scheduled classes for your gym.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Schedule Class
        </Button>
      </Box>

      {/* Empty state */}
      {!getAvailable.isLoading &&
        classes.length === 0 &&
        !getAvailable.isError && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8,
              gap: 2,
              color: 'text.secondary'
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography>
              No upcoming classes. Schedule the first one!
            </Typography>
            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
            >
              Schedule Class
            </Button>
          </Box>
        )}

      {/* Table */}
      {(getAvailable.isLoading ||
        classes.length > 0 ||
        getAvailable.isError) && (
        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Trainer</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Occupancy</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getAvailable.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {getAvailable.isError && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Alert severity='error'>Failed to load classes.</Alert>
                  </TableCell>
                </TableRow>
              )}
              {classes.map((cls) => {
                const booked = cls._count?.bookings ?? 0
                const trainerName =
                  cls.trainer?.user?.name ??
                  trainers.find((t) => t.id === cls.trainerId)?.user?.name ??
                  `Trainer #${cls.trainerId}`
                const dt = new Date(cls.starts_at)

                return (
                  <TableRow key={cls.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{cls.name}</TableCell>
                    <TableCell>{trainerName}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant='body2'>
                        {dt.toLocaleDateString(undefined, {
                          dateStyle: 'medium'
                        })}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {dt.toLocaleTimeString(undefined, {
                          timeStyle: 'short'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <OccupancyBar booked={booked} capacity={cls.capacity} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateClassDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        trainers={trainers}
        gymId={gymId}
      />
    </Box>
  )
}
