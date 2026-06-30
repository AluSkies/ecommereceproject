import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState,
  reducers: {},
})

export default cartItemsSlice.reducer
