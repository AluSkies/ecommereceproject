export interface Category {
  id: number
  code: string
  name: string
  slug?: string
  description?: string
  active?: boolean
}

export interface WatchSpecs {
  movimiento: string
  material: string
  diametro: string
  resistenciaAgua: string
  garantia: string
}

export interface Watch {
  id: number
  name: string
  brand: string
  price: number
  categoryCode: string
  categoryName: string
  image: string
  description: string
  specs: WatchSpecs
}
