// Slice de la tabla `categories`.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export const fetchCategories = createAsyncThunk('categories/fetch', () => apiGet('/categories'))
export const createCategory = createAsyncThunk('categories/create', (body) => apiPost('/categories', body))
export const updateCategory = createAsyncThunk('categories/update', ({ id, body }) => apiPut(`/categories/${id}`, body))
export const deleteCategory = createAsyncThunk('categories/delete', async (id) => {
  await apiDelete(`/categories/${id}`)
  return id
})

const initialState = { items: [], status: 'idle', error: null }

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCategories.pending, (s) => { s.status = 'loading'; s.error = null })
    b.addCase(fetchCategories.fulfilled, (s, a) => { s.status = 'idle'; s.items = a.payload })
    b.addCase(fetchCategories.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message })
    b.addCase(createCategory.fulfilled, (s, a) => { s.items.push(a.payload) })
    b.addCase(updateCategory.fulfilled, (s, a) => {
      s.items = s.items.map((c) => (c.id === a.payload.id ? a.payload : c))
    })
    b.addCase(deleteCategory.fulfilled, (s, a) => { s.items = s.items.filter((c) => c.id !== a.payload) })
  },
})

export const selectCategories = (s) => s.categories.items

export default categoriesSlice.reducer
