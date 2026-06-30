import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchDiscounts,
  toggleDiscountStatus,
  deleteDiscount,
  setFilter,
  clearActionError,
} from '@/redux/discountsSlice'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

// Cada filtro mapea a un endpoint distinto del DiscountController.
const FILTERS = [
  { key: 'all', label: 'Todos', path: '/discounts' },
  { key: 'valid', label: 'Vigentes', path: '/discounts/active/valid' },
  { key: 'active', label: 'Activos', path: '/discounts/status/ACTIVE' },
  { key: 'expired', label: 'Vencidos', path: '/discounts/expired' },
  { key: 'scheduled', label: 'Programados', path: '/discounts/scheduled' },
]

export function GestionCupones() {
  const dispatch = useDispatch()
  const { discounts, filter, loading, error, actionError } = useSelector((state) => state.discounts)

  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    dispatch(fetchDiscounts(filter))
  }, [dispatch, filter])

  const executeToggle = async (discount) => {
    dispatch(clearActionError())
    dispatch(toggleDiscountStatus(discount))
  }

  const executeDelete = async (id) => {
    dispatch(clearActionError())
    dispatch(deleteDiscount(id))
  }

  const renderStatus = (discount) => {
    const st = discount.status || (discount.active ? 'ACTIVE' : 'DISABLED')
    if (st === 'ACTIVE') {
      return <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-gold text-gold bg-gold/10">Activo</span>
    }
    if (st === 'EXPIRED') {
      return <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-red-600 text-red-600 bg-red-50">Expirado</span>
    }
    return <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-ash text-ink-muted bg-smoke">Inactivo</span>
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Divider className="mb-4" />
          <SectionTitle subtitle="Administración de descuentos y promociones">
            Gestión de Cupones
          </SectionTitle>
        </div>
        <Button as={Link} to="/admin/cupones/nuevo" variant="primary" size="md">
          + Crear Nuevo Cupón
        </Button>
      </div>

      {/* Filtros — cada uno consume un endpoint distinto del backend */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => dispatch(setFilter(f.key))}
            className={`text-xs tracking-widest uppercase px-4 py-2 border transition-colors ${
              filter === f.key
                ? 'border-gold text-gold bg-gold/10'
                : 'border-ash text-ink-muted hover:border-gold hover:text-ink-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">Atención: {actionError}</p>
        </div>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">
          Cargando cupones…
        </p>
      ) : error ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-sm text-red-600 tracking-widest uppercase">{error}</p>
        </div>
      ) : discounts.length === 0 ? (
        <div className="bg-white border border-ash p-12 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase mb-6">
            No hay cupones registrados
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="bg-white border border-ash p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gold transition-colors"
            >
              <div className="flex-1">
                <p className="text-xs tracking-widest uppercase text-ink-muted">
                  Código:
                </p>
                <p className="font-display text-2xl text-ink-primary mt-1">
                  {discount.code}
                </p>
                <p className="text-sm text-ink-secondary mt-1">
                  {discount.description} — {discount.discountValue}% OFF
                </p>
              </div>

              {renderStatus(discount)}

              <div className="flex gap-4 sm:ml-4 mt-4 sm:mt-0 items-center min-w-[14rem] justify-end">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] tracking-widest uppercase text-ink-muted">Cambiar Estado</label>
                  <select
                    value={(discount.status === 'ACTIVE' || discount.active) ? 'true' : 'false'}
                    onChange={(e) => {
                      const isCurrentlyActive = discount.status === 'ACTIVE' || discount.active;
                      if (e.target.value !== (isCurrentlyActive ? 'true' : 'false')) {
                        setConfirmToggle(discount)
                      }
                    }}
                    className="text-xs border border-ash bg-pearl px-2 py-1.5 text-ink-primary focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Pausado / Inactivo</option>
                  </select>
                </div>
                <Link
                  to={`/admin/cupones/editar/${discount.id}`}
                  className="text-xs tracking-widest uppercase text-ink-muted hover:text-gold transition-colors mt-4"
                >
                  Editar
                </Link>
                <button
                  onClick={() => setConfirmDelete(discount.id)}
                  className="text-xs tracking-widest uppercase text-ink-muted hover:text-red-600 transition-colors mt-4"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Confirmar Toggle */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-ash p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-2xl text-ink-primary mb-2">Confirmar acción</h3>
            <p className="text-sm text-ink-secondary mb-8">
              ¿Deseas {(confirmToggle.status === 'ACTIVE' || confirmToggle.active) ? 'pausar/desactivar' : 'activar'} el cupón <span className="font-bold">{confirmToggle.code}</span>?
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmToggle(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => { executeToggle(confirmToggle); setConfirmToggle(null); }}>Aceptar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-600 p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-2xl text-red-600 mb-2">Eliminar Cupón</h3>
            <p className="text-sm text-ink-secondary mb-8">
              Esta acción no se puede deshacer. ¿Continuar?
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" className="!bg-red-600 !border-red-600 hover:!bg-red-700 hover:!border-red-700" onClick={() => { executeDelete(confirmDelete); setConfirmDelete(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}