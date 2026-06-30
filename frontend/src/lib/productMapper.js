import { categoryImage } from './categoryImages'

/**
 * Elige la imagen principal de un producto. Si la URL no es absoluta
 * (http/https) —p. ej. un seed viejo con rutas locales inexistentes— se cae
 * a una imagen real de la categoría en vez de dejar un hueco.
 */
function pickImage(images, code) {
  if (!images || images.length === 0) return categoryImage(code)
  const primary = [...images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )[0].url
  return /^https?:\/\//i.test(primary) ? primary : categoryImage(code)
}

function splitBrand(fullName) {
  const trimmed = fullName.trim()
  const spaceIdx = trimmed.indexOf(' ')
  if (spaceIdx === -1) return { brand: '', name: trimmed }
  return {
    brand: trimmed.slice(0, spaceIdx),
    name: trimmed.slice(spaceIdx + 1),
  }
}

/**
 * @param {object} p Product response from the API
 * @param {Map<string, import('@/data/watches').Category>} categoriesByCode
 * @returns {import('@/data/watches').Watch}
 */
export function mapProduct(p, categoriesByCode) {
  const code = p.categoryCode ?? p.category ?? ''
  const categoryName = categoriesByCode.get(code)?.name ?? code
  const { brand, name } = splitBrand(p.name)

  return {
    id: p.id,
    name,
    brand,
    price: typeof p.price === 'string' ? Number(p.price) : p.price,
    categoryCode: code,
    categoryName,
    stock: p.stock ?? 0,
    image: pickImage(p.images, code),
    description: p.description ?? '',
    specs: {
      movimiento: p.caliber ?? '—',
      material: p.strapMaterial ?? '—',
      diametro: p.caseSize ?? '—',
      resistenciaAgua: '—',
      garantia: '—',
    },
  }
}
