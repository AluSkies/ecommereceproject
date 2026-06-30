import { createSlice } from '@reduxjs/toolkit'

let nextId = 0

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast(state, action) {
      const { message, type = 'success', duration = 3000 } = action.payload
      const id = ++nextId
      state.toasts.push({ id, message, type, duration })
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
