import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loginUser, registerUser, logoutUser, updateStoredUser } from '@/redux/usersSlice'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.users.user)
  const token = useSelector((state) => state.users.token)
  const isAuthenticated = useSelector((state) => state.users.isAuthenticated)

  const login = useCallback(
    async (username, password) => {
      const result = await dispatch(loginUser({ username, password }))
      if (loginUser.rejected.match(result)) {
        throw new Error(result.payload)
      }
      return result.payload
    },
    [dispatch]
  )

  const register = useCallback(
    async (payload) => {
      const result = await dispatch(registerUser(payload))
      if (registerUser.rejected.match(result)) {
        throw new Error(result.payload)
      }
      return result.payload
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutUser())
  }, [dispatch])

  const updateUser = useCallback(
    (updated) => {
      dispatch(updateStoredUser(updated))
    },
    [dispatch]
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAdmin: user?.role === 'ADMIN',
      isSlayer: user?.role === 'DOOM_SLAYER',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, isAuthenticated, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
