// Slice de la tabla `orders`. Thunks = "servicio" sobre /orders.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPatch } from '@/lib/api'

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', () => apiGet('/orders'))
export const fetchOrderById = createAsyncThunk('orders/fetchById', (id) => apiGet(`/orders/${id}`))
export const fetchOrdersByCustomer = createAsyncThunk('orders/fetchByCustomer', (customerId) =>
  apiGet(`/orders/customer/${customerId}`))
export const checkout = createAsyncThunk('orders/checkout', async (payload, { rejectWithValue }) => {
  try {
    return await apiPost('/orders/checkout', payload)
  } catch (err) {
    return rejectWithValue(err) // preserva el ApiError para mostrar el mensaje del backend
  }
})
export const updateOrderStatus = createAsyncThunk('orders/updateStatus', ({ id, status }) =>
  apiPatch(`/orders/${id}/status`, { status }))
export const cancelOrder = createAsyncThunk('orders/cancel', (id) => apiPatch(`/orders/${id}/cancel`))

const initialState = { list: [], current: null, status: 'idle', error: null }

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAllOrders.pending, (s) => { s.status = 'loading'; s.error = null })
    b.addCase(fetchAllOrders.fulfilled, (s, a) => { s.status = 'idle'; s.list = a.payload })
    b.addCase(fetchAllOrders.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message })
    b.addCase(fetchOrdersByCustomer.fulfilled, (s, a) => { s.list = a.payload })
    b.addCase(fetchOrderById.fulfilled, (s, a) => { s.current = a.payload })
    b.addCase(checkout.fulfilled, (s, a) => { s.current = a.payload })
    b.addCase(updateOrderStatus.fulfilled, (s, a) => {
      s.list = s.list.map((o) => (o.id === a.payload?.id ? a.payload : o))
      if (s.current?.id === a.payload?.id) s.current = a.payload
    })
    b.addCase(cancelOrder.fulfilled, (s, a) => {
      s.list = s.list.map((o) => (o.id === a.payload?.id ? a.payload : o))
    })
  },
})

export const selectOrders = (s) => s.orders.list
export const selectCurrentOrder = (s) => s.orders.current

export default ordersSlice.reducer
