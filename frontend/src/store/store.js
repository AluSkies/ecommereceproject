import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import catalogReducer from './slices/catalogSlice'
import ordersReducer from './slices/ordersSlice'
import discountsReducer from './slices/discountsSlice'
import usersReducer from './slices/usersSlice'
import productsReducer from './slices/productsSlice'
import categoriesReducer from './slices/categoriesSlice'

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
})

export default store
