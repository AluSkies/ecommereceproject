/**
 * Imágenes representativas por categoría (URLs verificadas).
 * Se usan en la Home y como respaldo cuando un producto no trae una URL
 * de imagen válida desde el backend (p. ej. seeds viejos con rutas locales).
 */
export const categoryImageByCode = {
  LUXURY: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
  SPORT: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  VINTAGE: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
  DRESS: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80',
}

export const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'

/** Devuelve una imagen real para una categoría, con respaldo genérico. */
export function categoryImage(code) {
  return categoryImageByCode[code] ?? FALLBACK_CATEGORY_IMAGE
}
