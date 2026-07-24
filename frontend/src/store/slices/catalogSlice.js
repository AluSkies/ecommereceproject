import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'
import { mapProduct } from '@/lib/productMapper'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchCatalogThunk = createAsyncThunk(
  'catalog/fetch',
  async () => {
    const [categoriesRes, productsRes] = await Promise.all([
      axiosClient.get('/categories'),
      axiosClient.get('/products/active'),
    ])
    const categories = categoriesRes.data
    const products = productsRes.data
    const byCode = new Map(categories.map((c) => [c.code, c]))
    const watches = products.map((p) => mapProduct(p, byCode))
    return { watches, categories }
  },
  {
    // Se evalúa ANTES de despachar `pending`, así que ni siquiera aparece en
    // DevTools cuando se descarta. `loading` corta la ráfaga de dispatches del
    // mismo tick (varios hooks de catálogo + doble montaje de StrictMode).
    condition: (_, { getState }) => {
      const { loaded, loading } = getState().catalog
      return !loaded && !loading
    },
  },
)

export const refreshCatalogThunk = createAsyncThunk(
  'catalog/refresh',
  async (_, { rejectWithValue }) => {
      const [categoriesRes, productsRes] = await Promise.all([
        axiosClient.get('/categories'),
        axiosClient.get('/products/active'),
      ])
      const categories = categoriesRes.data
      const products = productsRes.data
      const byCode = new Map(categories.map((c) => [c.code, c]))
      const watches = products.map((p) => mapProduct(p, byCode))
      return { watches, categories }
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
