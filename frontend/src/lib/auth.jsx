import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  updateUser,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSlayer,
  selectAuthLoading,
  selectAuthError,
} from '@/store/slices/authSlice'

/**
 * Drop-in replacement for the old Context-based useAuth().
 * Same public API — now backed by Redux store.
 */
export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const isSlayer = useSelector(selectIsSlayer)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)

  const login = useCallback(
    (username, password) => dispatch(loginThunk({ username, password })).unwrap(),
    [dispatch],
  )

  const register = useCallback(
    (payload) => dispatch(registerThunk(payload)).unwrap(),
    [dispatch],
  )

  const logout = useCallback(
    () => dispatch(logoutThunk()).unwrap(),
    [dispatch],
  )

  const updateUserData = useCallback(
    (updated) => dispatch(updateUser(updated)),
    [dispatch],
  )

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isSlayer,
    loading,
    error,
    login,
    register,
    logout,
    updateUser: updateUserData,
  }
}

// No-op provider kept for backwards compatibility with any remaining imports
export function AuthProvider({ children }) {
  return children
}
