import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'

interface Admin {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'superadmin'
}

interface AuthValue {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .get<{ admin: Admin | null }>('/api/auth/me')
      .then((result) => {
        if (!cancelled) setAdmin(result.admin)
      })
      .catch(() => {
        if (!cancelled) setAdmin(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ admin: Admin }>('/api/auth/login', { email, password })
    setAdmin(result.admin)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {})
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
    }
    setAdmin(null)
  }, [])

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>.')
  return context
}
