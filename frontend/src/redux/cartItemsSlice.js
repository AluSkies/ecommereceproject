// Slice de la tabla `cart_items`.
// Scaffold: los ítems del carrito vienen embebidos en la respuesta de /cart
// (ver cartsSlice). Esta slice existe para cumplir "una slice por tabla" y queda
// lista por si en el futuro se expone un endpoint propio de cart-items.
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], status: 'idle', error: null }

const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState,
  reducers: {},
})

export default cartItemsSlice.reducer
