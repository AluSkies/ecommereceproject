import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiPut, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

// Reutilizamos el diseño exacto de los inputs de tu marca
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

export function EditarProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
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

  // Al cargar la página, traemos los datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiGet(`/products/${id}`)
        setForm({
          sku: data.sku || '',
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price ? String(data.price) : '',
          compareAtPrice: data.compareAtPrice ? String(data.compareAtPrice) : '',
          stock: data.stock !== undefined ? String(data.stock) : '',
          category: data.category || 'LUXURY',
          brandId: data.brandId ? String(data.brandId) : '1',
          caliber: data.caliber || '',
          caseSize: data.caseSize || '',
          strapMaterial: data.strapMaterial || '',
          // Extraemos la URL de la primera imagen (como lo armamos en el backend)
          imageUrl: data.images && data.images.length > 0 ? data.images[0].url : '',
        })
      } catch (err) {
        setError('No se pudo cargar el producto para editar.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      // Preparamos el payload como lo espera el PUT /products/{id} en tu backend
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stock: Number(form.stock),
        brandId: Number(form.brandId),
        images: form.imageUrl ? [{ url: form.imageUrl, sortOrder: 1, altText: form.name }] : []
      }

      await apiPut(`/products/${id}`, payload)
      // Si se actualizó bien, lo mandamos a ver cómo quedó el producto
      navigate(`/producto/${id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el producto. Intentá nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted text-sm tracking-widest uppercase">
        Cargando datos del producto…
      </div>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <Divider className="mb-4 mx-auto" />
        <SectionTitle centered subtitle="Administración de catálogo">
          Editar Producto
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
              <select id="category" name="category" value={form.category} onChange={(e) => updateField('category', e.target.value)} className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors">
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

        {error && <p role="alert" className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3">{error}</p>}

        <div className="flex gap-4 mt-4">
          <Button as={Link} to={`/producto/${id}`} variant="ghost" size="lg" className="w-full text-center">Cancelar</Button>
          <Button type="submit" variant="primary" size="lg" disabled={submitting} className={`w-full ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {submitting ? 'Guardando…' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </section>
  )
}