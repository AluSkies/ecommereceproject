import { useState } from 'react'
import { useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAllWatches, useWatchById } from '@/hooks/useWatches'
import { WatchImageGallery } from '@/components/watch/WatchImageGallery'
import { WatchSpecs } from '@/components/watch/WatchSpecs'
import { WatchCard } from '@/components/watch/WatchCard'
import { Badge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { ApiError } from '@/lib/api'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const numericId = id ? Number(id) : undefined
  const { data: watch, loading, error } = useWatchById(numericId)
  const { data: allWatches } = useAllWatches()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; message: string } | null>(null)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-ink-muted text-sm tracking-widest uppercase">
        Cargando…
      </div>
    )
  }

  if (error || !watch) {
    return <Navigate to="/catalogo" replace />
  }

  const related = allWatches
    .filter((w) => w.categoryCode === watch.categoryCode && w.id !== watch.id)
    .slice(0, 3)

  async function handleAdd() {
    if (!watch) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    setAdding(true)
    setFeedback(null)
    try {
      await addItem(watch.id, quantity)
      setFeedback({ kind: 'ok', message: 'Agregado al carrito' })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo agregar al carrito'
      setFeedback({ kind: 'err', message: msg })
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-ink-muted mb-10">
        <Link to="/" className="hover:text-gold transition-colors duration-300">Inicio</Link>
        <span>/</span>
        <Link
          to={`/catalogo?categoria=${encodeURIComponent(watch.categoryCode)}`}
          className="hover:text-gold transition-colors duration-300"
        >
          {watch.categoryName}
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
            <Badge code={watch.categoryCode} label={watch.categoryName} />
            {watch.brand ? (
              <p className="mt-3 text-sm tracking-widest uppercase text-ink-muted">{watch.brand}</p>
            ) : null}
            <h1 className="mt-1 font-display text-4xl font-medium text-ink-primary leading-tight">
              {watch.name}
            </h1>
          </div>

          <div className="w-10 h-px bg-gold" />

          <PriceTag amount={watch.price} className="text-2xl" />

          <p className="text-ink-secondary leading-relaxed">{watch.description}</p>

          {/* Quantity + add to cart */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center border border-ash bg-pearl">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-ink-muted hover:text-gold transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="px-4 text-sm text-ink-primary w-10 text-center">{quantity}</span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-3 text-ink-muted hover:text-gold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleAdd}
              disabled={adding}
              className={`w-full sm:flex-1 ${adding ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {adding ? 'Agregando…' : 'Agregar al carrito'}
            </Button>
          </div>

          {feedback ? (
            <p
              role={feedback.kind === 'err' ? 'alert' : 'status'}
              className={`text-xs tracking-widest uppercase ${
                feedback.kind === 'err' ? 'text-red-600' : 'text-gold'
              }`}
            >
              {feedback.kind === 'ok' ? (
                <>
                  {feedback.message} —{' '}
                  <Link to="/carrito" className="underline hover:text-gold-dark">
                    ver carrito
                  </Link>
                </>
              ) : (
                feedback.message
              )}
            </p>
          ) : null}

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
              to={`/catalogo?categoria=${encodeURIComponent(watch.categoryCode)}`}
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
