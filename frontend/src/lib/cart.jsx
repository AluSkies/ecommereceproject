import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { apiDelete, apiGetNullable, apiPost, apiPut, ApiError } from './api'
import { useAuth } from './auth'

/**
 * @typedef {'ACTIVE'|'CONVERTED'|'EXPIRED'|'ABANDONED'} CartStatus
 */

/**
 * @typedef {Object} CartItem
 * @property {number} productId
 * @property {string} productName
 * @property {string} [productSku]
 * @property {number|string} unitPrice
 * @property {number} quantity
 * @property {number|string} lineTotal
 */

/**
 * @typedef {Object} Cart
 * @property {number} id
 * @property {number|null} [customerId]
 * @property {CartStatus} status
 * @property {CartItem[]} items
 * @property {number|string} subtotal
 * @property {string} [expiresAt]
 * @property {string} [updatedAt]
 */

const CartContext = createContext(undefined)

function itemCountOf(cart) {
  if (!cart) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const currentRequest = useRef(0)

  const customerId = user?.id ?? null

  const refresh = useCallback(async () => {
    if (!customerId) {
      setCart(null)
      return
    }
    const reqId = ++currentRequest.current
    setLoading(true)
    try {
      const res = await apiGetNullable(`/cart/customer/${customerId}`)
      if (reqId === currentRequest.current) {
        setCart(res)
      }
    } catch (err) {
      if (reqId === currentRequest.current) {
        console.warn('Cart refresh failed', err)
        setCart(null)
      }
    } finally {
      if (reqId === currentRequest.current) setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (isAuthenticated) {
      refresh()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, refresh])

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      if (!customerId) throw new Error('No hay sesión activa')
      const next = await apiPost('/cart/items', {
        customerId,
        productId,
        quantity,
      })
      setCart(next)
      return next
    },
    [customerId],
  )

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!cart) throw new Error('Carrito no inicializado')
      const next = await apiPut(`/cart/${cart.id}/items/${productId}`, { quantity })
      setCart(next)
      return next
    },
    [cart],
  )

  const removeItem = useCallback(
    async (productId) => {
      if (!cart) return null
      try {
        const next = await apiDelete(`/cart/${cart.id}/items/${productId}`)
        setCart(next)
        return next
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          await refresh()
          return null
        }
        throw err
      }
    },
    [cart, refresh],
  )

  const clearCart = useCallback(async () => {
    if (!cart) return
    await apiDelete(`/cart/${cart.id}`)
    setCart(null)
  }, [cart])

  const resetLocal = useCallback(() => {
    setCart(null)
  }, [])

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
    [cart, loading, addItem, updateQuantity, removeItem, clearCart, refresh, resetLocal],
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
