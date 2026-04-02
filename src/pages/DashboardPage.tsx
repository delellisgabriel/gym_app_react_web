import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import GroupIcon from '@mui/icons-material/Group'
import { useGyms } from '../data/gyms'
import { useUsers } from '../data/users'
import { useClasses } from '../data/classes'
import { useTrainers } from '../data/trainers'
import { useAuth } from '../hooks/useAuth'

interface StatCardProps {
  title: string
  value: number | string | undefined
  loading: boolean
  icon: React.ReactNode
  accent: string
}

function StatCard({ title, value, loading, icon, accent }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant='text' width={60} height={44} />
          ) : (
            <Typography variant='h4' fontWeight={700}>
              {value ?? '—'}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: accent + '1A', // 10% opacity
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { getAll: getGyms }     = useGyms()
  const { getAll: getUsers }    = useUsers()
  const { getAvailable }        = useClasses()
  const { getAll: getTrainers } = useTrainers()

  const countByRole = (role: string) =>
    (getUsers.data as Array<{ role: string }> | undefined)?.filter((u) => u.role === role).length

  const stats: StatCardProps[] = [
    {
      title:   'Members',
      value:   countByRole('member'),
      loading: getUsers.isLoading,
      icon:    <PeopleIcon />,
      accent:  '#1565C0',
    },
    {
      title:   'Trainers',
      value:   getTrainers.data?.length,
      loading: getTrainers.isLoading,
      icon:    <GroupIcon />,
      accent:  '#F4511E',
    },
    {
      title:   'Upcoming Classes',
      value:   getAvailable.data?.data?.length,
      loading: getAvailable.isLoading,
      icon:    <CalendarMonthIcon />,
      accent:  '#2E7D32',
    },
    {
      title:   'Gyms',
      value:   getGyms.data?.length,
      loading: getGyms.isLoading,
      icon:    <BusinessIcon />,
      accent:  '#6A1B9A',
    },
  ]

  return (
    <Box>
      <Typography variant='h5' mb={0.5}>
        Welcome back, {user?.name?.split(' ')[0]}
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={3}>
        Here's a quick overview of your gym.
      </Typography>

      {/* Stat cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 3,
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </Box>
    </Box>
  )
}
