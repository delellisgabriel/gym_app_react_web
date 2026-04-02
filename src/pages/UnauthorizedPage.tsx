import { Box, Typography, Button } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        bgcolor: 'background.default',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: '50%',
          bgcolor: 'error.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 40, color: 'error.contrastText' }} />
      </Box>
      <Typography variant='h4'>403 — Access Denied</Typography>
      <Typography variant='body1' color='text.secondary' maxWidth={400}>
        You don't have permission to view this page.
      </Typography>
      <Button variant='contained' onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  )
}
