import { useState } from 'react'
import { useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAllWatches, useWatchById, WatchCard } from '@/features/catalog'
import { WatchImageGallery } from '@/components/watch/WatchImageGallery'
import { WatchSpecs } from '@/components/watch/WatchSpecs'
import { Badge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin, selectCurrentUser } from '@/redux/usersSlice'
import { addItem } from '@/redux/cartsSlice'
import { addToast } from '@/redux/uiSlice'
import { ApiError } from '@/lib/api'

export function ProductDetail() {
  const { id } = useParams()
  const numericId = id ? Number(id) : undefined
  const { data: watch, loading, error } = useWatchById(numericId)
  const { data: allWatches } = useAllWatches()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

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

  const isOutOfStock = watch.stock <= 0

  const related = allWatches
    .filter((w) => w.categoryCode === watch.categoryCode && w.id !== watch.id)
    .slice(0, 3)

  async function handleAdd() {
    if (!watch) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (isAdmin) {
      dispatch(addToast({ message: 'No te podés comprar, es tu propia tienda pa', type: 'error' }))
      return
    }
    setAdding(true)
    try {
      await dispatch(addItem({ customerId: currentUser.id, productId: watch.id, quantity })).unwrap()
      dispatch(addToast({ message: `${watch.name} agregado al carrito` }))
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No se pudo agregar al carrito'
      dispatch(addToast({ message: msg, type: 'error' }))
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
        <WatchImageGallery images={[watch.image].filter(Boolean)} alt={`${watch.brand} ${watch.name}`} />

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

          {/* Quantity + add to cart (buyers only) */}
          <div className={`flex flex-col sm:flex-row sm:items-center gap-4 ${isAdmin ? 'hidden' : ''}`}>
            <div className="flex items-center border border-ash bg-pearl select-none rounded-full overflow-hidden">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="px-4 py-3 text-lg leading-none text-ink-muted hover:text-gold hover:bg-smoke active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset disabled:opacity-40 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-4 text-sm text-ink-primary w-10 text-center tabular-nums">{quantity}</span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                onClick={() => setQuantity((q) => Math.min(watch.stock, q + 1))}
                disabled={isOutOfStock || quantity >= watch.stock}
                className="px-4 py-3 text-lg leading-none text-ink-muted hover:text-gold hover:bg-smoke active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleAdd}
              loading={adding}
              disabled={isOutOfStock}
              className="w-full sm:flex-1"
            >
              {isOutOfStock ? 'Sin stock' : adding ? 'Agregando…' : 'Agregar al carrito'}
            </Button>
          </div>

          {/* Controles exclusivos de Administrador */}
          {isAdmin ? (
            <Button
              as={Link}
              to={`/admin/productos/editar/${watch.id}`}
              variant="ghost"
              className="w-full sm:w-auto mt-2 border border-ash hover:border-gold transition-colors"
            >
              Editar Producto
            </Button>
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
