import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '@/lib/api'
import { mapProduct } from '@/lib/productMapper'

const EMPTY_CATALOG = { watches: [], categories: [] }
let catalogCache = null
let catalogRequest = null

function loadCatalogData() {
  if (catalogCache) return Promise.resolve(catalogCache)

  if (!catalogRequest) {
    catalogRequest = Promise.all([
      apiGet('/categories'),
      apiGet('/products/active'),
    ])
      .then(([categories, products]) => {
        const byCode = new Map(categories.map((c) => [c.code, c]))
        const watches = products.map((p) => mapProduct(p, byCode))
        catalogCache = { watches, categories }
        return catalogCache
      })
      .finally(() => {
        catalogRequest = null
      })
  }

  return catalogRequest
}

function useCatalog() {
  const [state, setState] = useState(() => ({
    data: catalogCache ?? EMPTY_CATALOG,
    loading: !catalogCache,
    error: null,
  }))

  useEffect(() => {
    let mounted = true

    loadCatalogData()
      .then((data) => {
        if (!mounted) return
        setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!mounted) return
        setState({
          data: EMPTY_CATALOG,
          loading: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        })
      })

    return () => {
      mounted = false
    }
  }, [])

  return state
}

export function useWatches(filters) {
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

export function useAllWatches() {
  const { data, loading, error } = useCatalog()
  return { data: data.watches, loading, error }
}

export function useFeaturedWatches(count = 4) {
  const { data, loading, error } = useCatalog()
  const featured = useMemo(() => data.watches.slice(0, count), [data.watches, count])
  return { data: featured, loading, error }
}

export function useWatchById(id) {
  const { data, loading, error } = useCatalog()
  const watch = useMemo(
    () =>
      id === undefined ? null : data.watches.find((w) => w.id === id) ?? null,
    [data.watches, id],
  )
  return { data: watch, loading, error }
}

export function useCategories() {
  const { data, loading, error } = useCatalog()
  return { data: data.categories, loading, error }
}
