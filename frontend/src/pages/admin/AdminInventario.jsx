import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchLowStock, fetchOutOfStock, setThreshold } from '@/redux/productsSlice'
import { toNumber } from '@/lib/cart'
import { Divider } from '@/components/ui/Divider'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionTitle } from '@/components/ui/SectionTitle'

function ProductRow({ product }) {
  return (
    <Link
      to={`/admin/productos/editar/${product.id}`}
      className="bg-white border border-ash p-5 flex items-center justify-between gap-4 hover:border-gold transition-colors"
    >
      <div className="min-w-0">
        <p className="font-display text-lg text-ink-primary truncate">{product.name}</p>
        <p className="text-xs tracking-widest uppercase text-ink-muted mt-1">SKU: {product.sku ?? '—'}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="text-[10px] tracking-widest uppercase text-ink-muted">Stock</p>
          <p className={`text-lg font-display ${product.stock > 0 ? 'text-ink-primary' : 'text-red-600'}`}>
            {product.stock ?? 0}
          </p>
        </div>
        <PriceTag amount={toNumber(product.price)} className="text-base" />
      </div>
    </Link>
  )
}

function Section({ title, subtitle, loading, error, products, emptyText }) {
  return (
    <div className="mb-12">
      <h2 className="text-xs tracking-[0.3em] uppercase text-gold mb-1">{title}</h2>
      <p className="text-sm text-ink-muted mb-5">{subtitle}</p>
      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase py-8">Cargando…</p>
      ) : error ? (
        <div className="bg-white border border-ash p-6"><p className="text-sm text-red-600 tracking-widest uppercase">{error}</p></div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => <ProductRow key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

export function AdminInventario() {
  const dispatch = useDispatch()
  const {
    threshold,
    lowStock,
    outOfStock,
    loadingLow,
    loadingOut,
    errorLow,
    errorOut,
  } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchLowStock(threshold))
    dispatch(fetchOutOfStock())
  }, [dispatch, threshold])

  const handleApplyThreshold = () => {
    dispatch(fetchLowStock(threshold))
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Control de stock del catálogo">
          Inventario
        </SectionTitle>
      </div>

      <div className="bg-white border border-ash p-5 mb-10 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="threshold" className="text-[10px] tracking-widest uppercase text-ink-muted">Umbral de stock bajo</label>
          <input
            id="threshold"
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => dispatch(setThreshold(Number(e.target.value)))}
            className="w-28 border border-ash bg-pearl px-3 py-2 text-sm text-ink-primary focus:outline-none focus:border-gold"
          />
        </div>
        <button
          type="button"
          onClick={handleApplyThreshold}
          className="text-xs tracking-widest uppercase text-ink-primary border border-ash px-5 py-2.5 hover:border-gold transition-colors"
        >
          Aplicar
        </button>
      </div>

      <Section
        title="Stock bajo"
        subtitle={`Productos con stock menor o igual a ${threshold} unidades.`}
        loading={loadingLow}
        error={errorLow}
        products={lowStock}
        emptyText="No hay productos con stock bajo."
      />

      <Section
        title="Sin stock"
        subtitle="Productos agotados (stock en 0)."
        loading={loadingOut}
        error={errorOut}
        products={outOfStock}
        emptyText="No hay productos agotados."
      />
    </section>
  )
}
