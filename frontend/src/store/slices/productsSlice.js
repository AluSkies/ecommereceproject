import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchProductByIdThunk = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
      const { data } = await axiosClient.get(`/products/${id}`)
      return data
  },
)

export const fetchLowStockThunk = createAsyncThunk(
  'products/fetchLowStock',
  async (threshold = 5, { rejectWithValue }) => {
      const { data } = await axiosClient.get(`/products/inventory/low-stock?threshold=${threshold}`)
      return data
  },
)

export const fetchOutOfStockThunk = createAsyncThunk(
  'products/fetchOutOfStock',
  async (_, { rejectWithValue }) => {
      const { data } = await axiosClient.get('/products/inventory/out-of-stock')
      return data
  },
)

export const createProductThunk = createAsyncThunk(
  'products/create',
  async (payload, { rejectWithValue }) => {
      const { data } = await axiosClient.post('/products', payload)
      return data
  },
)

export const updateProductThunk = createAsyncThunk(
  'products/update',
  async ({ id, payload }, { rejectWithValue }) => {
      const { data } = await axiosClient.put(`/products/${id}`, payload)
      return data
  },
)

export const updateProductStatusThunk = createAsyncThunk(
  'products/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
      const { data } = await axiosClient.patch(`/products/${id}/status?status=${status}`, {})
      return data
  },
)

export const deleteProductThunk = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
      await axiosClient.delete(`/products/${id}`)
    return id
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    inventory: [],
    currentProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct(state) {
      state.currentProduct = null
    },
    clearProductsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload?.message ?? action.payload }

    builder
      .addCase(fetchProductByIdThunk.pending, pending)
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductByIdThunk.rejected, rejected)

      .addCase(fetchLowStockThunk.pending, pending)
      .addCase(fetchLowStockThunk.fulfilled, (state, action) => {
        state.loading = false
        state.inventory = action.payload
      })
      .addCase(fetchLowStockThunk.rejected, rejected)

      .addCase(fetchOutOfStockThunk.pending, pending)
      .addCase(fetchOutOfStockThunk.fulfilled, (state, action) => {
        state.loading = false
        state.inventory = action.payload
      })
      .addCase(fetchOutOfStockThunk.rejected, rejected)

      .addCase(createProductThunk.pending, pending)
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(createProductThunk.rejected, rejected)

      .addCase(updateProductThunk.pending, pending)
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(updateProductThunk.rejected, rejected)

      .addCase(updateProductStatusThunk.pending, pending)
      .addCase(updateProductStatusThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(updateProductStatusThunk.rejected, rejected)

      .addCase(deleteProductThunk.pending, pending)
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.loading = false
        state.inventory = state.inventory.filter((p) => p.id !== action.payload)
        if (state.currentProduct?.id === action.payload) state.currentProduct = null
      })
      .addCase(deleteProductThunk.rejected, rejected)
  },
})

export const { clearCurrentProduct, clearProductsError } = productsSlice.actions

export const selectInventory = (state) => state.products.inventory
export const selectCurrentProduct = (state) => state.products.currentProduct
export const selectProductsLoading = (state) => state.products.loading
export const selectProductsError = (state) => state.products.error

export default productsSlice.reducer
