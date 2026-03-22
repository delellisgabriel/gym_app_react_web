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

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://api.yourdomain.com'

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

let isRefreshing = false
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
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        // Cookie is sent automatically via withCredentials
        const { data } = await axios.post<{ accessToken: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        setAccessToken(data.accessToken)
        processQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        setAccessToken(null)
        // Fire a custom event so AuthContext can redirect to login
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
