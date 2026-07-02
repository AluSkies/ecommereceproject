// Slice de la tabla `users` (+ sesión/auth: token y usuario logueado).
// Reemplaza a lib/auth.jsx (AuthContext). Los thunks reutilizan api.js.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPut, apiPatch, getStoredToken, setStoredToken, ApiError } from '@/lib/api'

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

// --- Thunks (uno por endpoint, como un "servicio" de la tabla) ---
export const login = createAsyncThunk('users/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await apiPost('/auth/login', { username, password })
    setStoredToken(res.token)
    return res // { token, user }
  } catch (err) {
    return rejectWithValue(err) // preserva el ApiError (status/body) para la UI
  }
})

export const register = createAsyncThunk('users/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await apiPost('/auth/register', payload)
    setStoredToken(res.token)
    return res // { token, user }
  } catch (err) {
    return rejectWithValue(err)
  }
})

export const logout = createAsyncThunk('users/logout', async () => {
  try {
    await apiPost('/auth/logout', {})
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) {
      console.warn('Logout request failed', err)
    }
  }
  setStoredToken(null)
})

export const fetchMe = createAsyncThunk('users/fetchMe', () => apiGet('/users/me'))
export const fetchUsers = createAsyncThunk('users/fetchUsers', () => apiGet('/users'))
export const saveUser = createAsyncThunk('users/saveUser', ({ id, body }) => apiPut(`/users/${id}`, body))
export const disableUser = createAsyncThunk('users/disableUser', async (id) => {
  await apiPatch(`/users/${id}/disable`)
  return id
})

const initialState = {
  currentUser: loadStoredUser(),
  token: getStoredToken(),
  list: [],
  status: 'idle',
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Refresca el usuario en estado (p. ej. tras editar el perfil). Reemplaza updateUser().
    userUpdated(state, action) {
      state.currentUser = { ...state.currentUser, ...action.payload }
    },
  },
  extraReducers: (b) => {
    const setSession = (state, action) => {
      state.token = action.payload.token
      state.currentUser = action.payload.user
      state.status = 'idle'
    }
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null })
    b.addCase(login.fulfilled, setSession)
    b.addCase(login.rejected, (s, a) => { s.status = 'error'; s.error = a.payload?.message ?? a.error.message })
    b.addCase(register.fulfilled, setSession)
    b.addCase(logout.fulfilled, (s) => { s.token = null; s.currentUser = null; s.list = [] })
    b.addCase(fetchMe.fulfilled, (s, a) => { s.currentUser = { ...s.currentUser, ...a.payload } })
    b.addCase(fetchUsers.fulfilled, (s, a) => { s.list = a.payload })
    b.addCase(saveUser.fulfilled, (s, a) => {
      s.list = s.list.map((u) => (u.id === a.payload.id ? a.payload : u))
      if (s.currentUser?.id === a.payload.id) s.currentUser = { ...s.currentUser, ...a.payload }
    })
    b.addCase(disableUser.fulfilled, (s, a) => {
      s.list = s.list.map((u) => (u.id === a.payload ? { ...u, enabled: false } : u))
    })
  },
})

export const { userUpdated } = usersSlice.actions

// --- Selectors ---
export const selectCurrentUser = (s) => s.users.currentUser
export const selectToken = (s) => s.users.token
export const selectIsAuthenticated = (s) => Boolean(s.users.token)
export const selectIsAdmin = (s) => s.users.currentUser?.role === 'ADMIN'
export const selectIsSlayer = (s) => s.users.currentUser?.role === 'DOOM_SLAYER'
export const selectUsers = (s) => s.users.list

export default usersSlice.reducer
