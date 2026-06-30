import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPatch, apiDelete, ApiError } from '@/lib/api'

const FILTER_PATHS = {
  all: '/discounts',
  valid: '/discounts/active/valid',
  active: '/discounts/status/ACTIVE',
  expired: '/discounts/expired',
  scheduled: '/discounts/scheduled',
}

export const fetchDiscounts = createAsyncThunk(
  'discounts/fetchDiscounts',
  async (filter, { rejectWithValue }) => {
    try {
      const path = FILTER_PATHS[filter] || FILTER_PATHS.all
      const data = await apiGet(path)
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Error al cargar los cupones.')
    }
  }
)

export const toggleDiscountStatus = createAsyncThunk(
  'discounts/toggleDiscountStatus',
  async (discount, { rejectWithValue, dispatch, getState }) => {
    try {
      const isCurrentlyActive = discount.status === 'ACTIVE' || discount.active
      const action = isCurrentlyActive ? 'deactivate' : 'activate'
      await apiPatch(`/discounts/${discount.id}/${action}`, {})
      const filter = getState().discounts.filter
      dispatch(fetchDiscounts(filter))
      return discount.id
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado del cupón.')
    }
  }
)

export const deleteDiscount = createAsyncThunk(
  'discounts/deleteDiscount',
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/discounts/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(
        err instanceof ApiError
          ? err.message
          : 'No se pudo eliminar el cupón. Si ya fue usado en una venta, te recomendamos desactivarlo.'
      )
    }
  }
)

const initialState = {
  discounts: [],
  filter: 'all',
  loading: false,
  error: null,
  actionError: null,
}

const discountsSlice = createSlice({
  name: 'discounts',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload
    },
    clearActionError(state) {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDiscounts
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.discounts = action.payload
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // toggleDiscountStatus
      .addCase(toggleDiscountStatus.pending, (state) => {
        state.actionError = null
      })
      .addCase(toggleDiscountStatus.fulfilled, (state, action) => {
        state.discounts = state.discounts.map((d) => {
          if (d.id === action.payload) {
            const isCurrentlyActive = d.status === 'ACTIVE' || d.active
            return {
              ...d,
              status: isCurrentlyActive ? 'DISABLED' : 'ACTIVE',
              active: !isCurrentlyActive,
            }
          }
          return d
        })
      })
      .addCase(toggleDiscountStatus.rejected, (state, action) => {
        state.actionError = action.payload
      })
      // deleteDiscount
      .addCase(deleteDiscount.pending, (state) => {
        state.actionError = null
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter((d) => d.id !== action.payload)
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.actionError = action.payload
      })
  },
})

export const { setFilter, clearActionError } = discountsSlice.actions
export default discountsSlice.reducer
