import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const customersInfoSlice = createSlice({
  name: 'customersInfo',
  initialState,
  reducers: {},
})

export default customersInfoSlice.reducer
