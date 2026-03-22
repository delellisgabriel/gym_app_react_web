import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'

// your real pages go here
function DashboardPage() {
  const { logout } = useAuth()

  return (
    <>
      <button onClick={() => logout()}>logout</button>
      <div>Dashboard</div>
    </>
  )
}

function AdminPage() {
  return <div>Admin</div>
}

function UnauthorizedPage() {
  return <div>403 — Access denied</div>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/unauthorized' element={<UnauthorizedPage />} />

          {/* any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<DashboardPage />} />
          </Route>

          {/* admin only */}
          <Route element={<ProtectedRoute role='admin' />}>
            <Route path='/admin' element={<AdminPage />} />
          </Route>

          {/* fallback */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
