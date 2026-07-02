// Slice de la tabla `carts`. Reemplaza a lib/cart.jsx (CartContext).
// Nota: los items del carrito vienen embebidos en la respuesta (ver cartItemsSlice).
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGetNullable, apiPost, apiPut, apiDelete } from '@/lib/api'

export const fetchCartByCustomer = createAsyncThunk('carts/fetchByCustomer', (customerId) =>
  apiGetNullable(`/cart/customer/${customerId}`))

// Estos thunks rechazan con el ApiError original (rejectWithValue) para que la UI
// pueda mostrar el mensaje real del backend vía .unwrap() (p. ej. "stock insuficiente").
export const addItem = createAsyncThunk(
  'carts/addItem',
  async ({ customerId, productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await apiPost('/cart/items', { customerId, productId, quantity })
    } catch (err) {
      return rejectWithValue(err)
    }
  },
)

export const updateItemQuantity = createAsyncThunk(
  'carts/updateQty',
  async ({ cartId, productId, quantity }, { rejectWithValue }) => {
    try {
      return await apiPut(`/cart/${cartId}/items/${productId}`, { quantity })
    } catch (err) {
      return rejectWithValue(err)
    }
  },
)

export const removeItem = createAsyncThunk(
  'carts/removeItem',
  async ({ cartId, productId }, { rejectWithValue }) => {
    try {
      return await apiDelete(`/cart/${cartId}/items/${productId}`)
    } catch (err) {
      return rejectWithValue(err)
    }
  },
)

export const clearCart = createAsyncThunk('carts/clear', async (cartId) => {
  await apiDelete(`/cart/${cartId}`)
})

const initialState = { cart: null, loading: false, error: null }

const cartsSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    // Limpia el carrito en estado local sin pegarle al backend (reemplaza resetLocal()).
    cartCleared(state) {
      state.cart = null
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCartByCustomer.pending, (s) => { s.loading = true })
    b.addCase(fetchCartByCustomer.fulfilled, (s, a) => { s.loading = false; s.cart = a.payload })
    b.addCase(fetchCartByCustomer.rejected, (s) => { s.loading = false; s.cart = null })
    b.addCase(addItem.fulfilled, (s, a) => { s.cart = a.payload })
    b.addCase(updateItemQuantity.fulfilled, (s, a) => { s.cart = a.payload })
    b.addCase(removeItem.fulfilled, (s, a) => { if (a.payload) s.cart = a.payload })
    b.addCase(clearCart.fulfilled, (s) => { s.cart = null })
  },
})

export const { cartCleared } = cartsSlice.actions

export const selectCart = (s) => s.carts.cart
export const selectCartLoading = (s) => s.carts.loading
export const selectCartItemCount = (s) =>
  (s.carts.cart?.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)

export default cartsSlice.reducer
