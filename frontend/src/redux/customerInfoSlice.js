// Slice de la tabla `customer_info` (datos de cliente del usuario logueado).
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPut } from '@/lib/api'

export const fetchMyCustomerInfo = createAsyncThunk('customerInfo/fetchMe', () => apiGet('/customers/me'))
export const updateMyCustomerInfo = createAsyncThunk('customerInfo/updateMe', (body) => apiPut('/customers/me', body))
export const fetchCustomerInfoById = createAsyncThunk('customerInfo/fetchById', (id) => apiGet(`/customers/${id}`))

const initialState = { current: null, status: 'idle', error: null }

const customerInfoSlice = createSlice({
  name: 'customerInfo',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyCustomerInfo.fulfilled, (s, a) => { s.current = a.payload })
    b.addCase(updateMyCustomerInfo.fulfilled, (s, a) => { s.current = a.payload })
    b.addCase(fetchCustomerInfoById.fulfilled, (s, a) => { s.current = a.payload })
  },
})

export const selectMyCustomerInfo = (s) => s.customerInfo.current

export default customerInfoSlice.reducer
