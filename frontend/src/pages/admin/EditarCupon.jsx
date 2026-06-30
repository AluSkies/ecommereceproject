import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiPut, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Field } from '@/components/ui/Field'

// Recorta un ISO datetime ('2026-04-01T00:00:00') al formato de <input datetime-local> ('2026-04-01T00:00')
function toLocalInput(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

export function EditarCupon() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
  })

  useEffect(() => {
    const controller = new AbortController()
    apiGet(`/discounts/${id}`, controller.signal)
      .then((data) => {
        setForm({
          code: data.code ?? '',
          description: data.description ?? '',
          discountType: data.discountType ?? 'PERCENTAGE',
          discountValue: data.discountValue != null ? String(data.discountValue) : '',
          minPurchase: data.minPurchase != null ? String(data.minPurchase) : '',
          maxUses: data.maxUses != null ? String(data.maxUses) : '',
          validFrom: toLocalInput(data.validFrom),
          validUntil: toLocalInput(data.validUntil),
        })
        setLoadError(null)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el cupón.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: name === 'code' ? value.toUpperCase() : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      const formatDateTime = (dt) => (dt && dt.length === 16 ? `${dt}:00` : dt) || null
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        validFrom: formatDateTime(form.validFrom),
        validUntil: formatDateTime(form.validUntil),
      }
      await apiPut(`/discounts/${id}`, payload)
      navigate('/admin/cupones')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el cupón. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted text-sm tracking-widest uppercase">
        Cargando datos del cupón…
      </div>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <Divider className="mb-4 mx-auto" />
        <SectionTitle centered subtitle="Administración de descuentos">
          Editar Cupón
        </SectionTitle>
      </div>

      {loadError && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">{loadError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-ash p-8 flex flex-col gap-8">
        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Datos del Cupón</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Código (Ej: BIENVENIDA10)" name="code" required value={form.code} onChange={updateField} />
            <Field label="Porcentaje de Descuento (%)" name="discountValue" type="number" step="1" required value={form.discountValue} onChange={updateField} placeholder="10" />
          </div>
          <Field label="Descripción interna" name="description" required value={form.description} onChange={updateField} placeholder="Ej: Descuento de primavera" />
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Condiciones</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Compra Mínima (ARS)" name="minPurchase" type="number" step="0.01" value={form.minPurchase} onChange={updateField} placeholder="0.00" />
            <Field label="Cantidad Máxima de Usos" name="maxUses" type="number" value={form.maxUses} onChange={updateField} placeholder="Ilimitado si está vacío" />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Vigencia</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Válido Desde" name="validFrom" type="datetime-local" required value={form.validFrom} onChange={updateField} />
            <Field label="Válido Hasta" name="validUntil" type="datetime-local" required value={form.validUntil} onChange={updateField} />
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">
            {error}
          </p>
        )}

        <div className="flex gap-4 mt-4">
          <Button as={Link} to="/admin/cupones" variant="ghost" size="lg" className="w-full text-center">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg" disabled={submitting} className={`w-full ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {submitting ? 'Guardando…' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </section>
  )
}
