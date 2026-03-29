import { useMemo } from 'react'
import { watches, type Category } from '@/data/watches'

interface Filters {
  category: Category | null
  minPrice: number | null
  maxPrice: number | null
}

export function useWatches(filters: Filters) {
  return useMemo(() => {
    return watches.filter((w) => {
      if (filters.category && w.category !== filters.category) return false
      if (filters.minPrice !== null && w.price < filters.minPrice) return false
      if (filters.maxPrice !== null && w.price > filters.maxPrice) return false
      return true
    })
  }, [filters.category, filters.minPrice, filters.maxPrice])
}
