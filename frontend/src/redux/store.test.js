import { describe, it, expect, beforeEach } from 'vitest'
import { makeStore } from './store'

// Una slice por tabla (15) + ui.
const EXPECTED_SLICES = [
  'users', 'products', 'categories', 'carts', 'cartItems', 'orders', 'orderItems',
  'orderStatusHistory', 'discounts', 'productImages', 'customerInfo', 'customersInfo',
  'addresses', 'adminAuditLog', 'sessionAuditLog', 'ui',
]

describe('redux store', () => {
  beforeEach(() => localStorage.clear())

  it('registra exactamente las 16 slices (una por tabla + ui)', () => {
    const state = makeStore().getState()
    expect(Object.keys(state).sort()).toEqual([...EXPECTED_SLICES].sort())
  })

  it('inicializa las slices con la forma esperada', () => {
    const state = makeStore().getState()
    expect(state.products).toMatchObject({ items: [], status: 'idle' })
    expect(state.carts).toMatchObject({ cart: null, loading: false })
    expect(state.orders).toMatchObject({ list: [], current: null })
    expect(state.ui).toEqual({ toasts: [] })
    expect(state.users).toMatchObject({ currentUser: null, token: null, list: [] })
  })
})
