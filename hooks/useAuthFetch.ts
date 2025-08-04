import { useAuth } from '../context/AuthContext'

export function useAuthFetch() {
  const { token, logout } = useAuth()

  async function authFetch(input: RequestInfo, init?: RequestInit) {
    const headers = new Headers(init?.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const res = await fetch(input, { ...init, headers })

    if (res.status === 401) {
      // Token expired or invalid, logout and redirect
      logout()
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Fetch error')
    }

    return res.json()
  }

  return authFetch
}
