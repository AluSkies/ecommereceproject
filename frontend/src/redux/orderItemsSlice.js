// Slice de la tabla `order_items`.
// Scaffold: los ítems de una orden vienen embebidos en la respuesta de /orders
// (ver ordersSlice). Se mantiene para cumplir "una slice por tabla".
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], status: 'idle', error: null }

const orderItemsSlice = createSlice({
  name: 'orderItems',
  initialState,
  reducers: {},
})

export default orderItemsSlice.reducer
