import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const productImagesSlice = createSlice({
  name: 'productImages',
  initialState,
  reducers: {},
})

export default productImagesSlice.reducer
