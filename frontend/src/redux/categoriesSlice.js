import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api'
import { fetchCatalogData, clearCatalogCache } from './productsSlice'

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet('/categories')
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Error al cargar las categorías.')
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async ({ id, description }, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiPost('/categories', { id, description })
      dispatch(fetchCategories())
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo crear la categoría.')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, description }, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiPut(`/categories/${id}`, { id, description })
      dispatch(fetchCategories())
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo actualizar la categoría.')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/categories/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría.')
    }
  }
)

const initialState = {
  // Public catalog categories and Admin categories list (share list)
  categories: [],
  loading: false,
  error: null,
  actionError: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearActionError(state) {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // listen to fetchCatalogData from productsSlice
      .addCase(fetchCatalogData.fulfilled, (state, action) => {
        state.categories = action.payload.categories
      })
      // listen to clearCatalogCache from productsSlice
      .addCase(clearCatalogCache, (state) => {
        state.categories = []
      })
      // createCategory
      .addCase(createCategory.pending, (state) => {
        state.actionError = null
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.actionError = action.payload
      })
      // updateCategory
      .addCase(updateCategory.pending, (state) => {
        state.actionError = null
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionError = action.payload
      })
      // deleteCategory
      .addCase(deleteCategory.pending, (state) => {
        state.actionError = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionError = action.payload
      })
  },
})

export const { clearActionError } = categoriesSlice.actions
export default categoriesSlice.reducer
