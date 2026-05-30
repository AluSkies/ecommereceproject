import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { toNumber } from '@/lib/cart'
import { apiGet, apiPatch, ApiError } from '@/lib/api'
import { statusClassName, statusLabel } from '@/lib/orders'
import { Divider } from '@/components/ui/Divider'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Button } from '@/components/ui/Button'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Máquina de estados oficial del backend Tempus
const VALID_TRANSITIONS = {
  'PENDING': ['PENDING', 'CONFIRMED', 'CANCELLED'],
  'CONFIRMED': ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  'PROCESSING': ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  'SHIPPED': ['SHIPPED', 'DELIVERED'],
  'DELIVERED': ['DELIVERED', 'REFUNDED'],
  'CANCELLED': ['CANCELLED'],
  'REFUNDED': ['REFUNDED']
}

function getAvailableStatuses(status) {
  return VALID_TRANSITIONS[status] || [status]
}

export function AdminOrdenes() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmStatus, setConfirmStatus] = useState(null)
  const [actionError, setActionError] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    // El backend expone /orders para traer todas las órdenes (solo admin)
    apiGet('/orders')
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
        setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const executeStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    setActionError(null)
    try {
      await apiPatch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: `Estado actualizado a ${newStatus} por el administrador`,
        changedBy: user.id
      })
      // Refrescar para ver el cambio en la lista
      fetchOrders()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Error al actualizar el estado de la orden.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center sm:text-left">
        <Divider className="mb-4 mx-auto sm:mx-0" />
        <SectionTitle subtitle="Control de ventas y logística">
          Gestión de Órdenes
        </SectionTitle>
      </div>

      {actionError && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">Error: {actionError}</p>
        </div>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">
          Cargando ventas globales…
        </p>
      ) : error ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-sm text-red-600 tracking-widest uppercase">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-ash p-12 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase mb-6">
            Aún no hay órdenes registradas en la tienda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-ash p-5 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-gold transition-colors"
            >
              <div className="flex-1">
                <p className="text-xs tracking-widest uppercase text-ink-muted">
                  {formatDate(order.placedAt ?? order.createdAt)}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <Link to={`/orden/${order.id}`} className="font-display text-lg text-ink-primary hover:text-gold transition-colors">
                    #{order.orderNumber}
                  </Link>
                  <span className={`inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 ${statusClassName(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  ID Cliente: {order.customerId} — {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] tracking-widest uppercase text-ink-muted">Cambiar Estado</label>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => setConfirmStatus({ orderId: order.id, newStatus: e.target.value })}
                    className="text-xs border border-ash bg-pearl px-2 py-1.5 text-ink-primary focus:outline-none focus:border-gold cursor-pointer disabled:opacity-50"
                  >
                    {getAvailableStatuses(order.status).map(s => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>

                <div className="text-right min-w-[7rem]">
                  <p className="text-[10px] tracking-widest uppercase text-ink-muted">Total Venta</p>
                  <PriceTag amount={toNumber(order.grandTotal)} className="text-base" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Confirmar Estado */}
      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-ash p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-2xl text-ink-primary mb-2">Confirmar estado</h3>
            <p className="text-sm text-ink-secondary mb-8">
              ¿Cambiar la orden al estado <span className="font-bold text-gold">{statusLabel(confirmStatus.newStatus)}</span>?
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmStatus(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => { executeStatusChange(confirmStatus.orderId, confirmStatus.newStatus); setConfirmStatus(null); }}>Aceptar</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}