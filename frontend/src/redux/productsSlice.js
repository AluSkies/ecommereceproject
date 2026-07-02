// Slice de la tabla `products`. Thunks = "servicio" sobre /products.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'

export const fetchActiveProducts = createAsyncThunk('products/fetchActive', () => apiGet('/products/active'))
export const fetchAllProducts = createAsyncThunk('products/fetchAll', () => apiGet('/products'))
export const fetchProductById = createAsyncThunk('products/fetchById', (id) => apiGet(`/products/${id}`))
export const createProduct = createAsyncThunk('products/create', (body) => apiPost('/products', body))
export const updateProduct = createAsyncThunk('products/update', ({ id, body }) => apiPut(`/products/${id}`, body))
export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await apiDelete(`/products/${id}`)
  return id
})
export const updateProductStatus = createAsyncThunk('products/updateStatus', ({ id, status }) =>
  apiPatch(`/products/${id}/status?status=${status}`))
export const fetchLowStock = createAsyncThunk('products/lowStock', (threshold = 5) =>
  apiGet(`/products/inventory/low-stock?threshold=${threshold}`))
export const fetchOutOfStock = createAsyncThunk('products/outOfStock', () =>
  apiGet('/products/inventory/out-of-stock'))

const initialState = { items: [], current: null, lowStock: [], outOfStock: [], status: 'idle', error: null }

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchActiveProducts.pending, (s) => { s.status = 'loading'; s.error = null })
    b.addCase(fetchActiveProducts.fulfilled, (s, a) => { s.status = 'idle'; s.items = a.payload })
    b.addCase(fetchActiveProducts.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message })
    b.addCase(fetchAllProducts.fulfilled, (s, a) => { s.items = a.payload })
    b.addCase(fetchProductById.fulfilled, (s, a) => { s.current = a.payload })
    b.addCase(createProduct.fulfilled, (s, a) => { s.items.push(a.payload) })
    b.addCase(updateProduct.fulfilled, (s, a) => {
      s.items = s.items.map((p) => (p.id === a.payload.id ? a.payload : p))
      if (s.current?.id === a.payload.id) s.current = a.payload
    })
    b.addCase(deleteProduct.fulfilled, (s, a) => { s.items = s.items.filter((p) => p.id !== a.payload) })
    b.addCase(updateProductStatus.fulfilled, (s, a) => {
      s.items = s.items.map((p) => (p.id === a.payload?.id ? a.payload : p))
    })
    b.addCase(fetchLowStock.fulfilled, (s, a) => { s.lowStock = a.payload })
    b.addCase(fetchOutOfStock.fulfilled, (s, a) => { s.outOfStock = a.payload })
  },
})

export const selectProducts = (s) => s.products.items
export const selectCurrentProduct = (s) => s.products.current
export const selectProductsStatus = (s) => s.products.status

export default productsSlice.reducer
