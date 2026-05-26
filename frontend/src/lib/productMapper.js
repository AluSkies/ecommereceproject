const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80'

function pickImage(images) {
  if (!images || images.length === 0) return FALLBACK_IMAGE
  const primary = [...images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )[0].url
  return /^https?:\/\//i.test(primary) ? primary : FALLBACK_IMAGE
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
    image: pickImage(p.images),
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
