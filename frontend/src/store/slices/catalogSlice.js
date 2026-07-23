import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'
import { mapProduct } from '@/lib/productMapper'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchCatalogThunk = createAsyncThunk(
  'catalog/fetch',
  async (_, { getState, rejectWithValue }) => {
    const { loaded } = getState().catalog
    if (loaded) return null // already cached — skip request
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axiosClient.get('/categories'),
        axiosClient.get('/products/active'),
      ])
      const categories = categoriesRes.data
      const products = productsRes.data
      const byCode = new Map(categories.map((c) => [c.code, c]))
      const watches = products.map((p) => mapProduct(p, byCode))
      return { watches, categories }
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const refreshCatalogThunk = createAsyncThunk(
  'catalog/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axiosClient.get('/categories'),
        axiosClient.get('/products/active'),
      ])
      const categories = categoriesRes.data
      const products = productsRes.data
      const byCode = new Map(categories.map((c) => [c.code, c]))
      const watches = products.map((p) => mapProduct(p, byCode))
      return { watches, categories }
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    watches: [],
    categories: [],
    loaded: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearCatalogCache(state) {
      state.loaded = false
      state.watches = []
      state.categories = []
    },
  },
  extraReducers: (builder) => {
    const handleFulfilled = (state, action) => {
      state.loading = false
      state.error = null
      if (action.payload) {
        state.watches = action.payload.watches
        state.categories = action.payload.categories
        state.loaded = true
      }
    }

    builder
      .addCase(fetchCatalogThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCatalogThunk.fulfilled, handleFulfilled)
      .addCase(fetchCatalogThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message ?? action.payload
      })

      .addCase(refreshCatalogThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(refreshCatalogThunk.fulfilled, handleFulfilled)
      .addCase(refreshCatalogThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message ?? action.payload
      })
  },
})

export const { clearCatalogCache } = catalogSlice.actions

// ─── Selectors ─────────────────────────────────────────────────────────────

export const selectWatches = (state) => state.catalog.watches
export const selectCategories = (state) => state.catalog.categories
export const selectCatalogLoading = (state) => state.catalog.loading
export const selectCatalogError = (state) => state.catalog.error
export const selectCatalogLoaded = (state) => state.catalog.loaded

export default catalogSlice.reducer
