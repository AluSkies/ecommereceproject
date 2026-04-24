import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { toNumber } from '@/lib/cart'
import { apiGet, ApiError } from '@/lib/api'
import { statusClassName, statusLabel, type Order } from '@/lib/orders'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionTitle } from '@/components/ui/SectionTitle'

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const preloaded = (location.state as { order?: Order } | null)?.order ?? null

  const [order, setOrder] = useState<Order | null>(preloaded)
  const [loading, setLoading] = useState(!preloaded)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (preloaded || !id) return
    const controller = new AbortController()
    setLoading(true)
    apiGet<Order>(`/orders/${id}`, controller.signal)
      .then((o) => setOrder(o))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la orden')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id, preloaded])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Registramos tu compra. Verificaremos el pago en las próximas horas.">
          ¡Gracias por tu compra!
        </SectionTitle>
      </div>

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">
          Cargando orden…
        </p>
      ) : error || !order ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-sm text-red-600 tracking-widest uppercase mb-6">
            {error ?? 'Orden no encontrada'}
          </p>
          <Button as={Link} to="/mis-ordenes" variant="primary" size="md">
            Ver mis órdenes
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-ash p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-ink-muted">Orden</p>
              <p className="font-display text-2xl text-ink-primary">#{order.orderNumber}</p>
            </div>
            <span
              className={`self-start inline-block text-xs tracking-widest uppercase px-3 py-1 ${statusClassName(order.status)}`}
            >
              {statusLabel(order.status)}
            </span>
          </div>

          <div className="border-t border-ash pt-6">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Artículos</p>
            <ul className="flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-3">
                  <span className="text-ink-secondary">
                    {item.quantity} × {item.productName}
                  </span>
                  <PriceTag
                    amount={toNumber(item.lineTotal)}
                    className="text-sm text-ink-primary whitespace-nowrap"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-ash pt-6 text-sm flex flex-col gap-1">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <PriceTag amount={toNumber(order.subtotal)} className="text-sm text-ink-primary" />
            </div>
            {toNumber(order.discountTotal) > 0 ? (
              <div className="flex justify-between text-ink-muted">
                <span>Descuento</span>
                <PriceTag amount={toNumber(order.discountTotal)} className="text-sm text-ink-primary" />
              </div>
            ) : null}
            <div className="flex justify-between text-ink-muted">
              <span>Envío</span>
              <PriceTag amount={toNumber(order.shippingTotal)} className="text-sm text-ink-primary" />
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>IVA</span>
              <PriceTag amount={toNumber(order.taxTotal)} className="text-sm text-ink-primary" />
            </div>
            <div className="flex justify-between pt-2 border-t border-ash mt-2">
              <span className="text-xs tracking-widest uppercase text-ink-muted">Total</span>
              <PriceTag amount={toNumber(order.grandTotal)} className="text-lg" />
            </div>
          </div>

          {order.shippingSnapshot ? (
            <div className="border-t border-ash pt-6">
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Envío</p>
              <p className="text-sm text-ink-secondary whitespace-pre-line">
                {order.shippingSnapshot}
              </p>
            </div>
          ) : null}

          <div className="border-t border-ash pt-6 bg-pearl/50 -mx-8 -mb-8 px-8 py-6">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Próximos pasos</p>
            <p className="text-sm text-ink-secondary">
              Tu orden quedó en estado <strong>{statusLabel(order.status)}</strong>. Vamos a
              verificar la transferencia y te notificaremos cuando sea confirmada. Podés revisar el
              estado desde tu historial de órdenes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to="/mis-ordenes" variant="primary" size="md">
                Ver mis órdenes
              </Button>
              <Button as={Link} to="/catalogo" variant="ghost" size="md">
                Seguir comprando
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
