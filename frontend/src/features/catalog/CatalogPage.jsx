import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from '@/redux/usersSlice'
import { Button } from '@/components/ui/Button'
import { useCategories, useWatches } from './useCatalog'
import { CategoryFilter } from './CategoryFilter'
import { PriceRangeFilter } from './PriceRangeFilter'
import { WatchGrid } from './WatchGrid'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories } = useCategories()
  const isAdmin = useSelector(selectIsAdmin)

  const rawParam = searchParams.get('categoria')
  const selectedCode =
    rawParam && categories.some((c) => c.code === rawParam) ? rawParam : null
  const selectedCategory = categories.find((c) => c.code === selectedCode) ?? null

  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const hasPriceFilter = priceRange.min !== '' || priceRange.max !== ''

  const filters = {
    categoryCode: selectedCode,
    minPrice: priceRange.min ? Number(priceRange.min) : null,
    maxPrice: priceRange.max ? Number(priceRange.max) : null,
  }

  const { data: results, loading, error } = useWatches(filters)

  function handleCategoryChange(code) {
    if (code === null) setSearchParams({})
    else setSearchParams({ categoria: code })
  }

  function handleClearFilters() {
    setSearchParams({})
    setPriceRange({ min: '', max: '' })
  }

  const selectedLabel = selectedCategory?.name ?? null
  let headingLabel
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
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-gold mb-2">Tienda</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-ink-primary">
            {headingLabel}
          </h1>
        </div>
        {isAdmin ? (
          <Button as={Link} to="/admin/productos/nuevo" variant="primary" size="md">
            + Agregar Nuevo Producto
          </Button>
        ) : null}
      </div>

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

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-24">
          Cargando catálogo…
        </p>
      ) : error ? (
        <p className="text-sm tracking-widest uppercase text-center py-24 text-red-600">
          No se pudo cargar el catálogo — revisá que el backend esté corriendo en{' '}
          {import.meta.env.VITE_API_URL}
        </p>
      ) : (
        <WatchGrid watches={results} onClearFilters={handleClearFilters} />
      )}
    </section>
  )
}
