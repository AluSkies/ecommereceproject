import { configureStore } from '@reduxjs/toolkit'
import { setUnauthorizedHandler } from './axiosClient'
import authReducer, { sessionExpired } from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import catalogReducer from './slices/catalogSlice'
import ordersReducer from './slices/ordersSlice'
import discountsReducer from './slices/discountsSlice'
import usersReducer from './slices/usersSlice'
import productsReducer from './slices/productsSlice'
import categoriesReducer from './slices/categoriesSlice'

const TOKEN_KEY = 'tempus.token'
const USER_KEY = 'tempus.user'

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    catalog: catalogReducer,
    orders: ordersReducer,
    discounts: discountsReducer,
    users: usersReducer,
    products: productsReducer,
    categories: categoriesReducer,
  },
  // login/register rechazan con { message, status } (objeto plano, serializable).
  // Los listamos igual para que Redux DevTools no tire warnings si Axios
  // llega a filtrar un objeto Error en algún interceptor.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/login/rejected',
          'auth/register/rejected',
          'cart/addItem/rejected',
          'cart/updateItem/rejected',
          'cart/removeItem/rejected',
          'orders/checkout/rejected',
        ],
      },
    }),
})

// Persistencia centralizada de sesión: los thunks de auth no tocan localStorage
// directamente — este subscriber es el único punto de escritura.
let prevAuth = store.getState().auth
store.subscribe(() => {
  const auth = store.getState().auth
  if (auth === prevAuth) return
  prevAuth = auth

  if (auth.token) localStorage.setItem(TOKEN_KEY, auth.token)
  else localStorage.removeItem(TOKEN_KEY)

  if (auth.user) localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
  else localStorage.removeItem(USER_KEY)
})

// Un 401 fuera del login significa token vencido/inválido. Limpiamos la sesión
// en el store y el subscriber de arriba borra localStorage — sigue habiendo un
// solo punto de escritura. Al quedar `token` en null, selectIsAuthenticated pasa
// a false y Cart/Checkout redirigen solos a /login.
// El guard evita despachar N veces si varias requests fallan a la vez.
setUnauthorizedHandler(() => {
  if (store.getState().auth.token) store.dispatch(sessionExpired())
})

export default store
