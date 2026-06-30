import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const sessionAuditLogSlice = createSlice({
  name: 'sessionAuditLog',
  initialState,
  reducers: {},
})

export default sessionAuditLogSlice.reducer
