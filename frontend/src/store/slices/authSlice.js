import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

const TOKEN_KEY = 'tempus.token'
const USER_KEY = 'tempus.user'

function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

// ─── Thunks ────────────────────────────────────────────────────────────────
// localStorage ya no se toca aquí — lo maneja store.subscribe() en store.js.

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
      const { data } = await axiosClient.post('/auth/login', { username, password })
      return data // { token, user }
  },
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    const { data } = await axiosClient.post('/auth/register', payload)
    return data // { token, user }
  },
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    await axiosClient.post('/auth/logout')
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUser(),
    token: localStorage.getItem(TOKEN_KEY),
    loading: false,
    error: null,
  },
  reducers: {
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setSession = (state, action) => {
      state.loading = false
      state.token = action.payload.token
      state.user = action.payload.user
      state.error = null
    }

    builder
      // login
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginThunk.fulfilled, setSession)
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message ?? action.payload?.message ?? action.error.message
      })

      // register
      .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerThunk.fulfilled, setSession)
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message ?? action.payload?.message ?? action.error.message
      })

      // logout
      .addCase(logoutThunk.pending, (state) => { state.loading = true })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false
        state.token = null
        state.user = null
        state.error = null
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false
        state.token = null
        state.user = null
      })
  },
})

export const { updateUser, clearError } = authSlice.actions

// ─── Selectors ─────────────────────────────────────────────────────────────

export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN'
export const selectIsSlayer = (state) => state.auth.user?.role === 'DOOM_SLAYER'
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
