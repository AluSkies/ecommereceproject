import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from './auth'
import {
  refreshCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearRemoteCart,
  resetLocalCart,
} from '@/redux/cartsSlice'

const CartContext = createContext(undefined)

function itemCountOf(cart) {
  if (!cart) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export function CartProvider({ children }) {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useAuth()
  const { cart, loading } = useSelector((state) => state.carts)

  const customerId = user?.id ?? null

  const refresh = useCallback(async () => {
    if (!customerId) {
      dispatch(resetLocalCart())
      return
    }
    dispatch(refreshCart(customerId))
  }, [dispatch, customerId])

  useEffect(() => {
    if (isAuthenticated) {
      refresh()
    } else {
      dispatch(resetLocalCart())
    }
  }, [isAuthenticated, refresh, dispatch])

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      if (!customerId) throw new Error('No hay sesión activa')
      const result = await dispatch(addItemToCart({ customerId, productId, quantity }))
      if (addItemToCart.rejected.match(result)) {
        throw new Error(result.payload)
      }
      return result.payload
    },
    [dispatch, customerId]
  )

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!cart) throw new Error('Carrito no inicializado')
      const result = await dispatch(updateCartItemQuantity({ cartId: cart.id, productId, quantity }))
      if (updateCartItemQuantity.rejected.match(result)) {
        throw new Error(result.payload)
      }
      return result.payload
    },
    [dispatch, cart]
  )

  const removeItem = useCallback(
    async (productId) => {
      if (!cart) return null
      const result = await dispatch(removeCartItem({ cartId: cart.id, productId }))
      if (removeCartItem.rejected.match(result)) {
        throw new Error(result.payload)
      }
      // If 404 error was bypassed and null returned, we refresh the cart
      if (result.payload === null) {
        await refresh()
      }
      return result.payload
    },
    [dispatch, cart, refresh]
  )

  const clearCart = useCallback(async () => {
    if (!cart) return
    const result = await dispatch(clearRemoteCart(cart.id))
    if (clearRemoteCart.rejected.match(result)) {
      throw new Error(result.payload)
    }
  }, [dispatch, cart])

  const resetLocal = useCallback(() => {
    dispatch(resetLocalCart())
  }, [dispatch])

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount: itemCountOf(cart),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refresh,
      resetLocal,
    }),
    [cart, loading, addItem, updateQuantity, removeItem, clearCart, refresh, resetLocal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export function toNumber(value) {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? Number(value) : value
}
