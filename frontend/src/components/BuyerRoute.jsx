import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from '@/redux/usersSlice'

export function BuyerRoute() {
  const isAdmin = useSelector(selectIsAdmin)
  if (isAdmin) return <Navigate to="/admin/inventario" replace />
  return <Outlet />
}
