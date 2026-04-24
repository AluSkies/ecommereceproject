import { useMemo, useRef, useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useCart, toNumber } from '@/lib/cart'
import { apiPost, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { PriceTag } from '@/components/ui/PriceTag'
import { SectionTitle } from '@/components/ui/SectionTitle'

interface ShippingForm {
  firstName: string
  lastName: string
  phone: string
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  countryCode: string
}

interface CheckoutPayload extends ShippingForm {
  cartId: number
  customerId: number
}

interface OrderItemResponse {
  productId: number
  productName: string
  unitPrice: number | string
  quantity: number
  lineTotal: number | string
}

interface OrderResponse {
  id: number
  orderNumber: string
  status: string
  items: OrderItemResponse[]
  subtotal: number | string
  discountTotal: number | string
  shippingTotal: number | string
  taxTotal: number | string
  grandTotal: number | string
  currency: string
}

// Datos bancarios hardcoded para la demo (transferencia)
const BANK_INFO = {
  bank: 'Banco Tempus',
  accountHolder: 'Tempus Relojería S.A.',
  cbu: '0000003100012345678901',
  alias: 'TEMPUS.RELOJES.AR',
  cuit: '30-70123456-7',
}

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']

interface FieldProps {
  label: string
  name: keyof ShippingForm
  value: string
  onChange: (name: keyof ShippingForm, value: string) => void
  required?: boolean
  maxLength?: number
  autoComplete?: string
  placeholder?: string
  type?: string
}

function Field({
  label,
  name,
  value,
  onChange,
  required,
  maxLength,
  autoComplete,
  placeholder,
  type = 'text',
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
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  )
}

export function Checkout() {
  const { user, isAuthenticated } = useAuth()
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ShippingForm>(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    line1: user?.line1 ?? '',
    line2: user?.line2 ?? '',
    city: user?.city ?? '',
    region: user?.region ?? '',
    postalCode: user?.postalCode ?? '',
    countryCode: user?.countryCode ?? 'AR',
  }))
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!receipt) {
      setReceiptPreview(null)
      return
    }
    if (!receipt.type.startsWith('image/')) {
      setReceiptPreview(null)
      return
    }
    const url = URL.createObjectURL(receipt)
    setReceiptPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [receipt])

  const items = cart?.items ?? []

  const totals = useMemo(() => {
    const subtotal = toNumber(cart?.subtotal)
    const taxTotal = Math.round(subtotal * 0.21 * 100) / 100
    const shippingTotal = subtotal > 0 ? 15000 : 0
    const grandTotal = Math.round((subtotal + taxTotal + shippingTotal) * 100) / 100
    return { subtotal, taxTotal, shippingTotal, grandTotal }
  }, [cart])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />
  }

  if (!cart || items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <Divider className="mb-4 mx-auto" />
        <SectionTitle centered subtitle="No hay productos para finalizar la compra">
          Checkout
        </SectionTitle>
        <div className="mt-8">
          <Button as={Link} to="/catalogo" variant="primary" size="md">
            Ir al catálogo
          </Button>
        </div>
      </section>
    )
  }

  const updateField = (name: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleReceiptChange = (file: File | null) => {
    setReceiptError(null)
    if (!file) {
      setReceipt(null)
      return
    }
    if (!ACCEPTED_RECEIPT_TYPES.includes(file.type)) {
      setReceipt(null)
      setReceiptError('Formato no válido. Subí una imagen (PNG/JPG/WEBP) o PDF.')
      return
    }
    if (file.size > MAX_RECEIPT_SIZE) {
      setReceipt(null)
      setReceiptError('El archivo supera los 5 MB.')
      return
    }
    setReceipt(file)
  }

  const missingShipping = () => {
    const required: (keyof ShippingForm)[] = [
      'firstName',
      'lastName',
      'line1',
      'city',
      'postalCode',
      'countryCode',
    ]
    return required.some((k) => !form[k].trim())
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitError(null)

    if (!user || !cart) return
    if (missingShipping()) {
      setSubmitError('Completá los campos obligatorios de envío.')
      return
    }
    if (!receipt) {
      setReceiptError('Adjuntá el comprobante de transferencia para continuar.')
      return
    }

    const payload: CheckoutPayload = {
      cartId: cart.id,
      customerId: user.id,
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

    setSubmitting(true)
    try {
      const order = await apiPost<OrderResponse>('/orders/checkout', payload)
      // Nota (demo): el comprobante queda solo en el cliente. El backend no persiste el archivo.
      // La orden se crea con estado PENDING a la espera de verificación manual del pago.
      try {
        await clearCart()
      } catch (err) {
        console.warn('No se pudo limpiar el carrito local', err)
      }
      navigate(`/orden/${order.id}`, { replace: true, state: { order } })
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message || 'No se pudo procesar el checkout')
      } else {
        setSubmitError('No se pudo contactar al servidor. Intentá nuevamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Completá tus datos y adjuntá el comprobante de transferencia">
          Finalizar Compra
        </SectionTitle>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Shipping */}
          <fieldset className="bg-white border border-ash p-6 flex flex-col gap-6">
            <legend className="text-xs tracking-[0.3em] uppercase text-gold">
              Datos de envío
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Nombre" name="firstName" value={form.firstName} onChange={updateField} required maxLength={50} autoComplete="given-name" />
              <Field label="Apellido" name="lastName" value={form.lastName} onChange={updateField} required maxLength={50} autoComplete="family-name" />
            </div>
            <Field
              label="Teléfono"
              name="phone"
              value={form.phone}
              onChange={updateField}
              type="tel"
              maxLength={30}
              autoComplete="tel"
              placeholder="+54 11 1234 5678"
            />
            <Field label="Dirección" name="line1" value={form.line1} onChange={updateField} required maxLength={100} autoComplete="address-line1" />
            <Field label="Depto / Piso (opcional)" name="line2" value={form.line2} onChange={updateField} maxLength={100} autoComplete="address-line2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Ciudad" name="city" value={form.city} onChange={updateField} required maxLength={50} autoComplete="address-level2" />
              <Field label="Provincia / Región" name="region" value={form.region} onChange={updateField} maxLength={50} autoComplete="address-level1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Código postal" name="postalCode" value={form.postalCode} onChange={updateField} required maxLength={20} autoComplete="postal-code" />
              <Field label="País" name="countryCode" value={form.countryCode} onChange={updateField} required maxLength={10} autoComplete="country" />
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="bg-white border border-ash p-6 flex flex-col gap-6">
            <legend className="text-xs tracking-[0.3em] uppercase text-gold">
              Pago — Transferencia bancaria
            </legend>

            <div className="bg-pearl border border-ash p-5 text-sm text-ink-secondary">
              <p className="text-xs tracking-widest uppercase text-ink-muted mb-3">
                Realizá la transferencia a los siguientes datos:
              </p>
              <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                <dt className="text-ink-muted">Banco</dt>
                <dd className="text-ink-primary">{BANK_INFO.bank}</dd>
                <dt className="text-ink-muted">Titular</dt>
                <dd className="text-ink-primary">{BANK_INFO.accountHolder}</dd>
                <dt className="text-ink-muted">CUIT</dt>
                <dd className="text-ink-primary">{BANK_INFO.cuit}</dd>
                <dt className="text-ink-muted">CBU</dt>
                <dd className="text-ink-primary font-mono">{BANK_INFO.cbu}</dd>
                <dt className="text-ink-muted">Alias</dt>
                <dd className="text-ink-primary font-mono">{BANK_INFO.alias}</dd>
              </dl>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="receipt" className="text-xs tracking-widest uppercase text-ink-muted">
                Comprobante de transferencia <span className="text-gold">*</span>
              </label>
              <input
                ref={fileInputRef}
                id="receipt"
                name="receipt"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
                className="text-sm text-ink-secondary file:mr-4 file:py-2 file:px-4 file:border file:border-ash file:bg-pearl file:text-xs file:tracking-widest file:uppercase file:text-ink-primary file:cursor-pointer hover:file:bg-white"
              />
              <p className="text-xs text-ink-muted">
                PNG / JPG / WEBP / PDF · hasta 5 MB. Para esta demo el archivo no se envía al
                servidor — solo valida que lo adjuntaste.
              </p>

              {receipt ? (
                <div className="flex items-start gap-4 border border-ash bg-pearl p-3">
                  {receiptPreview ? (
                    <img
                      src={receiptPreview}
                      alt="Previsualización del comprobante"
                      className="w-20 h-20 object-cover border border-ash"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center border border-ash bg-white text-xs tracking-widest uppercase text-ink-muted">
                      PDF
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-primary truncate">{receipt.name}</p>
                    <p className="text-xs text-ink-muted">
                      {(receipt.size / 1024).toFixed(0)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReceipt(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-xs tracking-widest uppercase text-ink-muted hover:text-red-600 mt-2 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : null}

              {receiptError ? (
                <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">
                  {receiptError}
                </p>
              ) : null}
            </div>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="bg-white border border-ash p-6 h-fit sticky top-24 flex flex-col gap-4">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">Resumen de orden</p>

          <ul className="flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span className="text-ink-secondary truncate">
                  {item.quantity} × {item.productName}
                </span>
                <PriceTag amount={toNumber(item.lineTotal)} className="text-sm whitespace-nowrap" />
              </li>
            ))}
          </ul>

          <div className="border-t border-ash pt-4 text-sm flex flex-col gap-1">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <PriceTag amount={totals.subtotal} className="text-sm text-ink-primary" />
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Envío</span>
              <PriceTag amount={totals.shippingTotal} className="text-sm text-ink-primary" />
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>IVA (21%)</span>
              <PriceTag amount={totals.taxTotal} className="text-sm text-ink-primary" />
            </div>
          </div>

          <div className="border-t border-ash pt-4 flex items-center justify-between">
            <span className="text-xs tracking-widest uppercase text-ink-muted">Total estimado</span>
            <PriceTag amount={totals.grandTotal} className="text-lg" />
          </div>
          <p className="text-xs text-ink-muted">
            El total final lo calcula el backend al confirmar la orden.
          </p>

          {submitError ? (
            <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className={`w-full ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Procesando…' : 'Confirmar orden'}
          </Button>

          <Link
            to="/carrito"
            className="text-xs tracking-widest uppercase text-ink-muted hover:text-gold text-center"
          >
            Volver al carrito
          </Link>
        </aside>
      </form>
    </section>
  )
}
