import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, type RegisterPayload } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

type FormState = RegisterPayload & { passwordConfirm: string }

const INITIAL_FORM: FormState = {
  email: '',
  password: '',
  passwordConfirm: '',
  firstName: '',
  lastName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: 'AR',
}

type ValidationBody = {
  validations?: Record<string, string>
  message?: string
}

function extractFieldErrors(err: unknown): {
  fields: Record<string, string>
  message: string | null
} {
  if (err instanceof ApiError) {
    const body = err.body as ValidationBody | undefined
    if (body?.validations) {
      return { fields: body.validations, message: null }
    }
    return { fields: {}, message: body?.message ?? err.message }
  }
  return { fields: {}, message: 'No se pudo contactar al servidor. Intentá nuevamente.' }
}

interface FieldProps {
  label: string
  name: keyof FormState
  value: string
  onChange: (name: keyof FormState, value: string) => void
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
  error?: string
  maxLength?: number
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  autoComplete,
  placeholder,
  error,
  maxLength,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs tracking-widest uppercase text-ink-muted">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(name, e.target.value)}
        className={`border px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none transition-colors ${
          error ? 'border-red-600 focus:border-red-600' : 'border-ash focus:border-gold'
        }`}
      />
      {error ? (
        <p className="text-xs text-red-600 tracking-wide">{error}</p>
      ) : null}
    </div>
  )
}

export function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [topError, setTopError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const updateField = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (submitting) return

    setTopError(null)
    setFieldErrors({})

    if (form.password !== form.passwordConfirm) {
      setFieldErrors({ passwordConfirm: 'Las contraseñas no coinciden' })
      return
    }

    const payload: RegisterPayload = {
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone?.trim() || undefined,
      line1: form.line1.trim(),
      line2: form.line2?.trim() || undefined,
      city: form.city.trim(),
      region: form.region?.trim() || undefined,
      postalCode: form.postalCode.trim(),
      countryCode: form.countryCode.trim().toUpperCase(),
    }

    setSubmitting(true)
    try {
      await register(payload)
      navigate('/', { replace: true })
    } catch (err) {
      const { fields, message } = extractFieldErrors(err)
      setFieldErrors(fields)
      setTopError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-pearl flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <Divider className="mb-4 mx-auto" />
          <SectionTitle centered subtitle="Creá tu cuenta para comprar en Tempus">
            Crear Cuenta
          </SectionTitle>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-ash p-8 flex flex-col gap-8"
          noValidate
        >
          <fieldset className="flex flex-col gap-6">
            <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
              Cuenta
            </legend>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={updateField}
              error={fieldErrors.email}
              maxLength={100}
              placeholder="tu@email.com"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Contraseña"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={updateField}
                error={fieldErrors.password}
                maxLength={100}
                placeholder="Mínimo 6 caracteres"
              />
              <Field
                label="Confirmar contraseña"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                value={form.passwordConfirm}
                onChange={updateField}
                error={fieldErrors.passwordConfirm}
                maxLength={100}
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-6">
            <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
              Datos personales
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Nombre"
                name="firstName"
                autoComplete="given-name"
                required
                value={form.firstName}
                onChange={updateField}
                error={fieldErrors.firstName}
                maxLength={50}
              />
              <Field
                label="Apellido"
                name="lastName"
                autoComplete="family-name"
                required
                value={form.lastName}
                onChange={updateField}
                error={fieldErrors.lastName}
                maxLength={50}
              />
            </div>
            <Field
              label="Teléfono (opcional)"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone ?? ''}
              onChange={updateField}
              error={fieldErrors.phone}
              maxLength={30}
              placeholder="+54 11 1234 5678"
            />
          </fieldset>

          <fieldset className="flex flex-col gap-6">
            <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
              Dirección de envío
            </legend>
            <Field
              label="Dirección"
              name="line1"
              autoComplete="address-line1"
              required
              value={form.line1}
              onChange={updateField}
              error={fieldErrors.line1}
              maxLength={100}
              placeholder="Av. Corrientes 1234"
            />
            <Field
              label="Depto / Piso (opcional)"
              name="line2"
              autoComplete="address-line2"
              value={form.line2 ?? ''}
              onChange={updateField}
              error={fieldErrors.line2}
              maxLength={100}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Ciudad"
                name="city"
                autoComplete="address-level2"
                required
                value={form.city}
                onChange={updateField}
                error={fieldErrors.city}
                maxLength={50}
              />
              <Field
                label="Provincia / Región (opcional)"
                name="region"
                autoComplete="address-level1"
                value={form.region ?? ''}
                onChange={updateField}
                error={fieldErrors.region}
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Código postal"
                name="postalCode"
                autoComplete="postal-code"
                required
                value={form.postalCode}
                onChange={updateField}
                error={fieldErrors.postalCode}
                maxLength={20}
              />
              <Field
                label="País (código)"
                name="countryCode"
                autoComplete="country"
                required
                value={form.countryCode}
                onChange={updateField}
                error={fieldErrors.countryCode}
                maxLength={10}
                placeholder="AR"
              />
            </div>
          </fieldset>

          {topError ? (
            <p
              role="alert"
              className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3"
            >
              {topError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className={submitting ? 'opacity-60 cursor-not-allowed' : ''}
          >
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>

          <p className="text-xs text-ink-muted text-center">
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="text-gold hover:text-gold-dark tracking-widest uppercase"
            >
              Ingresar
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
