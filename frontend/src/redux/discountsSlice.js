// Slice de la tabla `discounts` (cupones).
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiGetNullable, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'

export const fetchDiscounts = createAsyncThunk('discounts/fetch', () => apiGet('/discounts'))
export const fetchDiscountById = createAsyncThunk('discounts/fetchById', (id) => apiGet(`/discounts/${id}`))
export const fetchDiscountByCode = createAsyncThunk('discounts/fetchByCode', (code) =>
  apiGetNullable(`/discounts/code/${encodeURIComponent(code)}`))
export const createDiscount = createAsyncThunk('discounts/create', (body) => apiPost('/discounts', body))
export const updateDiscount = createAsyncThunk('discounts/update', ({ id, body }) => apiPut(`/discounts/${id}`, body))
// action: 'activate' | 'deactivate'
export const toggleDiscount = createAsyncThunk('discounts/toggle', ({ id, action }) =>
  apiPatch(`/discounts/${id}/${action}`))
export const deleteDiscount = createAsyncThunk('discounts/delete', async (id) => {
  await apiDelete(`/discounts/${id}`)
  return id
})

const initialState = { list: [], current: null, byCode: null, status: 'idle', error: null }

const discountsSlice = createSlice({
  name: 'discounts',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDiscounts.pending, (s) => { s.status = 'loading'; s.error = null })
    b.addCase(fetchDiscounts.fulfilled, (s, a) => { s.status = 'idle'; s.list = a.payload })
    b.addCase(fetchDiscounts.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message })
    b.addCase(fetchDiscountById.fulfilled, (s, a) => { s.current = a.payload })
    b.addCase(fetchDiscountByCode.fulfilled, (s, a) => { s.byCode = a.payload })
    b.addCase(createDiscount.fulfilled, (s, a) => { s.list.push(a.payload) })
    b.addCase(updateDiscount.fulfilled, (s, a) => {
      s.list = s.list.map((d) => (d.id === a.payload.id ? a.payload : d))
    })
    b.addCase(toggleDiscount.fulfilled, (s, a) => {
      s.list = s.list.map((d) => (d.id === a.payload?.id ? a.payload : d))
    })
    b.addCase(deleteDiscount.fulfilled, (s, a) => { s.list = s.list.filter((d) => d.id !== a.payload) })
  },
})

export const selectDiscounts = (s) => s.discounts.list
export const selectCurrentDiscount = (s) => s.discounts.current

export default discountsSlice.reducer
