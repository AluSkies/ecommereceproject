import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const orderStatusHistorySlice = createSlice({
  name: 'orderStatusHistory',
  initialState,
  reducers: {},
})

export default orderStatusHistorySlice.reducer
