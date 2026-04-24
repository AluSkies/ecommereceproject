import { useEffect, useMemo, useState } from 'react'
import { type Category, type Watch } from '@/data/watches'
import { apiGet } from '@/lib/api'
import { mapProduct, type ProductResponse } from '@/lib/productMapper'

interface Filters {
  categoryCode: string | null
  minPrice: number | null
  maxPrice: number | null
}

interface AsyncState<T> {
  data: T
  loading: boolean
  error: string | null
}

interface CatalogPayload {
  watches: Watch[]
  categories: Category[]
}

function useCatalog(): AsyncState<CatalogPayload> {
  const [state, setState] = useState<AsyncState<CatalogPayload>>({
    data: { watches: [], categories: [] },
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      apiGet<Category[]>('/categories', controller.signal),
      apiGet<ProductResponse[]>('/products/available', controller.signal),
    ])
      .then(([categories, products]) => {
        const byCode = new Map(categories.map((c) => [c.code, c]))
        const watches = products.map((p) => mapProduct(p, byCode))
        setState({ data: { watches, categories }, loading: false, error: null })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({
          data: { watches: [], categories: [] },
          loading: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        })
      })
    return () => controller.abort()
  }, [])

  return state
}

export function useWatches(filters: Filters): AsyncState<Watch[]> {
  const { data, loading, error } = useCatalog()
  const filtered = useMemo(() => {
    return data.watches.filter((w) => {
      if (filters.categoryCode && w.categoryCode !== filters.categoryCode) return false
      if (filters.minPrice !== null && w.price < filters.minPrice) return false
      if (filters.maxPrice !== null && w.price > filters.maxPrice) return false
      return true
    })
  }, [data.watches, filters.categoryCode, filters.minPrice, filters.maxPrice])

  return { data: filtered, loading, error }
}

export function useAllWatches(): AsyncState<Watch[]> {
  const { data, loading, error } = useCatalog()
  return { data: data.watches, loading, error }
}

export function useFeaturedWatches(count = 4): AsyncState<Watch[]> {
  const { data, loading, error } = useCatalog()
  const featured = useMemo(() => data.watches.slice(0, count), [data.watches, count])
  return { data: featured, loading, error }
}

export function useWatchById(id: number | undefined): AsyncState<Watch | null> {
  const { data, loading, error } = useCatalog()
  const watch = useMemo(
    () =>
      id === undefined ? null : data.watches.find((w) => w.id === id) ?? null,
    [data.watches, id],
  )
  return { data: watch, loading, error }
}

export function useCategories(): AsyncState<Category[]> {
  const { data, loading, error } = useCatalog()
  return { data: data.categories, loading, error }
}
