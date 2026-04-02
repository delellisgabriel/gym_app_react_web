import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import { useTrainers } from '../data/trainers'

interface Trainer {
  id: number
  userId: number
  gymId: number
  bio?: string
  specialty?: string
  createdAt: string
  user: {
    name: string
    email: string
    phone?: string
  }
}

export default function TrainersPage() {
  const { getAll } = useTrainers()
  const trainers: Trainer[] = getAll.data ?? []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5'>Trainers</Typography>
        <Typography variant='body2' color='text.secondary'>
          Trainers registered at your gym.
        </Typography>
      </Box>

      {/* Empty state */}
      {!getAll.isLoading && trainers.length === 0 && !getAll.isError && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2, color: 'text.secondary' }}>
          <GroupIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography>No trainers yet.</Typography>
          <Typography variant='body2' align='center'>
            Go to <strong>Users</strong> and set a member's role to <em>trainer</em> to add them here.
          </Typography>
        </Box>
      )}

      {/* Table */}
      {(getAll.isLoading || trainers.length > 0 || getAll.isError) && (
        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trainer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>Bio</TableCell>
                <TableCell>Since</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getAll.isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))}
              {getAll.isError && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Alert severity='error'>Failed to load trainers.</Alert>
                  </TableCell>
                </TableRow>
              )}
              {trainers.map((trainer) => (
                <TableRow key={trainer.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                        {trainer.user.name?.[0]?.toUpperCase() ?? '?'}
                      </Avatar>
                      <Typography variant='body2' fontWeight={500}>
                        {trainer.user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{trainer.user.email}</TableCell>
                  <TableCell>{trainer.user.phone ?? '—'}</TableCell>
                  <TableCell>
                    {trainer.specialty ? (
                      <Chip label={trainer.specialty} size='small' variant='outlined' color='primary' />
                    ) : (
                      <Typography variant='body2' color='text.disabled'>—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant='body2' color='text.secondary' noWrap title={trainer.bio}>
                      {trainer.bio ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                    {trainer.createdAt
                      ? new Date(trainer.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
