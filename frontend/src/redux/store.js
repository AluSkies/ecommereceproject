import { configureStore } from '@reduxjs/toolkit'
import addressesReducer from './addressesSlice'
import adminAuditLogReducer from './adminAuditLogSlice'
import cartItemsReducer from './cartItemsSlice'
import cartsReducer from './cartsSlice'
import categoriesReducer from './categoriesSlice'
import customerInfoReducer from './customerInfoSlice'
import customersInfoReducer from './customersInfoSlice'
import discountsReducer from './discountsSlice'
import orderItemsReducer from './orderItemsSlice'
import ordersReducer from './ordersSlice'
import orderStatusHistoryReducer from './orderStatusHistorySlice'
import productImagesReducer from './productImagesSlice'
import productsReducer from './productsSlice'
import sessionAuditLogReducer from './sessionAuditLogSlice'
import uiReducer from './uiSlice'
import usersReducer from './usersSlice'

export const store = configureStore({
  reducer: {
    addresses: addressesReducer,
    adminAuditLog: adminAuditLogReducer,
    cartItems: cartItemsReducer,
    carts: cartsReducer,
    categories: categoriesReducer,
    customerInfo: customerInfoReducer,
    customersInfo: customersInfoReducer,
    discounts: discountsReducer,
    orderItems: orderItemsReducer,
    orders: ordersReducer,
    orderStatusHistory: orderStatusHistoryReducer,
    productImages: productImagesReducer,
    products: productsReducer,
    sessionAuditLog: sessionAuditLogReducer,
    ui: uiReducer,
    users: usersReducer,
  },
})
