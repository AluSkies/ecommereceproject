import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const orderItemsSlice = createSlice({
  name: 'orderItems',
  initialState,
  reducers: {},
})

export default orderItemsSlice.reducer
