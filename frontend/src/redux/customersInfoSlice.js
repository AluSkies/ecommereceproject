// Slice de la tabla `customers_info`.
// Scaffold: el backend tiene dos entidades de cliente (customer_info y
// customers_info); el frontend consume /customers a través de customerInfoSlice.
// Esta slice queda para cumplir "una slice por tabla".
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], current: null, status: 'idle', error: null }

const customersInfoSlice = createSlice({
  name: 'customersInfo',
  initialState,
  reducers: {},
})

export default customersInfoSlice.reducer
