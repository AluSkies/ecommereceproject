import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../axiosClient'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchCartThunk = createAsyncThunk(
  'cart/fetch',
  async (customerId) => {
    const { data } = await axiosClient.get(`/cart/customer/${customerId}`)
    // Sin carrito el backend responde 204 No Content (CartController#getCartByCustomer),
    // que es éxito y axios entrega como ''. Lo normalizamos a null.
    return data || null
  },
  {
    // Descarta solo los fetch duplicados del MISMO cliente (varios useCart() +
    // doble montaje de StrictMode). Deliberadamente no mira `loading`: ese flag
    // lo comparten las mutaciones, y bloquear por él descartaría en silencio un
    // refresh legítimo o el fetch de otro cliente al cambiar de cuenta.
    condition: (customerId, { getState }) =>
      getState().cart.fetchingCustomerId !== customerId,
  },
)

export const addItemThunk = createAsyncThunk(
  'cart/addItem',
  async ({ customerId, productId, quantity }) => {
    const { data } = await axiosClient.post('/cart/items', { customerId, productId, quantity })
    return data
  },
)

export const updateItemThunk = createAsyncThunk(
  'cart/updateItem',
  async ({ cartId, productId, quantity }) => {
    const { data } = await axiosClient.put(`/cart/${cartId}/items/${productId}`, { quantity })
    return data
  },
)

export const removeItemThunk = createAsyncThunk(
  'cart/removeItem',
  async ({ cartId, productId }) => {
    const { data } = await axiosClient.delete(`/cart/${cartId}/items/${productId}`)
    return data
  },
)

export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (cartId) => {
    await axiosClient.delete(`/cart/${cartId}`)
    return null
  },
)

// ─── Slice ─────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    error: null,
    // Cliente cuyo fetch está en vuelo — lo lee el `condition` de fetchCartThunk
    fetchingCustomerId: null,
  },
  reducers: {
    resetCart(state) {
      state.cart = null
      state.loading = false
      state.error = null
      state.fetchingCustomerId = null
    },
    clearCartError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false
      state.cart = action.payload
      state.error = null
    }
    const setLoading = (state) => {
      state.loading = true
      state.error = null
    }
    // Los thunks no usan rejectWithValue (ver commit "quitar try/catch
    // redundante"), así que action.payload viene vacío y el mensaje real —ya
    // normalizado por el interceptor de axiosClient— vive en action.error.
    // Leer solo payload hacía que TODO fallo del carrito se tragara en silencio.
    const errorMessage = (action) =>
      action.payload?.message ?? action.payload ?? action.error?.message ?? 'Error desconocido'

    const setError = (state, action) => {
      state.loading = false
      state.error = errorMessage(action)
    }

    builder
      .addCase(fetchCartThunk.pending, (state, action) => {
        setLoading(state)
        state.fetchingCustomerId = action.meta.arg
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        setCart(state, action)
        state.fetchingCustomerId = null
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false
        state.cart = null
        state.fetchingCustomerId = null
        // El caso "todavía no tiene carrito" NO pasa por acá: el backend
        // devuelve 204 y eso cae en fulfilled. Un rejected es un fallo real
        // (401 token vencido, 500, red) y hay que mostrarlo.
        state.error = errorMessage(action)
      })

      .addCase(addItemThunk.pending, setLoading)
      .addCase(addItemThunk.fulfilled, setCart)
      .addCase(addItemThunk.rejected, setError)

      .addCase(updateItemThunk.pending, setLoading)
      .addCase(updateItemThunk.fulfilled, setCart)
      .addCase(updateItemThunk.rejected, setError)

      .addCase(removeItemThunk.pending, setLoading)
      .addCase(removeItemThunk.fulfilled, setCart)
      .addCase(removeItemThunk.rejected, setError)

      .addCase(clearCartThunk.pending, setLoading)
      .addCase(clearCartThunk.fulfilled, setCart)
      .addCase(clearCartThunk.rejected, setError)
  },
})

export const { resetCart, clearCartError } = cartSlice.actions

// ─── Selectors ─────────────────────────────────────────────────────────────

export const selectCart = (state) => state.cart.cart
export const selectCartLoading = (state) => state.cart.loading
export const selectCartError = (state) => state.cart.error
export const selectItemCount = (state) => {
  const cart = state.cart.cart
  if (!cart) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
}

export default cartSlice.reducer
