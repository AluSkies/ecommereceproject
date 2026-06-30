import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, ApiError } from '@/lib/api'
import { clearCatalogCache } from '@/features/catalog'

import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

// Reutilizamos el diseño de tus inputs para mantener la coherencia
function Field({ label, name, value, onChange, type = 'text', required = false, placeholder, step }) {
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
        step={step}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors"
      />
    </div>
  )
}

export function NuevoProducto() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    sku: '',
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    category: 'LUXURY',
    brandId: '1',
    caliber: '',
    caseSize: '',
    strapMaterial: '',
    imageUrl: '',
  })

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      // Adaptamos los datos al formato que espera el backend Tempus
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stock: Number(form.stock),
        brandId: Number(form.brandId),
        // Envolvemos la URL de la imagen en el array que espera el backend
        images: form.imageUrl ? [{ url: form.imageUrl, sortOrder: 1, altText: form.name }] : []
      }

      const res = await apiPost('/products', payload)
      // Si se crea bien, lo mandamos a ver el producto nuevo
      clearCatalogCache()
      navigate(`/producto/${res.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el producto. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <Divider className="mb-4 mx-auto" />
        <SectionTitle centered subtitle="Administración de catálogo">
          Agregar Nuevo Producto
        </SectionTitle>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ash p-8 flex flex-col gap-8"
      >
        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Información Principal
          </legend>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Nombre del Reloj" name="name" required value={form.name} onChange={updateField} placeholder="Ej: Rolex Submariner" />
            <Field label="SKU" name="sku" required value={form.sku} onChange={updateField} placeholder="Ej: ROL-SUB-001" />
          </div>

          <Field label="Slug (URL amigable)" name="slug" required value={form.slug} onChange={updateField} placeholder="Ej: rolex-submariner" />
          
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-xs tracking-widest uppercase text-ink-muted">
              Descripción <span className="text-gold">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Precios e Inventario
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Field label="Precio (ARS)" name="price" type="number" step="0.01" required value={form.price} onChange={updateField} placeholder="0.00" />
            <Field label="Precio Anterior (Opcional)" name="compareAtPrice" type="number" step="0.01" value={form.compareAtPrice} onChange={updateField} placeholder="0.00" />
            <Field label="Stock Disponible" name="stock" type="number" required value={form.stock} onChange={updateField} placeholder="0" />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            Especificaciones y Categoría
          </legend>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-xs tracking-widest uppercase text-ink-muted">
                Categoría <span className="text-gold">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors"
              >
                <option value="LUXURY">LUXURY</option>
                <option value="SPORT">SPORT</option>
                <option value="VINTAGE">VINTAGE</option>
                <option value="DRESS">DRESS</option>
              </select>
            </div>
            <Field label="ID de Marca" name="brandId" type="number" required value={form.brandId} onChange={updateField} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Field label="Calibre (Movimiento)" name="caliber" value={form.caliber} onChange={updateField} placeholder="Ej: Automático" />
            <Field label="Tamaño de Caja" name="caseSize" value={form.caseSize} onChange={updateField} placeholder="Ej: 42mm" />
            <Field label="Material de Correa" name="strapMaterial" value={form.strapMaterial} onChange={updateField} placeholder="Ej: Acero" />
          </div>

          <Field label="URL de la Imagen" name="imageUrl" required value={form.imageUrl} onChange={updateField} placeholder="https://ejemplo.com/imagen.jpg" />
        </fieldset>

        {error ? (
          <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">
            {error}
          </p>
        ) : null}

        <div className="flex gap-4 mt-4">
          <Button as={Link} to="/catalogo" variant="ghost" size="lg" className="w-full text-center">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg" disabled={submitting} className={`w-full ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {submitting ? 'Guardando…' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </section>
  )
}