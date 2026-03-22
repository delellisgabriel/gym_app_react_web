import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  role?: string
}

export function ProtectedRoute({ role }: Props) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span>Loading…</span>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (role && user?.role !== role && user?.role !== 'admin') {
    return <Navigate to='/unauthorized' replace />
  }

  return <Outlet />
}
