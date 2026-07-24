import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

// El token tiene que existir ANTES de importar el store: authSlice lee
// localStorage al construir su initialState.
localStorage.setItem('tempus.token', 'token-vencido')
localStorage.setItem('tempus.user', JSON.stringify({ id: 7, username: 'moura' }))

const axiosClient = (await import('../axiosClient')).default
const { setUnauthorizedHandler } = await import('../axiosClient')
const cartReducer = (await import('./cartSlice')).default
const { fetchCartThunk } = await import('./cartSlice')

const realAdapter = axiosClient.defaults.adapter

/** Adapter falso: `routes` mapea un fragmento de URL a { status, data }. */
function mockRoutes(routes) {
  axiosClient.defaults.adapter = async (config) => {
    const match = Object.keys(routes).find((k) => config.url.includes(k))
    const { status, data } = routes[match] ?? { status: 404, data: {} }
    if (status >= 400) {
      const err = new Error(`Request failed with status code ${status}`)
      err.response = { status, data }
      err.config = config
      throw err
    }
    return { status, data, config, headers: {}, statusText: '' }
  }
}

const cartStore = () => configureStore({ reducer: { cart: cartReducer } })

beforeEach(() => setUnauthorizedHandler(null))
afterAll(() => {
  axiosClient.defaults.adapter = realAdapter
})

describe('errores del carrito que llegan al estado', () => {
  it('expone el mensaje del backend en vez de tragárselo', async () => {
    mockRoutes({ '/cart/customer': { status: 500, data: { message: 'Explotó el server' } } })
    const store = cartStore()
    await store.dispatch(fetchCartThunk(7))
    expect(store.getState().cart.error).toBe('Explotó el server')
  })

  it('trata el 204 sin carrito como éxito, no como error', async () => {
    mockRoutes({ '/cart/customer': { status: 204, data: '' } })
    const store = cartStore()
    await store.dispatch(fetchCartThunk(7))
    expect(store.getState().cart.cart).toBeNull()
    expect(store.getState().cart.error).toBeNull()
  })
})

describe('interceptor 401', () => {
  it('avisa cuando un 401 llega fuera del login', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    mockRoutes({ '/cart/customer': { status: 401, data: { message: 'no autorizado' } } })
    await cartStore().dispatch(fetchCartThunk(7))
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('NO desloguea si el 401 viene del propio login', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    mockRoutes({ '/auth/login': { status: 401, data: { message: 'Credenciales inválidas' } } })
    await expect(axiosClient.post('/auth/login', {})).rejects.toThrow('Credenciales inválidas')
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('ignora un 403 (autenticado pero sin permiso)', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    mockRoutes({ '/cart/customer': { status: 403, data: { message: 'prohibido' } } })
    await cartStore().dispatch(fetchCartThunk(7))
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

describe('cableado real de store.js', () => {
  it('un 401 limpia la sesión y borra localStorage', async () => {
    const store = (await import('../store')).default
    expect(store.getState().auth.token).toBe('token-vencido')

    mockRoutes({ '/cart/customer': { status: 401, data: { message: 'no autorizado' } } })
    await store.dispatch(fetchCartThunk(7))

    expect(store.getState().auth.token).toBeNull()
    expect(store.getState().auth.user).toBeNull()
    expect(localStorage.getItem('tempus.token')).toBeNull()
    expect(localStorage.getItem('tempus.user')).toBeNull()
  })
})
