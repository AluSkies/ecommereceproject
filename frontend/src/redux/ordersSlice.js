import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPatch, ApiError } from '@/lib/api'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const list = await apiGet('/orders')
      const sorted = [...list].sort((a, b) => {
        const ta = new Date(a.placedAt ?? a.createdAt ?? 0).getTime()
        const tb = new Date(b.placedAt ?? b.createdAt ?? 0).getTime()
        return tb - ta
      })
      return sorted
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes')
    }
  }
)

export const changeOrderStatus = createAsyncThunk(
  'orders/changeOrderStatus',
  async ({ orderId, status, changedBy }, { rejectWithValue, dispatch }) => {
    try {
      await apiPatch(`/orders/${orderId}/status`, {
        status,
        note: `Estado actualizado a ${status} por el administrador`,
        changedBy,
      })
      dispatch(fetchOrders())
      return orderId
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Error al actualizar el estado de la orden.')
    }
  }
)

const initialState = {
  orders: [],
  loading: false,
  error: null,
  updatingId: null,
  actionError: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearActionError(state) {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // changeOrderStatus
      .addCase(changeOrderStatus.pending, (state, action) => {
        state.updatingId = action.meta.arg.orderId
        state.actionError = null
      })
      .addCase(changeOrderStatus.fulfilled, (state) => {
        state.updatingId = null
      })
      .addCase(changeOrderStatus.rejected, (state, action) => {
        state.updatingId = null
        state.actionError = action.payload
      })
  },
})

export const { clearActionError } = ordersSlice.actions
export default ordersSlice.reducer
