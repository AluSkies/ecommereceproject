import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
})

export default addressesSlice.reducer
