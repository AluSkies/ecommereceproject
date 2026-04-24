import { useSearchParams } from 'react-router-dom'
import { useCategories, useWatches } from '@/hooks/useWatches'
import { WatchGrid } from '@/components/watch/WatchGrid'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import { PriceRangeFilter } from '@/components/catalog/PriceRangeFilter'
import { useState } from 'react'

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories } = useCategories()

  const rawParam = searchParams.get('categoria')
  const selectedCode = rawParam && categories.some((c) => c.code === rawParam)
    ? rawParam
    : null
  const selectedCategory = categories.find((c) => c.code === selectedCode) ?? null

  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const hasPriceFilter = priceRange.min !== '' || priceRange.max !== ''

  const filters = {
    categoryCode: selectedCode,
    minPrice: priceRange.min ? Number(priceRange.min) : null,
    maxPrice: priceRange.max ? Number(priceRange.max) : null,
  }

  const { data: results, loading, error } = useWatches(filters)

  function handleCategoryChange(code: string | null) {
    if (code === null) {
      setSearchParams({})
    } else {
      setSearchParams({ categoria: code })
    }
  }

  function handleClearFilters() {
    setSearchParams({})
    setPriceRange({ min: '', max: '' })
  }

  const selectedLabel = selectedCategory?.name ?? null

  let headingLabel: string
  if (selectedLabel && hasPriceFilter) {
    headingLabel = `${selectedLabel} — con filtro de precio (${results.length})`
  } else if (selectedLabel) {
    headingLabel = `${selectedLabel} (${results.length} ${results.length === 1 ? 'reloj' : 'relojes'})`
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
        <CategoryFilter
          categories={categories}
          selectedCode={selectedCode}
          onChange={handleCategoryChange}
        />
        <div className="sm:ml-auto">
          <PriceRangeFilter value={priceRange} onChange={setPriceRange} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-24">
          Cargando catálogo…
        </p>
      ) : error ? (
        <p className="text-sm tracking-widest uppercase text-center py-24 text-red-600">
          No se pudo cargar el catálogo — revisá que el backend esté corriendo en {import.meta.env.VITE_API_URL}
        </p>
      ) : (
        <WatchGrid watches={results} onClearFilters={handleClearFilters} />
      )}
    </section>
  )
}
