import { useSearchParams } from 'react-router-dom'
import { type Category, CATEGORIES } from '@/data/watches'
import { useWatches } from '@/hooks/useWatches'
import { WatchGrid } from '@/components/watch/WatchGrid'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import { PriceRangeFilter } from '@/components/catalog/PriceRangeFilter'
import { useState } from 'react'

const allCategories = Object.values(CATEGORIES) as Category[]

function isCategoryParam(val: string | null): val is Category {
  return val !== null && (allCategories as string[]).includes(val)
}

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('categoria')
  const selectedCategory = isCategoryParam(categoryParam) ? categoryParam : null

  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const hasPriceFilter = priceRange.min !== '' || priceRange.max !== ''

  const filters = {
    category: selectedCategory,
    minPrice: priceRange.min ? Number(priceRange.min) : null,
    maxPrice: priceRange.max ? Number(priceRange.max) : null,
  }

  const results = useWatches(filters)

  function handleCategoryChange(cat: Category | null) {
    if (cat === null) {
      setSearchParams({})
    } else {
      setSearchParams({ categoria: cat })
    }
  }

  function handleClearFilters() {
    setSearchParams({})
    setPriceRange({ min: '', max: '' })
  }

  // Heading claro sobre qué está mostrando
  let headingLabel: string
  if (selectedCategory && hasPriceFilter) {
    headingLabel = `${selectedCategory} — con filtro de precio (${results.length})`
  } else if (selectedCategory) {
    headingLabel = `${selectedCategory} (${results.length} ${results.length === 1 ? 'reloj' : 'relojes'})`
  } else if (hasPriceFilter) {
    headingLabel = `Todos los relojes — con filtro de precio (${results.length})`
  } else {
    headingLabel = `Colección Completa (${results.length})`
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-gold mb-2">Tienda</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium text-ink-primary">
          {headingLabel}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10 pb-8 border-b border-ash">
        <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
        <div className="sm:ml-auto">
          <PriceRangeFilter value={priceRange} onChange={setPriceRange} />
        </div>
      </div>

      {/* Grid */}
      <WatchGrid watches={results} onClearFilters={handleClearFilters} />
    </section>
  )
}
