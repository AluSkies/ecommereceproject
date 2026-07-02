import { describe, it, expect } from 'vitest'
import reducer, {
  cartCleared, addItem, fetchCartByCustomer,
  selectCart, selectCartItemCount,
} from './cartsSlice'

describe('cartsSlice', () => {
  it('cartCleared vacía el carrito local', () => {
    const state = reducer({ cart: { id: 1, items: [] }, loading: false, error: null }, cartCleared())
    expect(state.cart).toBeNull()
  })

  it('addItem.fulfilled setea el carrito devuelto por el backend', () => {
    const cart = { id: 9, items: [{ productId: 1, quantity: 2 }] }
    const state = reducer(undefined, { type: addItem.fulfilled.type, payload: cart })
    expect(state.cart).toEqual(cart)
  })

  it('fetchCartByCustomer maneja loading -> fulfilled', () => {
    let state = reducer(undefined, { type: fetchCartByCustomer.pending.type })
    expect(state.loading).toBe(true)
    state = reducer(state, { type: fetchCartByCustomer.fulfilled.type, payload: { id: 3, items: [] } })
    expect(state.loading).toBe(false)
    expect(state.cart).toEqual({ id: 3, items: [] })
  })

  it('selectores: selectCart y selectCartItemCount', () => {
    const root = { carts: { cart: { id: 1, items: [{ quantity: 2 }, { quantity: 3 }] } } }
    expect(selectCart(root)).toBe(root.carts.cart)
    expect(selectCartItemCount(root)).toBe(5)
    expect(selectCartItemCount({ carts: { cart: null } })).toBe(0)
  })
})
