// Slice de la tabla `sesion_audit_log`.
// Scaffold: sin endpoint consumido por el frontend todavía.
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], status: 'idle', error: null }

const sessionAuditLogSlice = createSlice({
  name: 'sessionAuditLog',
  initialState,
  reducers: {},
})

export default sessionAuditLogSlice.reducer
