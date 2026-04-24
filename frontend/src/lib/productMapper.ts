import { type Category, type Watch } from '@/data/watches'

export interface ProductImageResponse {
  url: string
  sortOrder?: number
  altText?: string
}

export interface ProductResponse {
  id: number
  sku?: string
  name: string
  slug?: string
  description?: string
  price: number | string
  compareAtPrice?: number | string | null
  stock?: number
  status?: string
  category?: string
  categoryCode?: string
  brandId?: number | null
  caliber?: string
  caseSize?: string
  strapMaterial?: string
  images?: ProductImageResponse[]
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80'

function pickImage(images?: ProductImageResponse[]): string {
  if (!images || images.length === 0) return FALLBACK_IMAGE
  const primary = [...images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )[0].url
  return /^https?:\/\//i.test(primary) ? primary : FALLBACK_IMAGE
}

function splitBrand(fullName: string): { brand: string; name: string } {
  const trimmed = fullName.trim()
  const spaceIdx = trimmed.indexOf(' ')
  if (spaceIdx === -1) return { brand: '', name: trimmed }
  return {
    brand: trimmed.slice(0, spaceIdx),
    name: trimmed.slice(spaceIdx + 1),
  }
}

export function mapProduct(
  p: ProductResponse,
  categoriesByCode: Map<string, Category>,
): Watch {
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
