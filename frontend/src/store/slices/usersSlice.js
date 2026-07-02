import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchMeThunk = createAsyncThunk(
  'users/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/users/me')
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchAllUsersThunk = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/users')
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/users/${id}`, payload)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const disableUserThunk = createAsyncThunk(
  'users/disable',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.patch(`/users/${id}/disable`, {})
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUsersError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(fetchMeThunk.pending, pending)
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchMeThunk.rejected, rejected)

      .addCase(fetchAllUsersThunk.pending, pending)
      .addCase(fetchAllUsersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchAllUsersThunk.rejected, rejected)

      .addCase(updateUserThunk.pending, pending)
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(updateUserThunk.rejected, rejected)

      .addCase(disableUserThunk.pending, pending)
      .addCase(disableUserThunk.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.users.findIndex((u) => u.id === action.payload.id)
        if (idx !== -1) state.users[idx] = action.payload
      })
      .addCase(disableUserThunk.rejected, rejected)
  },
})

export const { clearUsersError } = usersSlice.actions

export const selectUsers = (state) => state.users.users
export const selectProfile = (state) => state.users.profile
export const selectUsersLoading = (state) => state.users.loading
export const selectUsersError = (state) => state.users.error

export default usersSlice.reducer
