import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiPost, getStoredToken, setStoredToken, ApiError } from './api'

/**
 * @typedef {'ADMIN'|'BUYER'} Role
 */

/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} email
 * @property {Role} role
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [phone]
 * @property {string} [line1]
 * @property {string} [line2]
 * @property {string} [city]
 * @property {string} [region]
 * @property {string} [postalCode]
 * @property {string} [countryCode]
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} email
 * @property {string} password
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [phone]
 * @property {string} line1
 * @property {string} [line2]
 * @property {string} city
 * @property {string} [region]
 * @property {string} postalCode
 * @property {string} countryCode
 */

const USER_STORAGE_KEY = 'tempus.user'

const AuthContext = createContext(undefined)

function loadStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => loadStoredUser())

  useEffect(() => {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_STORAGE_KEY)
  }, [user])

  const login = useCallback(async (username, password) => {
    const res = await apiPost('/auth/login', { username, password })
    setStoredToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (payload) => {
    const res = await apiPost('/auth/register', payload)
    setStoredToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const updateUser = useCallback((updated) => {
    // Refresca el usuario en contexto + localStorage (p. ej. tras editar el perfil).
    setUser((prev) => ({ ...prev, ...updated }))
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout', {})
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        console.warn('Logout request failed', err)
      }
    }
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'ADMIN',
      isSlayer: user?.role === 'DOOM_SLAYER',
      login,
      register,
      logout,
      updateUser
    }),
    [user, token, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
