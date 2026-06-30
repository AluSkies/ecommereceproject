import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGetNullable, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api'
import { logoutUser } from './usersSlice'

export const refreshCart = createAsyncThunk(
  'carts/refreshCart',
  async (customerId, { rejectWithValue }) => {
    if (!customerId) return null
    try {
      const data = await apiGetNullable(`/cart/customer/${customerId}`)
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Error al cargar el carrito.')
    }
  }
)

export const addItemToCart = createAsyncThunk(
  'carts/addItemToCart',
  async ({ customerId, productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await apiPost('/cart/items', { customerId, productId, quantity })
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo agregar al carrito.')
    }
  }
)

export const updateCartItemQuantity = createAsyncThunk(
  'carts/updateCartItemQuantity',
  async ({ cartId, productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await apiPut(`/cart/${cartId}/items/${productId}`, { quantity })
      return data
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo actualizar la cantidad.')
    }
  }
)

export const removeCartItem = createAsyncThunk(
  'carts/removeCartItem',
  async ({ cartId, productId }, { rejectWithValue }) => {
    try {
      const data = await apiDelete(`/cart/${cartId}/items/${productId}`)
      return data
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null
      }
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo eliminar el artículo.')
    }
  }
)

export const clearCart = createAsyncThunk(
  'carts/clearCart',
  async (cartId, { rejectWithValue }) => {
    try {
      await apiDelete(`/cart/${cartId}`)
      return null
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'No se pudo vaciar el carrito.')
    }
  }
)

const initialState = {
  cart: null,
  loading: false,
  error: null,
}

const cartsSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    resetLocalCart(state) {
      state.cart = null
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // refreshCart
      .addCase(refreshCart.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshCart.fulfilled, (state, action) => {
        state.loading = false
        state.cart = action.payload
        state.error = null
      })
      .addCase(refreshCart.rejected, (state, action) => {
        state.loading = false
        state.cart = null
        state.error = action.payload
      })
      // addItemToCart
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      // updateCartItemQuantity
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.cart = action.payload
      })
      // removeCartItem
      .addCase(removeCartItem.fulfilled, (state, action) => {
        if (action.payload !== null) {
          state.cart = action.payload
        }
      })
      // clearCart
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null
      })
      // reset on logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.cart = null
        state.loading = false
        state.error = null
      })
  },
})

export const { resetLocalCart } = cartsSlice.actions
export default cartsSlice.reducer
