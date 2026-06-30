import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function BuyerRoute() {
  const { isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin/inventario" replace />
  return <Outlet />
}
