// Slice de la tabla `product_images`.
// Scaffold: las imágenes vienen embebidas en la respuesta de /products
// (ver productsSlice). Se mantiene para cumplir "una slice por tabla".
import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [], status: 'idle', error: null }

const productImagesSlice = createSlice({
  name: 'productImages',
  initialState,
  reducers: {},
})

export default productImagesSlice.reducer
