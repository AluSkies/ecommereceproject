// Slice de la tabla `admin_audit_logs`.
// Scaffold: sin endpoint consumido por el frontend todavía.
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], status: 'idle', error: null }

const adminAuditLogSlice = createSlice({
  name: 'adminAuditLog',
  initialState,
  reducers: {},
})

export default adminAuditLogSlice.reducer
