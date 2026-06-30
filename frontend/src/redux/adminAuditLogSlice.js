import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const adminAuditLogSlice = createSlice({
  name: 'adminAuditLog',
  initialState,
  reducers: {},
})

export default adminAuditLogSlice.reducer
