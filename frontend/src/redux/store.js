// Store único de Redux (estructura mandatoria: un solo store.js + una slice por tabla).
import { configureStore } from '@reduxjs/toolkit'
import { setStoredToken } from '@/lib/api'

import users from './usersSlice'
import products from './productsSlice'
import categories from './categoriesSlice'
import carts from './cartsSlice'
import cartItems from './cartItemsSlice'
import orders from './ordersSlice'
import orderItems from './orderItemsSlice'
import orderStatusHistory from './orderStatusHistorySlice'
import discounts from './discountsSlice'
import productImages from './productImagesSlice'
import customerInfo from './customerInfoSlice'
import customersInfo from './customersInfoSlice'
import addresses from './addressesSlice'
import adminAuditLog from './adminAuditLogSlice'
import sessionAuditLog from './sessionAuditLogSlice'
import ui from './uiSlice'

const reducer = {
  users,
  products,
  categories,
  carts,
  cartItems,
  orders,
  orderItems,
  orderStatusHistory,
  discounts,
  productImages,
  customerInfo,
  customersInfo,
  addresses,
  adminAuditLog,
  sessionAuditLog,
  ui,
}

// Fábrica del store (útil para tests, que necesitan un store fresco por render).
export function makeStore(preloadedState) {
  return configureStore({
    reducer,
    // login/register rechazan con el ApiError original (no serializable) para que la UI
    // pueda leer status/body; lo dejamos pasar sólo en esas acciones de rechazo.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Estas acciones rechazan con el ApiError original (no serializable) para que la
          // UI lea status/body/message; el resto del estado se mantiene serializable.
          ignoredActions: [
            'users/login/rejected',
            'users/register/rejected',
            'carts/addItem/rejected',
            'carts/updateQty/rejected',
            'carts/removeItem/rejected',
            'orders/checkout/rejected',
          ],
        },
      }),
    preloadedState,
  })
}

export const store = makeStore()

// Persistencia de sesión en localStorage (mismas keys de siempre: tempus.token / tempus.user).
// api.js lee el token con getStoredToken(), así que mantener esto evita tocar api.js.
let prevUsers = store.getState().users
store.subscribe(() => {
  const u = store.getState().users
  if (u === prevUsers) return
  prevUsers = u
  setStoredToken(u.token)
  if (u.currentUser) localStorage.setItem('tempus.user', JSON.stringify(u.currentUser))
  else localStorage.removeItem('tempus.user')
})
