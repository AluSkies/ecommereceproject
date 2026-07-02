// Slice de la tabla `order_status_history`.
// Scaffold: sin endpoint dedicado consumido por el frontend todavía.
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], status: 'idle', error: null }

const orderStatusHistorySlice = createSlice({
  name: 'orderStatusHistory',
  initialState,
  reducers: {},
})

export default orderStatusHistorySlice.reducer
