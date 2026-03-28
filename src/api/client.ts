/**
 * Web client strategy:
 * - Access token: in-memory only (never localStorage / sessionStorage)
 * - Refresh token: httpOnly cookie set by server (JS can't read it)
 *
 * On page load, the app calls GET /auth/me or POST /auth/refresh — if the
 * cookie is valid, a fresh access token is returned and stored in memory.
 *
 * Install: npm install axios
 */
import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL

// In-memory token — intentionally NOT exported as a mutable variable.
// Go through getAccessToken / setAccessToken to manage it.
let _accessToken: string | null = null

export function getAccessToken() {
  return _accessToken
}
export function setAccessToken(token: string | null) {
  _accessToken = token
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true, // sends httpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' }
})

// ─── Request interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

// ─── Response interceptor + silent refresh ───────────────────────────────────

// ─── Silent refresh (deduplicated) ──────────────────────────────────────────
// A single shared promise prevents concurrent calls (e.g. React StrictMode
// double-invoking effects) from rotating the same token twice.

let _refreshPromise: Promise<string> | null = null

export function silentRefresh(): Promise<string> {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = apiClient
    .post<{ accessToken: string }>('/auth/refresh')
    .then(({ data }) => {
      setAccessToken(data.accessToken)
      return data.accessToken
    })
    .finally(() => {
      _refreshPromise = null
    })
  return _refreshPromise
}

// ─── Response interceptor + silent refresh on 401 ───────────────────────────

let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const isExpired =
      error.response?.status === 401 &&
      (error.response?.data as any)?.error === 'ACCESS_TOKEN_EXPIRED'

    if (isExpired && !original._retry) {
      if (_refreshPromise) {
        return _refreshPromise.then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry = true

      try {
        const token = await silentRefresh()
        processQueue(null, token)
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        setAccessToken(null)
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
