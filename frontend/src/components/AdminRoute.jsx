import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAdmin, selectIsAuthenticated } from '@/redux/usersSlice'

export function AdminRoute() {
  const isAdmin = useSelector(selectIsAdmin)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Si no está logueado o no es administrador, lo redirigimos al inicio
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}