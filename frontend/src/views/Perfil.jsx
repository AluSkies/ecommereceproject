import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { apiGet, apiPut, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Field } from '@/components/ui/Field'

const EMPTY_FORM = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: 'AR',
  password: '',
}

export function Perfil() {
  const { isAuthenticated, user, updateUser } = useAuth()

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    const controller = new AbortController()
    setLoading(true)
    // GET /api/v1/users/me — el backend resuelve el usuario logueado por el token.
    apiGet('/users/me', controller.signal)
      .then((data) => {
        setForm({ ...EMPTY_FORM, ...data, password: '' })
        setLoadError(null)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar tu perfil.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/perfil' } }} replace />
  }

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    setSubmitting(true)

    try {
      // Sólo enviamos password si el usuario escribió una nueva.
      const payload = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        postalCode: form.postalCode.trim(),
        countryCode: form.countryCode.trim().toUpperCase(),
      }
      if (form.password.trim()) payload.password = form.password.trim()

      const updated = await apiPut(`/users/${user.id}`, payload)
      // Refrescamos el usuario en contexto para que Navbar / Checkout vean los nuevos datos.
      updateUser(updated ?? payload)
      setForm((prev) => ({ ...prev, ...(updated ?? {}), password: '' }))
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const validations = err.body?.validations
        if (validations && typeof validations === 'object') {
          setFieldErrors(validations)
          setError('Revisá los campos marcados.')
        } else {
          setError(err.message)
        }
      } else {
        setError('No se pudieron guardar los cambios.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted text-sm tracking-widest uppercase">
        Cargando tu perfil…
      </div>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <Divider className="mb-4 mx-auto" />
        <SectionTitle centered subtitle="Tus datos personales y de envío">
          Mi Perfil
        </SectionTitle>
      </div>

      {loadError && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">{loadError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-ash p-8 flex flex-col gap-8">
        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Cuenta</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} maxLength={100} autoComplete="email" error={fieldErrors.email} />
            <Field label="Nueva contraseña (opcional)" name="password" type="password" value={form.password} onChange={updateField} placeholder="Dejar vacío para no cambiarla" autoComplete="new-password" error={fieldErrors.password} />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Datos personales</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Nombre" name="firstName" value={form.firstName} onChange={updateField} maxLength={50} autoComplete="given-name" error={fieldErrors.firstName} />
            <Field label="Apellido" name="lastName" value={form.lastName} onChange={updateField} maxLength={50} autoComplete="family-name" error={fieldErrors.lastName} />
          </div>
          <Field label="Teléfono" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={30} autoComplete="tel" placeholder="+54 11 1234 5678" error={fieldErrors.phone} />
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Dirección</legend>
          <Field label="Dirección" name="line1" value={form.line1} onChange={updateField} maxLength={100} autoComplete="address-line1" error={fieldErrors.line1} />
          <Field label="Depto / Piso (opcional)" name="line2" value={form.line2} onChange={updateField} maxLength={100} autoComplete="address-line2" error={fieldErrors.line2} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Ciudad" name="city" value={form.city} onChange={updateField} maxLength={50} autoComplete="address-level2" error={fieldErrors.city} />
            <Field label="Provincia / Región" name="region" value={form.region} onChange={updateField} maxLength={50} autoComplete="address-level1" error={fieldErrors.region} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Código postal" name="postalCode" value={form.postalCode} onChange={updateField} maxLength={20} autoComplete="postal-code" error={fieldErrors.postalCode} />
            <Field label="País" name="countryCode" value={form.countryCode} onChange={updateField} maxLength={10} autoComplete="country" error={fieldErrors.countryCode} />
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs tracking-widest uppercase text-gold border-l-2 border-gold pl-3">
            Cambios guardados correctamente.
          </p>
        )}

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary" size="lg" disabled={submitting} className={submitting ? 'opacity-60 cursor-not-allowed' : ''}>
            {submitting ? 'Guardando…' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </section>
  )
}
