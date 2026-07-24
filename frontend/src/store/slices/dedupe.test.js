import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

vi.mock('../axiosClient', () => ({
  default: { get: vi.fn() },
}))

const axiosClient = (await import('../axiosClient')).default
const catalogReducer = (await import('./catalogSlice')).default
const { fetchCatalogThunk } = await import('./catalogSlice')
const cartReducer = (await import('./cartSlice')).default
const { fetchCartThunk } = await import('./cartSlice')

const makeStore = () =>
  configureStore({ reducer: { catalog: catalogReducer, cart: cartReducer } })

beforeEach(() => {
  axiosClient.get.mockReset()
  axiosClient.get.mockResolvedValue({ data: [] })
})

describe('fetchCatalogThunk dedupe', () => {
  it('collapses a concurrent burst into a single fetch', async () => {
    const store = makeStore()
    // Lo que dispara ProductDetail: 2 hooks de catálogo x 2 montajes de StrictMode
    await Promise.all([
      store.dispatch(fetchCatalogThunk()),
      store.dispatch(fetchCatalogThunk()),
      store.dispatch(fetchCatalogThunk()),
      store.dispatch(fetchCatalogThunk()),
    ])
    // 1 fetch = 2 GET (/categories + /products/active)
    expect(axiosClient.get).toHaveBeenCalledTimes(2)
    expect(store.getState().catalog.loaded).toBe(true)
  })

  it('does not refetch once cached', async () => {
    const store = makeStore()
    await store.dispatch(fetchCatalogThunk())
    await store.dispatch(fetchCatalogThunk())
    expect(axiosClient.get).toHaveBeenCalledTimes(2)
  })
})

describe('fetchCartThunk dedupe', () => {
  it('collapses concurrent fetches for the same customer', async () => {
    const store = makeStore()
    await Promise.all([
      store.dispatch(fetchCartThunk(7)),
      store.dispatch(fetchCartThunk(7)),
    ])
    expect(axiosClient.get).toHaveBeenCalledTimes(1)
    expect(axiosClient.get).toHaveBeenCalledWith('/cart/customer/7')
  })

  it('still fetches a different customer while one is in flight', async () => {
    const store = makeStore()
    await Promise.all([
      store.dispatch(fetchCartThunk(7)),
      store.dispatch(fetchCartThunk(9)),
    ])
    expect(axiosClient.get).toHaveBeenCalledTimes(2)
    expect(axiosClient.get).toHaveBeenCalledWith('/cart/customer/9')
  })

  it('allows a refresh after the previous fetch settles', async () => {
    const store = makeStore()
    await store.dispatch(fetchCartThunk(7))
    await store.dispatch(fetchCartThunk(7))
    expect(axiosClient.get).toHaveBeenCalledTimes(2)
  })
})
