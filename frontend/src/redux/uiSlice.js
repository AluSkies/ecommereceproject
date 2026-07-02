// Slice de UI (toasts). Única slice que NO mapea a una tabla: existe porque la
// migración completa reemplaza ToastProvider. El timer de auto-cierre lo maneja
// el componente <Toaster/> (components/ui/Toaster.jsx).
import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = { toasts: [] }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload)
      },
      prepare({ message, type = 'success', duration = 3000 }) {
        return { payload: { id: nanoid(), message, type, duration } }
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions

export const selectToasts = (s) => s.ui.toasts

export default uiSlice.reducer
