import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchCartThunk = createAsyncThunk(
  'cart/fetch',
  async (customerId, { rejectWithValue }) => {
    const { data } = await axiosClient.get(`/cart/customer/${customerId}`)
    return data
  },
)

export const addItemThunk = createAsyncThunk(
  'cart/addItem',
  async ({ customerId, productId, quantity }, { rejectWithValue }) => {
    const { data } = await axiosClient.post('/cart/items', { customerId, productId, quantity })
    return data
  },
)

export const updateItemThunk = createAsyncThunk(
  'cart/updateItem',
  async ({ cartId, productId, quantity }, { rejectWithValue }) => {
    const { data } = await axiosClient.put(`/cart/${cartId}/items/${productId}`, { quantity })
    return data
  },
)

export const removeItemThunk = createAsyncThunk(
  'cart/removeItem',
  async ({ cartId, productId }, { rejectWithValue }) => {
    const { data } = await axiosClient.delete(`/cart/${cartId}/items/${productId}`)
    return data
  },
)

export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (cartId, { rejectWithValue }) => {
    await axiosClient.delete(`/cart/${cartId}`)
    return null
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetCart(state) {
      state.cart = null
      state.loading = false
      state.error = null
    },
    clearCartError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false
      state.cart = action.payload
      state.error = null
    }
    const setLoading = (state) => {
      state.loading = true
      state.error = null
    }
    const setError = (state, action) => {
      state.loading = false
      state.error = action.payload?.message ?? action.payload
    }

    builder
      .addCase(fetchCartThunk.pending, setLoading)
      .addCase(fetchCartThunk.fulfilled, setCart)
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false
        state.cart = null
        // 404 = no cart yet, not a real error
        if (action.payload) state.error = action.payload?.message ?? action.payload
      })

      .addCase(addItemThunk.pending, setLoading)
      .addCase(addItemThunk.fulfilled, setCart)
      .addCase(addItemThunk.rejected, setError)

      .addCase(updateItemThunk.pending, setLoading)
      .addCase(updateItemThunk.fulfilled, setCart)
      .addCase(updateItemThunk.rejected, setError)

      .addCase(removeItemThunk.pending, setLoading)
      .addCase(removeItemThunk.fulfilled, setCart)
      .addCase(removeItemThunk.rejected, setError)

      .addCase(clearCartThunk.pending, setLoading)
      .addCase(clearCartThunk.fulfilled, setCart)
      .addCase(clearCartThunk.rejected, setError)
  },
})

export const { resetCart, clearCartError } = cartSlice.actions

// ─── Selectors ─────────────────────────────────────────────────────────────

export const selectCart = (state) => state.cart.cart
export const selectCartLoading = (state) => state.cart.loading
export const selectCartError = (state) => state.cart.error
export const selectItemCount = (state) => {
  const cart = state.cart.cart
  if (!cart) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export default cartSlice.reducer
