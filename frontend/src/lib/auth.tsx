import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiPost, getStoredToken, setStoredToken, ApiError } from './api'

export type Role = 'ADMIN' | 'BUYER'

export interface AuthUser {
  id: number
  email: string
  role: Role
  firstName?: string
  lastName?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  region?: string
  postalCode?: string
  countryCode?: string
}

interface AuthResponse {
  token: string
  expiresIn: number
  user: AuthUser
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  line1: string
  line2?: string
  city: string
  region?: string
  postalCode: string
  countryCode: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const USER_STORAGE_KEY = 'tempus.user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())

  useEffect(() => {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_STORAGE_KEY)
  }, [user])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiPost<AuthResponse>('/auth/login', { username, password })
    setStoredToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiPost<AuthResponse>('/auth/register', payload)
    setStoredToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiPost<void>('/auth/logout', {})
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        // Non-auth errors shouldn't block local cleanup, but surface in console for debugging.
        console.warn('Logout request failed', err)
      }
    }
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token), login, register, logout }),
    [user, token, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
