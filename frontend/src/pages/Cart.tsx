import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart, seedCartIfEmpty } from '@/hooks/useCart'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'

export function Cart() {
  const { items, subtotal, count, setQuantity, removeItem, clear } = useCart()

  useEffect(() => {
    // TODO: quitar junto con seedCartIfEmpty cuando exista "Agregar al carrito".
    seedCartIfEmpty()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-ink-muted mb-10">
        <Link to="/" className="hover:text-gold transition-colors duration-300">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-ink-primary">Carrito</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="w-10 h-px bg-gold mb-4" />
        <h1 className="font-display text-4xl md:text-5xl font-medium text-ink-primary">
          Tu carrito
        </h1>
        {count > 0 && (
          <p className="mt-2 text-sm text-ink-muted">
            {count} {count === 1 ? 'artículo' : 'artículos'}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        /* Estado vacío */
        <div className="border border-ash py-20 px-6 text-center">
          <p className="font-display text-2xl text-ink-primary">
            Tu carrito está vacío
          </p>
          <p className="mt-2 text-ink-muted">
            Explorá nuestra colección y encontrá tu próximo reloj.
          </p>
          <div className="mt-8">
            <Button as={Link} to="/catalogo" variant="primary" size="lg">
              Ver catálogo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Líneas */}
          <div className="lg:col-span-2 flex flex-col">
            {items.map(({ watch, quantity, lineTotal }) => (
              <div
                key={watch.id}
                className="flex gap-5 py-6 border-t border-ash first:border-t-0"
              >
                <Link
                  to={`/producto/${watch.id}`}
                  className="shrink-0 w-24 sm:w-28 aspect-watch overflow-hidden bg-smoke"
                >
                  <img
                    src={watch.image}
                    alt={`${watch.brand} ${watch.name}`}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs tracking-widest uppercase text-ink-muted">
                      {watch.brand}
                    </p>
                    <Link
                      to={`/producto/${watch.id}`}
                      className="font-display text-lg text-ink-primary hover:text-gold transition-colors duration-300"
                    >
                      {watch.name}
                    </Link>
                    <PriceTag
                      amount={watch.price}
                      className="block mt-1 text-sm text-ink-muted font-normal"
                    />

                    {/* Stepper de cantidad */}
                    <div className="mt-4 inline-flex items-center border border-ash">
                      <button
                        type="button"
                        aria-label="Disminuir cantidad"
                        onClick={() => setQuantity(watch.id, quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-ink-secondary hover:text-gold transition-colors duration-300 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        onClick={() => setQuantity(watch.id, quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-ink-secondary hover:text-gold transition-colors duration-300 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <PriceTag amount={lineTotal} className="text-lg" />
                    <button
                      type="button"
                      onClick={() => removeItem(watch.id)}
                      className="text-xs tracking-widest uppercase text-gold hover:text-gold-dark transition-colors duration-300 cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <aside className="lg:col-span-1">
            <div className="border border-ash p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl text-ink-primary">Resumen</h2>
              <div className="w-10 h-px bg-gold my-4" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-secondary">Subtotal</span>
                <PriceTag amount={subtotal} className="text-lg" />
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Impuestos y envío se calculan en el checkout.
              </p>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
                title="Próximamente"
              >
                Continuar compra
              </Button>

              <button
                type="button"
                onClick={clear}
                className="w-full mt-3 text-xs tracking-widest uppercase text-ink-muted hover:text-gold transition-colors duration-300 cursor-pointer"
              >
                Vaciar carrito
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
