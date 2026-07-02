import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchCategoriesThunk = createAsyncThunk(
  'categories/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/categories')
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchCategoryByIdThunk = createAsyncThunk(
  'categories/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/categories/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const createCategoryThunk = createAsyncThunk(
  'categories/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/categories', payload)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const updateCategoryThunk = createAsyncThunk(
  'categories/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/categories/${id}`, payload)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const deleteCategoryThunk = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/categories/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    currentCategory: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentCategory(state) {
      state.currentCategory = null
    },
    clearCategoriesError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(fetchCategoriesThunk.pending, pending)
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchCategoriesThunk.rejected, rejected)

      .addCase(fetchCategoryByIdThunk.pending, pending)
      .addCase(fetchCategoryByIdThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentCategory = action.payload
      })
      .addCase(fetchCategoryByIdThunk.rejected, rejected)

      .addCase(createCategoryThunk.pending, pending)
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.loading = false
        state.categories.push(action.payload)
      })
      .addCase(createCategoryThunk.rejected, rejected)

      .addCase(updateCategoryThunk.pending, pending)
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.categories.findIndex((c) => c.id === action.payload.id)
        if (idx !== -1) state.categories[idx] = action.payload
        state.currentCategory = action.payload
      })
      .addCase(updateCategoryThunk.rejected, rejected)

      .addCase(deleteCategoryThunk.pending, pending)
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.loading = false
        state.categories = state.categories.filter((c) => c.id !== action.payload)
        if (state.currentCategory?.id === action.payload) state.currentCategory = null
      })
      .addCase(deleteCategoryThunk.rejected, rejected)
  },
})

export const { clearCurrentCategory, clearCategoriesError } = categoriesSlice.actions

export const selectCategories = (state) => state.categories.categories
export const selectCurrentCategory = (state) => state.categories.currentCategory
export const selectCategoriesLoading = (state) => state.categories.loading
export const selectCategoriesError = (state) => state.categories.error

export default categoriesSlice.reducer
