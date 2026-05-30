import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Catalog } from '@/pages/Catalog'
import { ProductDetail } from '@/pages/ProductDetail'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { Orders } from '@/pages/Orders'
import { AdminRoute } from '@/components/AdminRoute'
import { NuevoProducto } from '@/pages/admin/NuevoProducto'
import { EditarProducto } from '@/pages/admin/EditarProducto'
import { GestionCupones } from '@/pages/admin/GestionCupones'
import { NuevoCupon } from '@/pages/admin/NuevoCupon'
import { AdminOrdenes } from '@/pages/admin/AdminOrdenes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orden/:id" element={<OrderConfirmation />} />
          <Route path="mis-ordenes" element={<Orders />} />
          
          {/* Rutas protegidas EXCLUSIVAS para el Administrador */}
          <Route element={<AdminRoute />}>
            <Route path="admin/productos/nuevo" element={<NuevoProducto />} />
            <Route path="admin/productos/editar/:id" element={<EditarProducto />} />
            <Route path="admin/cupones" element={<GestionCupones />} />
            <Route path="admin/cupones/nuevo" element={<NuevoCupon />} />
            <Route path="admin/ordenes" element={<AdminOrdenes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
