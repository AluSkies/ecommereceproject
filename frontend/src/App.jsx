import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { CatalogPage as Catalog } from '@/features/catalog'
import { ProductDetail } from '@/pages/ProductDetail'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { Orders } from '@/pages/Orders'
import { Perfil } from '@/pages/Perfil'
import { AdminRoute } from '@/components/AdminRoute'
import { BuyerRoute } from '@/components/BuyerRoute'
import { SlayerRoute } from '@/eastere/SlayerRoute'
import { RipAndTear } from '@/eastere/RipAndTear'
import { NuevoProducto } from '@/pages/admin/NuevoProducto'
import { EditarProducto } from '@/pages/admin/EditarProducto'
import { AdminInventario } from '@/pages/admin/AdminInventario'
import { GestionCupones } from '@/pages/admin/GestionCupones'
import { NuevoCupon } from '@/pages/admin/NuevoCupon'
import { EditarCupon } from '@/pages/admin/EditarCupon'
import { AdminOrdenes } from '@/pages/admin/AdminOrdenes'
import { GestionCategorias } from '@/pages/admin/GestionCategorias'
import { GestionUsuarios } from '@/pages/admin/GestionUsuarios'

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
