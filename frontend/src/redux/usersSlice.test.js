import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import reducer, {
  login, logout, userUpdated,
  selectIsAdmin, selectIsAuthenticated, selectCurrentUser,
} from './usersSlice'
import { makeStore } from './store'
import { ApiError } from '@/lib/api'

describe('usersSlice reducer', () => {
  it('login.fulfilled guarda token + usuario', () => {
    const state = reducer(undefined, {
      type: login.fulfilled.type,
      payload: { token: 't', user: { id: 1, role: 'ADMIN' } },
    })
    expect(state.token).toBe('t')
    expect(state.currentUser).toEqual({ id: 1, role: 'ADMIN' })
  })

  it('logout.fulfilled limpia la sesión', () => {
    const start = { token: 't', currentUser: { id: 1 }, list: [{}], status: 'idle', error: null }
    const state = reducer(start, { type: logout.fulfilled.type })
    expect(state.token).toBeNull()
    expect(state.currentUser).toBeNull()
    expect(state.list).toEqual([])
  })

  it('userUpdated mergea sobre el usuario actual', () => {
    const state = reducer({ currentUser: { id: 1, firstName: 'A' } }, userUpdated({ firstName: 'B' }))
    expect(state.currentUser).toEqual({ id: 1, firstName: 'B' })
  })

  it('selectores de rol / sesión', () => {
    expect(selectIsAdmin({ users: { currentUser: { role: 'ADMIN' } } })).toBe(true)
    expect(selectIsAdmin({ users: { currentUser: { role: 'BUYER' } } })).toBe(false)
    expect(selectIsAuthenticated({ users: { token: 't' } })).toBe(true)
    expect(selectCurrentUser({ users: { currentUser: { id: 9 } } })).toEqual({ id: 9 })
  })
})

describe('login thunk contra el store (fetch mockeado)', () => {
  const originalFetch = global.fetch
  beforeEach(() => { global.fetch = vi.fn(); localStorage.clear() })
  afterEach(() => { global.fetch = originalFetch })

  it('login exitoso actualiza el store y persiste el token en localStorage', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt', user: { id: 2, role: 'BUYER' } }),
    })
    const store = makeStore()
    await store.dispatch(login({ username: 'buyer1@tempus.local', password: 'buyer123' }))

    expect(store.getState().users.currentUser).toMatchObject({ id: 2, role: 'BUYER' })
    expect(store.getState().users.token).toBe('jwt')
    expect(localStorage.getItem('tempus.token')).toBe('jwt')
  })

  it('login 401 rechaza preservando el ApiError (status/body accesibles por la UI)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })
    const store = makeStore()
    const result = await store.dispatch(login({ username: 'x', password: 'y' }))

    expect(login.rejected.match(result)).toBe(true)
    expect(result.payload).toBeInstanceOf(ApiError)
    expect(result.payload.status).toBe(401)
    // el estado no guarda el ApiError, solo el mensaje (queda serializable)
    expect(store.getState().users.error).toBe('Unauthorized')
  })
})
