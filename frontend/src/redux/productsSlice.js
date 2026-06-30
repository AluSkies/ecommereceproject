import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, ApiError } from '@/lib/api'
import { mapProduct } from '@/lib/productMapper'

export const fetchCatalogData = createAsyncThunk(
  'products/fetchCatalogData',
  async (_, { rejectWithValue }) => {
    try {
      const [categories, products] = await Promise.all([
        apiGet('/categories'),
        apiGet('/products/active'),
      ])
      const byCode = new Map(categories.map((c) => [c.code, c]))
      const watches = products.map((p) => mapProduct(p, byCode))
      return { watches, categories }
    } catch (err) {
      return rejectWithValue(
        err instanceof ApiError ? err.message : 'Error al cargar el catálogo de productos.'
      )
    }
  }
)

export const fetchLowStock = createAsyncThunk(
  'products/fetchLowStock',
  async (threshold, { rejectWithValue }) => {
    try {
      const data = await apiGet(`/products/inventory/low-stock?threshold=${threshold}`)
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo cargar el stock bajo.')
    }
  }
)

export const fetchOutOfStock = createAsyncThunk(
  'products/fetchOutOfStock',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet('/products/inventory/out-of-stock')
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo cargar el stock agotado.')
    }
  }
)

const initialState = {
  // Public catalog state
  watches: [],
  loading: false,
  error: null,

  // Admin inventory state
  threshold: 10,
  lowStock: [],
  outOfStock: [],
  loadingLow: false,
  loadingOut: false,
  errorLow: null,
  errorOut: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setThreshold(state, action) {
      state.threshold = action.payload
    },
    clearCatalogCache(state) {
      state.watches = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCatalogData
      .addCase(fetchCatalogData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCatalogData.fulfilled, (state, action) => {
        state.loading = false
        state.watches = action.payload.watches
      })
      .addCase(fetchCatalogData.rejected, (state, action) => {
        state.loading = false
        state.watches = []
        state.error = action.payload
      })
      // fetchLowStock
      .addCase(fetchLowStock.pending, (state) => {
        state.loadingLow = true
        state.errorLow = null
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.loadingLow = false
        state.lowStock = action.payload
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.loadingLow = false
        state.errorLow = action.payload
      })
      // fetchOutOfStock
      .addCase(fetchOutOfStock.pending, (state) => {
        state.loadingOut = true
        state.errorOut = null
      })
      .addCase(fetchOutOfStock.fulfilled, (state, action) => {
        state.loadingOut = false
        state.outOfStock = action.payload
      })
      .addCase(fetchOutOfStock.rejected, (state, action) => {
        state.loadingOut = false
        state.errorOut = action.payload
      })
  },
})

export const { setThreshold, clearCatalogCache } = productsSlice.actions
export default productsSlice.reducer
