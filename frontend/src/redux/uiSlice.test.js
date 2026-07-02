import { describe, it, expect } from 'vitest'
import reducer, { addToast, removeToast, selectToasts } from './uiSlice'

describe('uiSlice (toasts)', () => {
  it('addToast agrega un toast con id generado y tipo por defecto', () => {
    const state = reducer(undefined, addToast({ message: 'Guardado' }))
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0]).toMatchObject({ message: 'Guardado', type: 'success', duration: 3000 })
    expect(state.toasts[0].id).toBeTruthy()
  })

  it('removeToast elimina por id', () => {
    let state = reducer(undefined, addToast({ message: 'x', type: 'error' }))
    const id = state.toasts[0].id
    state = reducer(state, removeToast(id))
    expect(state.toasts).toHaveLength(0)
  })

  it('selectToasts lee la lista del estado', () => {
    expect(selectToasts({ ui: { toasts: [{ id: 1 }] } })).toEqual([{ id: 1 }])
  })
})
