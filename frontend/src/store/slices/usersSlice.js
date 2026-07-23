import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchMeThunk = createAsyncThunk(
  'users/fetchMe',
  async (_, { rejectWithValue }) => {
      const { data } = await axiosClient.get('/users/me')
    return data
  },
)

export const fetchAllUsersThunk = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
      const { data } = await axiosClient.get('/users')
    return data
  },
)

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async ({ id, payload }, { rejectWithValue }) => {
      const { data } = await axiosClient.put(`/users/${id}`, payload)
    return data
  },
)

export const disableUserThunk = createAsyncThunk(
  'users/disable',
  async (id, { rejectWithValue }) => {
      const { data } = await axiosClient.patch(`/users/${id}/disable`, {})
    return data
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
    const rejected = (state, action) => { state.loading = false; state.error = action.payload?.message ?? action.payload }

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
