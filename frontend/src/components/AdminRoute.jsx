import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function AdminRoute() {
  const { isAdmin, isAuthenticated } = useAuth()

  // Si no está logueado o no es administrador, lo redirigimos al inicio
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}