// Slice de la tabla `addresses_others` (direcciones del cliente).
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export const fetchAddresses = createAsyncThunk('addresses/fetch', () => apiGet('/addresses'))
export const createAddress = createAsyncThunk('addresses/create', (body) => apiPost('/addresses', body))
export const updateAddress = createAsyncThunk('addresses/update', ({ id, body }) => apiPut(`/addresses/${id}`, body))
export const deleteAddress = createAsyncThunk('addresses/delete', async (id) => {
  await apiDelete(`/addresses/${id}`)
  return id
})

const initialState = { items: [], status: 'idle', error: null }

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAddresses.fulfilled, (s, a) => { s.items = a.payload })
    b.addCase(createAddress.fulfilled, (s, a) => { s.items.push(a.payload) })
    b.addCase(updateAddress.fulfilled, (s, a) => {
      s.items = s.items.map((x) => (x.id === a.payload.id ? a.payload : x))
    })
    b.addCase(deleteAddress.fulfilled, (s, a) => { s.items = s.items.filter((x) => x.id !== a.payload) })
  },
})

export const selectAddresses = (s) => s.addresses.items

export default addressesSlice.reducer
