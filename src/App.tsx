import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

import LoginPage        from './pages/LoginPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import DashboardPage    from './pages/DashboardPage'
import UsersPage        from './pages/UsersPage'
import GymsPage         from './pages/GymsPage'
import ClassesPage      from './pages/ClassesPage'
import TrainersPage     from './pages/TrainersPage'
import ProfilePage      from './pages/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path='/login'        element={<LoginPage />} />
          <Route path='/unauthorized' element={<UnauthorizedPage />} />

          {/* Authenticated — all roles */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path='/dashboard' element={<DashboardPage />} />
              <Route path='/profile'   element={<ProfilePage />} />

              {/* Admin + trainer */}
              <Route element={<ProtectedRoute role='trainer' />}>
                <Route path='/classes' element={<ClassesPage />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute role='admin' />}>
                <Route path='/users'    element={<UsersPage />} />
                <Route path='/gyms'     element={<GymsPage />} />
                <Route path='/trainers' element={<TrainersPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallbacks */}
          <Route path='/'    element={<Navigate to='/dashboard' replace />} />
          <Route path='/admin' element={<Navigate to='/users' replace />} />
          <Route path='*'    element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
