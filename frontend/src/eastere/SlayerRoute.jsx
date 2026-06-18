import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function SlayerRoute() {
  const { user } = useAuth()
  if (user?.role !== 'DOOM_SLAYER') return <Navigate to="/" replace />
  return <Outlet />
}
