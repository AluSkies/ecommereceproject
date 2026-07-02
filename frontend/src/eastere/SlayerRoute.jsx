import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/redux/usersSlice'

export function SlayerRoute() {
  const user = useSelector(selectCurrentUser)
  if (user?.role !== 'DOOM_SLAYER') return <Navigate to="/" replace />
  return <Outlet />
}
