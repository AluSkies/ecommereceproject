import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchDiscountsThunk = createAsyncThunk(
  'discounts/fetch',
  async (path, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(path ?? '/discounts')
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const fetchDiscountByCodeThunk = createAsyncThunk(
  'discounts/fetchByCode',
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/discounts/code/${encodeURIComponent(code)}`)
      return data
    } catch (err) {
      if (err.status === 404) return null
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const fetchDiscountByIdThunk = createAsyncThunk(
  'discounts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/discounts/${id}`)
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const createDiscountThunk = createAsyncThunk(
  'discounts/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/discounts', payload)
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const updateDiscountThunk = createAsyncThunk(
  'discounts/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/discounts/${id}`, payload)
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const toggleDiscountThunk = createAsyncThunk(
  'discounts/toggle',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.patch(`/discounts/${id}/${action}`, {})
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

export const deleteDiscountThunk = createAsyncThunk(
  'discounts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/discounts/${id}`)
      return id
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status ?? null })
    }
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const discountsSlice = createSlice({
  name: 'discounts',
  initialState: {
    discounts: [],
    currentDiscount: null,
    appliedDiscount: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAppliedDiscount(state) {
      state.appliedDiscount = null
    },
    clearDiscountsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload?.message ?? action.payload }

    builder
      .addCase(fetchDiscountsThunk.pending, pending)
      .addCase(fetchDiscountsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.discounts = action.payload
      })
      .addCase(fetchDiscountsThunk.rejected, rejected)

      .addCase(fetchDiscountByCodeThunk.pending, pending)
      .addCase(fetchDiscountByCodeThunk.fulfilled, (state, action) => {
        state.loading = false
        state.appliedDiscount = action.payload
      })
      .addCase(fetchDiscountByCodeThunk.rejected, rejected)

      .addCase(fetchDiscountByIdThunk.pending, pending)
      .addCase(fetchDiscountByIdThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentDiscount = action.payload
      })
      .addCase(fetchDiscountByIdThunk.rejected, rejected)

      .addCase(createDiscountThunk.pending, pending)
      .addCase(createDiscountThunk.fulfilled, (state, action) => {
        state.loading = false
        state.discounts.push(action.payload)
      })
      .addCase(createDiscountThunk.rejected, rejected)

      .addCase(updateDiscountThunk.pending, pending)
      .addCase(updateDiscountThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentDiscount = action.payload
      })
      .addCase(updateDiscountThunk.rejected, rejected)

      .addCase(toggleDiscountThunk.pending, pending)
      .addCase(toggleDiscountThunk.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.discounts.findIndex((d) => d.id === action.payload.id)
        if (idx !== -1) state.discounts[idx] = action.payload
      })
      .addCase(toggleDiscountThunk.rejected, rejected)

      .addCase(deleteDiscountThunk.pending, pending)
      .addCase(deleteDiscountThunk.fulfilled, (state, action) => {
        state.loading = false
        state.discounts = state.discounts.filter((d) => d.id !== action.payload)
      })
      .addCase(deleteDiscountThunk.rejected, rejected)
  },
})

export const { clearAppliedDiscount, clearDiscountsError } = discountsSlice.actions

export const selectDiscounts = (state) => state.discounts.discounts
export const selectCurrentDiscount = (state) => state.discounts.currentDiscount
export const selectAppliedDiscount = (state) => state.discounts.appliedDiscount
export const selectDiscountsLoading = (state) => state.discounts.loading
export const selectDiscountsError = (state) => state.discounts.error

export default discountsSlice.reducer
