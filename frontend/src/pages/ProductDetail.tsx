import { useParams, Link, Navigate } from 'react-router-dom'
import { getById, watches, type Category } from '@/data/watches'
import { WatchImageGallery } from '@/components/watch/WatchImageGallery'
import { WatchSpecs } from '@/components/watch/WatchSpecs'
import { WatchCard } from '@/components/watch/WatchCard'
import { Badge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const watch = getById(Number(id))

  if (!watch) {
    return <Navigate to="/catalogo" replace />
  }

  const related = watches
    .filter((w) => w.category === watch.category && w.id !== watch.id)
    .slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-ink-muted mb-10">
        <Link to="/" className="hover:text-gold transition-colors duration-300">Inicio</Link>
        <span>/</span>
        <Link
          to={`/catalogo?categoria=${encodeURIComponent(watch.category)}`}
          className="hover:text-gold transition-colors duration-300"
        >
          {watch.category}
        </Link>
        <span>/</span>
        <span className="text-ink-primary">{watch.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <WatchImageGallery images={[watch.image]} alt={`${watch.brand} ${watch.name}`} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <Badge category={watch.category as Category} />
            <p className="mt-3 text-sm tracking-widest uppercase text-ink-muted">{watch.brand}</p>
            <h1 className="mt-1 font-display text-4xl font-medium text-ink-primary leading-tight">
              {watch.name}
            </h1>
          </div>

          <div className="w-10 h-px bg-gold" />

          <PriceTag amount={watch.price} className="text-2xl" />

          <p className="text-ink-secondary leading-relaxed">{watch.description}</p>

          {/* CTA */}
          <Button
            as="a"
            href="mailto:info@tempus.com"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Consultar Disponibilidad
          </Button>

          {/* Specs */}
          <div className="mt-4">
            <p className="text-xs tracking-widest uppercase text-ink-muted mb-3">Especificaciones</p>
            <WatchSpecs specs={watch.specs} />
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="w-10 h-px bg-gold mb-4" />
              <h2 className="font-display text-2xl font-medium text-ink-primary">
                También te puede interesar
              </h2>
            </div>
            <Link
              to={`/catalogo?categoria=${encodeURIComponent(watch.category)}`}
              className="text-xs tracking-widest uppercase text-gold hover:text-gold-dark transition-colors duration-300"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((w) => (
              <WatchCard key={w.id} watch={w} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
