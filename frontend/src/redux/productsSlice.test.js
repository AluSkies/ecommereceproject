import { describe, it, expect } from 'vitest'
import reducer, { fetchActiveProducts, updateProduct, selectProducts } from './productsSlice'

describe('productsSlice', () => {
  it('fetchActiveProducts: pending -> fulfilled llena items y vuelve a idle', () => {
    let state = reducer(undefined, { type: fetchActiveProducts.pending.type })
    expect(state.status).toBe('loading')
    state = reducer(state, { type: fetchActiveProducts.fulfilled.type, payload: [{ id: 1 }, { id: 2 }] })
    expect(state.status).toBe('idle')
    expect(state.items).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('fetchActiveProducts.rejected marca error', () => {
    const state = reducer(undefined, { type: fetchActiveProducts.rejected.type, error: { message: 'boom' } })
    expect(state.status).toBe('error')
    expect(state.error).toBe('boom')
  })

  it('updateProduct.fulfilled reemplaza el producto en items', () => {
    const start = { items: [{ id: 1, name: 'A' }], current: null, lowStock: [], outOfStock: [], status: 'idle', error: null }
    const state = reducer(start, { type: updateProduct.fulfilled.type, payload: { id: 1, name: 'B' } })
    expect(state.items).toEqual([{ id: 1, name: 'B' }])
  })

  it('selectProducts lee items', () => {
    expect(selectProducts({ products: { items: [1, 2] } })).toEqual([1, 2])
  })
})
