import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCatalogThunk,
  selectWatches,
  selectCategories,
  selectCatalogLoading,
  selectCatalogError,
} from '@/store/slices/catalogSlice'

function useCatalogData() {
  const dispatch = useDispatch()
  const watches = useSelector(selectWatches)
  const categories = useSelector(selectCategories)
  const loading = useSelector(selectCatalogLoading)
  const error = useSelector(selectCatalogError)

  useEffect(() => {
    dispatch(fetchCatalogThunk())
  }, [dispatch])

  return { data: { watches, categories }, loading, error }
}

export function useWatches(filters) {
  const { data, loading, error } = useCatalogData()
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
  const { data, loading, error } = useCatalogData()
  return { data: data.watches, loading, error }
}

export function useFeaturedWatches(count = 4) {
  const { data, loading, error } = useCatalogData()
  const featured = useMemo(() => data.watches.slice(0, count), [data.watches, count])
  return { data: featured, loading, error }
}

export function useWatchById(id) {
  const { data, loading, error } = useCatalogData()
  const watch = useMemo(
    () => (id === undefined ? null : data.watches.find((w) => w.id === id) ?? null),
    [data.watches, id],
  )
  return { data: watch, loading, error }
}

export function useCategories() {
  const { data, loading, error } = useCatalogData()
  return { data: data.categories, loading, error }
}
