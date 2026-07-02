import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchCustomerOrdersThunk = createAsyncThunk(
  'orders/fetchByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/orders/customer/${customerId}`)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchOrderByIdThunk = createAsyncThunk(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/orders/${orderId}`)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchAllOrdersThunk = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/orders')
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const checkoutThunk = createAsyncThunk(
  'orders/checkout',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/orders/checkout', payload)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status, note }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.patch(`/orders/${orderId}/status`, { status, note })
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null
    },
    clearOrdersError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(fetchCustomerOrdersThunk.pending, pending)
      .addCase(fetchCustomerOrdersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchCustomerOrdersThunk.rejected, rejected)

      .addCase(fetchAllOrdersThunk.pending, pending)
      .addCase(fetchAllOrdersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchAllOrdersThunk.rejected, rejected)

      .addCase(fetchOrderByIdThunk.pending, pending)
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderByIdThunk.rejected, rejected)

      .addCase(checkoutThunk.pending, pending)
      .addCase(checkoutThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(checkoutThunk.rejected, rejected)

      .addCase(updateOrderStatusThunk.pending, pending)
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.orders.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.orders[idx] = action.payload
      })
      .addCase(updateOrderStatusThunk.rejected, rejected)
  },
})

export const { clearCurrentOrder, clearOrdersError } = ordersSlice.actions

export const selectOrders = (state) => state.orders.orders
export const selectCurrentOrder = (state) => state.orders.currentOrder
export const selectOrdersLoading = (state) => state.orders.loading
export const selectOrdersError = (state) => state.orders.error

export default ordersSlice.reducer
