import React, { createContext, useEffect, useState, useCallback } from 'react'
import { apiClient, setAccessToken } from '../api/client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number
  gymId: number
  name: string
  email: string
  role: string
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  login: (gymId: number, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  // ── Silent refresh on page load ───────────────────────────────────────────
  // The httpOnly cookie is sent automatically; server returns a fresh access token.
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiClient.post<{
          accessToken: string
          refreshToken?: string // ignored on web
          user?: AuthUser
        }>('/auth/refresh')

        setAccessToken(data.accessToken)

        // Fetch user info with the new access token
        const meRes = await apiClient.get<{ user: AuthUser }>('/auth/me')
        setUser(meRes.data.user as AuthUser)
        setStatus('authenticated')
      } catch {
        setAccessToken(null)
        setStatus('unauthenticated')
      }
    })()
  }, [])

  // ── Listen for forced logout (token refresh failure from interceptor) ──────
  useEffect(() => {
    const handler = () => {
      setUser(null)
      setAccessToken(null)
      setStatus('unauthenticated')
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (gymId: number, email: string, password: string) => {
      const { data } = await apiClient.post<{
        user: AuthUser
        accessToken: string
      }>('/auth/login', { gymId, email, password })

      setAccessToken(data.accessToken)
      setUser(data.user)
      setStatus('authenticated')
    },
    []
  )

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Cookie sent automatically — server revokes refresh token + clears cookie
      await apiClient.post('/auth/logout')
    } catch {
      // Best-effort
    }
    setAccessToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const logoutAll = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout-all')
    } catch {
      // Best-effort
    }
    setAccessToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  return (
    <AuthContext.Provider value={{ status, user, login, logout, logoutAll }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, AuthContext }
