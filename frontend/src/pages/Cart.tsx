import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useCart, toNumber } from '@/lib/cart'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionTitle } from '@/components/ui/SectionTitle'

export function Cart() {
  const { isAuthenticated } = useAuth()
  const { cart, loading, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()
  const [pendingProductId, setPendingProductId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/carrito' } }} replace />
  }

  async function handleQuantityChange(productId: number, nextQty: number) {
    if (nextQty < 0) return
    setPendingProductId(productId)
    setError(null)
    try {
      if (nextQty === 0) {
        await removeItem(productId)
      } else {
        await updateQuantity(productId, nextQty)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el carrito')
    } finally {
      setPendingProductId(null)
    }
  }

  async function handleRemove(productId: number) {
    setPendingProductId(productId)
    setError(null)
    try {
      await removeItem(productId)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el artículo')
    } finally {
      setPendingProductId(null)
    }
  }

  const items = cart?.items ?? []
  const subtotal = toNumber(cart?.subtotal)

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Revisá tu selección antes de finalizar la compra">
          Tu Carrito
        </SectionTitle>
      </div>

      {loading && !cart ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">
          Cargando carrito…
        </p>
      ) : items.length === 0 ? (
        <div className="bg-white border border-ash p-12 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase mb-6">
            Tu carrito está vacío
          </p>
          <Button as={Link} to="/catalogo" variant="primary" size="md">
            Explorar catálogo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => {
              const unit = toNumber(item.unitPrice)
              const line = toNumber(item.lineTotal)
              const busy = pendingProductId === item.productId
              return (
                <div
                  key={item.productId}
                  className="bg-white border border-ash p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <Link
                      to={`/producto/${item.productId}`}
                      className="font-display text-lg text-ink-primary hover:text-gold transition-colors"
                    >
                      {item.productName}
                    </Link>
                    {item.productSku ? (
                      <p className="text-xs tracking-widest uppercase text-ink-muted mt-1">
                        SKU: {item.productSku}
                      </p>
                    ) : null}
                    <p className="text-xs tracking-widest uppercase text-ink-muted mt-2">
                      Precio: <PriceTag amount={unit} className="text-sm text-ink-primary" />
                    </p>
                  </div>

                  <div className="flex items-center border border-ash bg-pearl">
                    <button
                      type="button"
                      aria-label="Disminuir"
                      disabled={busy}
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="px-3 py-2 text-ink-muted hover:text-gold transition-colors cursor-pointer disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="px-3 text-sm text-ink-primary w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      disabled={busy}
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="px-3 py-2 text-ink-muted hover:text-gold transition-colors cursor-pointer disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[7rem]">
                    <PriceTag amount={line} className="text-base" />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRemove(item.productId)}
                      className="text-xs tracking-widest uppercase text-ink-muted hover:text-red-600 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}

            {error ? (
              <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">
                {error}
              </p>
            ) : null}
          </div>

          {/* Summary */}
          <aside className="bg-white border border-ash p-6 h-fit sticky top-24">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-4">Resumen</p>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-ink-muted">Subtotal</span>
              <PriceTag amount={subtotal} className="text-sm" />
            </div>
            <p className="text-xs text-ink-muted mb-6">
              Impuestos y envío se calculan al finalizar la compra.
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full"
            >
              Finalizar compra
            </Button>
            <Link
              to="/catalogo"
              className="block mt-4 text-xs tracking-widest uppercase text-ink-muted hover:text-gold text-center"
            >
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </section>
  )
}
