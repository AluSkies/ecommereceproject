import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { toNumber } from '@/lib/cart'
import { apiGet, ApiError } from '@/lib/api'
import { statusClassName, statusLabel, type Order } from '@/lib/orders'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionTitle } from '@/components/ui/SectionTitle'

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function Orders() {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    setLoading(true)
    apiGet<Order[]>(`/orders/customer/${user.id}`, controller.signal)
      .then((list) => {
        const sorted = [...list].sort((a, b) => {
          const ta = new Date(a.placedAt ?? a.createdAt ?? 0).getTime()
          const tb = new Date(b.placedAt ?? b.createdAt ?? 0).getTime()
          return tb - ta
        })
        setOrders(sorted)
        setError(null)
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [user])

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: { pathname: '/mis-ordenes' } }}
        replace
      />
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Historial de compras y estado de verificación">
          Mis Órdenes
        </SectionTitle>
      </div>

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">
          Cargando órdenes…
        </p>
      ) : error ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-sm text-red-600 tracking-widest uppercase">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-ash p-12 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase mb-6">
            Aún no realizaste compras
          </p>
          <Button as={Link} to="/catalogo" variant="primary" size="md">
            Explorar catálogo
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orden/${order.id}`}
              className="bg-white border border-ash p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gold transition-colors"
            >
              <div className="flex-1">
                <p className="text-xs tracking-widest uppercase text-ink-muted">
                  {formatDate(order.placedAt ?? order.createdAt)}
                </p>
                <p className="font-display text-lg text-ink-primary mt-1">
                  #{order.orderNumber}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>

              <span
                className={`inline-block text-xs tracking-widest uppercase px-3 py-1 ${statusClassName(order.status)}`}
              >
                {statusLabel(order.status)}
              </span>

              <div className="text-right min-w-[7rem]">
                <p className="text-xs tracking-widest uppercase text-ink-muted">Total</p>
                <PriceTag amount={toNumber(order.grandTotal)} className="text-base" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
