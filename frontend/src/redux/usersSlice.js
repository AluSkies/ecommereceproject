import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiPost, apiGet, apiPatch, getStoredToken, setStoredToken, ApiError } from '@/lib/api'

const USER_STORAGE_KEY = 'tempus.user'

function loadStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Authentication Thunks
export const loginUser = createAsyncThunk(
  'users/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await apiPost('/auth/login', { username, password })
      setStoredToken(res.token)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user))
      return res
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Error al iniciar sesión.')
    }
  }
)

export const registerUser = createAsyncThunk(
  'users/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiPost('/auth/register', payload)
      setStoredToken(res.token)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user))
      return res
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Error al registrarse.')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'users/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await apiPost('/auth/logout', {})
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        console.warn('Logout request failed', err)
      }
    } finally {
      setStoredToken(null)
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }
)

// Admin Users Thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet('/users')
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios.')
    }
  }
)

export const disableUser = createAsyncThunk(
  'users/disableUser',
  async (id, { rejectWithValue }) => {
    try {
      await apiPatch(`/users/${id}/disable`, {})
      return id
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo deshabilitar el usuario.')
    }
  }
)

const initialState = {
  // Auth state
  user: loadStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  loading: false,
  error: null,

  // Admin users list state
  users: [],
  loadingUsers: false,
  errorUsers: null,
  disablingId: null,
  actionError: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateStoredUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user))
    },
    clearAuthError(state) {
      state.error = null
    },
    clearActionError(state) {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loadingUsers = true
        state.errorUsers = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loadingUsers = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loadingUsers = false
        state.errorUsers = action.payload
      })
      // disableUser
      .addCase(disableUser.pending, (state, action) => {
        state.disablingId = action.meta.arg
        state.actionError = null
      })
      .addCase(disableUser.fulfilled, (state, action) => {
        state.disablingId = null
        state.users = state.users.map((u) =>
          u.id === action.payload ? { ...u, isActive: false } : u
        )
      })
      .addCase(disableUser.rejected, (state, action) => {
        state.disablingId = null
        state.actionError = action.payload
      })
  },
})

export const { updateStoredUser, clearAuthError, clearActionError } = usersSlice.actions
export default usersSlice.reducer
