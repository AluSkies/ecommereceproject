import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { apiDelete, apiGetNullable, apiPost, apiPut, ApiError } from './api'
import { useAuth } from './auth'

export type CartStatus = 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'ABANDONED'

export interface CartItem {
  productId: number
  productName: string
  productSku?: string
  unitPrice: number | string
  quantity: number
  lineTotal: number | string
}

export interface Cart {
  id: number
  customerId?: number | null
  status: CartStatus
  items: CartItem[]
  subtotal: number | string
  expiresAt?: string
  updatedAt?: string
}

interface CartContextValue {
  cart: Cart | null
  loading: boolean
  itemCount: number
  addItem: (productId: number, quantity?: number) => Promise<Cart>
  updateQuantity: (productId: number, quantity: number) => Promise<Cart>
  removeItem: (productId: number) => Promise<Cart | null>
  clearCart: () => Promise<void>
  refresh: () => Promise<void>
  resetLocal: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function itemCountOf(cart: Cart | null): number {
  if (!cart) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
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
      const res = await apiGetNullable<Cart>(`/cart/customer/${customerId}`)
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
    async (productId: number, quantity = 1): Promise<Cart> => {
      if (!customerId) throw new Error('No hay sesión activa')
      const next = await apiPost<Cart>('/cart/items', {
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
    async (productId: number, quantity: number): Promise<Cart> => {
      if (!cart) throw new Error('Carrito no inicializado')
      const next = await apiPut<Cart>(`/cart/${cart.id}/items/${productId}`, { quantity })
      setCart(next)
      return next
    },
    [cart],
  )

  const removeItem = useCallback(
    async (productId: number): Promise<Cart | null> => {
      if (!cart) return null
      try {
        const next = await apiDelete<Cart>(`/cart/${cart.id}/items/${productId}`)
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

  const value = useMemo<CartContextValue>(
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

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export function toNumber(value: number | string | undefined | null): number {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? Number(value) : value
}
