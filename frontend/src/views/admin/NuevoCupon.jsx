import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Field } from '@/components/ui/Field'

export function NuevoCupon() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE', // Por defecto en el backend Tempus
    discountValue: '',
    minPurchase: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
  })

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: name === 'code' ? value.toUpperCase() : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      // Formateamos las fechas al formato que espera Spring Boot: YYYY-MM-DDTHH:mm:ss
      const formatDateTime = (dt) => (dt && dt.length === 16 ? `${dt}:00` : dt) || null

      const payload = {
        ...form,
        isActive: false, // Forzamos a que el backend lo guarde desactivado
        active: false,
        discountValue: Number(form.discountValue),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        validFrom: formatDateTime(form.validFrom),
        validUntil: formatDateTime(form.validUntil),
      }

      await apiPost('/discounts', payload)
      navigate('/admin/cupones') // Redirigir al listado
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el cupón. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <Divider className="mb-4 mx-auto" />
        <SectionTitle centered subtitle="Administración de descuentos">
          Crear Nuevo Cupón
        </SectionTitle>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ash p-8 flex flex-col gap-8"
      >
        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Datos del Cupón
          </legend>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Código (Ej: BIENVENIDA10)" name="code" required value={form.code} onChange={updateField} />
            <Field label="Porcentaje de Descuento (%)" name="discountValue" type="number" step="1" required value={form.discountValue} onChange={updateField} placeholder="10" />
          </div>

          <Field label="Descripción interna" name="description" required value={form.description} onChange={updateField} placeholder="Ej: Descuento de primavera" />
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Condiciones
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Compra Mínima (ARS)" name="minPurchase" type="number" step="0.01" value={form.minPurchase} onChange={updateField} placeholder="0.00" />
            <Field label="Cantidad Máxima de Usos" name="maxUses" type="number" value={form.maxUses} onChange={updateField} placeholder="Ilimitado si está vacío" />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Vigencia
          </legend>
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
            {submitting ? 'Creando…' : 'Guardar Cupón'}
          </Button>
        </div>
      </form>
    </section>
  )
}