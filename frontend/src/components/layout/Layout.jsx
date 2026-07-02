import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Toaster } from '@/components/ui/Toaster'
import { selectCurrentUser } from '@/redux/usersSlice'
import { fetchCartByCustomer, cartCleared } from '@/redux/cartsSlice'

export function Layout() {
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const userId = currentUser?.id ?? null

  // El carrito depende de la sesión: lo refrescamos cuando cambia el usuario logueado
  // (reemplaza el useEffect que tenía el CartProvider).
  useEffect(() => {
    if (userId) dispatch(fetchCartByCustomer(userId))
    else dispatch(cartCleared())
  }, [userId, dispatch])

  return (
    <div className="min-h-screen flex flex-col bg-pearl text-ink-primary font-sans">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
