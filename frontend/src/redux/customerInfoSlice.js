import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const customerInfoSlice = createSlice({
  name: 'customerInfo',
  initialState,
  reducers: {},
})

export default customerInfoSlice.reducer
