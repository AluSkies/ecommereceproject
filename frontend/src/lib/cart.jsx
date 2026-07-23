import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect } from 'react'
import {
  fetchCartThunk,
  addItemThunk,
  updateItemThunk,
  removeItemThunk,
  clearCartThunk,
  resetCart,
  selectCart,
  selectCartLoading,
  selectCartError,
  selectItemCount,
} from '@/store/slices/cartSlice'
import { useAuth } from './auth'

/**
 * Drop-in replacement for the old Context-based useCart().
 * Same public API — now backed by Redux store.
 */
export function useCart() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useAuth()
  const cart = useSelector(selectCart)
  const loading = useSelector(selectCartLoading)
  const error = useSelector(selectCartError)
  const itemCount = useSelector(selectItemCount)

  const customerId = user?.id ?? null

  useEffect(() => {
    if (isAuthenticated && customerId) {
      dispatch(fetchCartThunk(customerId))
    } else {
      dispatch(resetCart())
    }
  }, [isAuthenticated, customerId, dispatch])

  const refresh = useCallback(() => {
    if (customerId) dispatch(fetchCartThunk(customerId))
  }, [customerId, dispatch])

  const addItem = useCallback(
    (productId, quantity = 1) =>
      dispatch(addItemThunk({ customerId, productId, quantity })).unwrap(),
    [customerId, dispatch],
  )

  const updateQuantity = useCallback(
    (productId, quantity) =>
      dispatch(updateItemThunk({ cartId: cart?.id, productId, quantity })).unwrap(),
    [cart?.id, dispatch],
  )

  const removeItem = useCallback(
    (productId) =>
      dispatch(removeItemThunk({ cartId: cart?.id, productId })).unwrap(),
    [cart?.id, dispatch],
  )

  const clearCart = useCallback(
    () => dispatch(clearCartThunk(cart?.id)).unwrap(),
    [cart?.id, dispatch],
  )

  const resetLocal = useCallback(() => dispatch(resetCart()), [dispatch])

  return {
    cart,
    loading,
    error,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refresh,
    resetLocal,
  }
}

// No-op provider kept for backwards compatibility
export function CartProvider({ children }) {
  return children
}

export function toNumber(value) {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? Number(value) : value
}
