import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/views/Home'
import { CatalogPage as Catalog } from '@/features/catalog'
import { ProductDetail } from '@/views/ProductDetail'
import { Login } from '@/views/Login'
import { Register } from '@/views/Register'
import { Cart } from '@/views/Cart'
import { Checkout } from '@/views/Checkout'
import { OrderConfirmation } from '@/views/OrderConfirmation'
import { Orders } from '@/views/Orders'
import { Perfil } from '@/views/Perfil'
import { AdminRoute } from '@/components/AdminRoute'
import { BuyerRoute } from '@/components/BuyerRoute'
import { SlayerRoute } from '@/eastere/SlayerRoute'
import { RipAndTear } from '@/eastere/RipAndTear'
import { NuevoProducto } from '@/views/admin/NuevoProducto'
import { EditarProducto } from '@/views/admin/EditarProducto'
import { AdminInventario } from '@/views/admin/AdminInventario'
import { GestionCupones } from '@/views/admin/GestionCupones'
import { NuevoCupon } from '@/views/admin/NuevoCupon'
import { EditarCupon } from '@/views/admin/EditarCupon'
import { AdminOrdenes } from '@/views/admin/AdminOrdenes'
import { GestionCategorias } from '@/views/admin/GestionCategorias'
import { GestionUsuarios } from '@/views/admin/GestionUsuarios'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Rutas públicas y de comprador */}
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          <Route element={<BuyerRoute />}>
            <Route path="carrito" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
          <Route path="orden/:id" element={<OrderConfirmation />} />
          <Route path="mis-ordenes" element={<Orders />} />
          <Route path="perfil" element={<Perfil />} />

          {/* Rutas protegidas EXCLUSIVAS para el Administrador */}
          <Route element={<AdminRoute />}>
            <Route path="admin/productos/nuevo" element={<NuevoProducto />} />
            <Route path="admin/productos/editar/:id" element={<EditarProducto />} />
            <Route path="admin/inventario" element={<AdminInventario />} />
            <Route path="admin/cupones" element={<GestionCupones />} />
            <Route path="admin/cupones/nuevo" element={<NuevoCupon />} />
            <Route path="admin/cupones/editar/:id" element={<EditarCupon />} />
            <Route path="admin/ordenes" element={<AdminOrdenes />} />
            <Route path="admin/categorias" element={<GestionCategorias />} />
            <Route path="admin/usuarios" element={<GestionUsuarios />} />
          </Route>

          <Route element={<SlayerRoute />}>
            <Route path="rip-and-tear" element={<RipAndTear />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
