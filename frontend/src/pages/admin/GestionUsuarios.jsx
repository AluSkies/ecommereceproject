import { useState } from 'react'
import { usersApiGet, usersApiPatch, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[10rem,1fr] gap-4 py-2 border-b border-ash last:border-b-0">
      <dt className="text-xs tracking-widest uppercase text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink-primary">{value || '—'}</dd>
    </div>
  )
}

export function GestionUsuarios() {
  const [searchId, setSearchId] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [notice, setNotice] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    const id = searchId.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    setNotice(null)
    setFoundUser(null)
    try {
      // GET /api/users/{id} — no existe endpoint para listar todos los usuarios.
      const user = await usersApiGet(`/users/${id}`)
      setFoundUser(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se encontró un usuario con ese ID.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setDisabling(true)
    setError(null)
    try {
      await usersApiPatch(`/users/${foundUser.id}/disable`, {})
      setFoundUser((prev) => ({ ...prev, isActive: false }))
      setNotice('El usuario fue deshabilitado.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo deshabilitar el usuario.')
    } finally {
      setDisabling(false)
      setConfirmDisable(false)
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Administración de cuentas">
          Gestión de Usuarios
        </SectionTitle>
      </div>

      <p className="text-sm text-ink-muted mb-6">
        El backend no expone un listado de usuarios. Buscá una cuenta por su ID para ver sus datos o deshabilitarla.
      </p>

      <form onSubmit={handleSearch} className="bg-white border border-ash p-6 mb-8 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="searchId" className="text-[10px] tracking-widest uppercase text-ink-muted">ID de usuario</label>
          <input
            id="searchId"
            type="number"
            min={1}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="2"
            className="w-32 border border-ash bg-pearl px-3 py-2 text-sm text-ink-primary focus:outline-none focus:border-gold"
          />
        </div>
        <Button type="submit" variant="primary" size="md" disabled={loading} className={loading ? 'opacity-60 cursor-not-allowed' : ''}>
          {loading ? 'Buscando…' : 'Buscar'}
        </Button>
      </form>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">{error}</p>
        </div>
      )}
      {notice && (
        <div className="mb-8 bg-gold/10 border border-gold p-4">
          <p className="text-sm tracking-widest uppercase text-gold">{notice}</p>
        </div>
      )}

      {foundUser && (
        <div className="bg-white border border-ash p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-display text-2xl text-ink-primary">
                {[foundUser.firstName, foundUser.lastName].filter(Boolean).join(' ') || foundUser.email}
              </p>
              <p className="text-xs tracking-widest uppercase text-ink-muted mt-1">ID #{foundUser.id} · {foundUser.role}</p>
            </div>
            <span className={`inline-block text-[10px] tracking-widest uppercase px-3 py-1 border ${
              foundUser.isActive === false
                ? 'border-red-600 text-red-600 bg-red-50'
                : 'border-gold text-gold bg-gold/10'
            }`}>
              {foundUser.isActive === false ? 'Deshabilitado' : 'Activo'}
            </span>
          </div>

          <dl>
            <Row label="Email" value={foundUser.email} />
            <Row label="Teléfono" value={foundUser.phone} />
            <Row label="Dirección" value={[foundUser.line1, foundUser.line2].filter(Boolean).join(', ')} />
            <Row label="Ciudad" value={foundUser.city} />
            <Row label="Región" value={foundUser.region} />
            <Row label="Código postal" value={foundUser.postalCode} />
            <Row label="País" value={foundUser.countryCode} />
          </dl>

          {foundUser.isActive !== false && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmDisable(true)}
                className="text-xs tracking-widest uppercase text-red-600 border border-red-600 px-5 py-3 hover:bg-red-600 hover:text-white transition-colors"
              >
                Deshabilitar usuario
              </button>
            </div>
          )}
        </div>
      )}

      {confirmDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-600 p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-2xl text-red-600 mb-2">Deshabilitar Usuario</h3>
            <p className="text-sm text-ink-secondary mb-8">
              La cuenta <span className="font-bold">#{foundUser?.id}</span> no podrá iniciar sesión. ¿Continuar?
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDisable(false)} disabled={disabling}>Cancelar</Button>
              <Button variant="primary" size="sm" className="!bg-red-600 !border-red-600 hover:!bg-red-700 hover:!border-red-700" onClick={handleDisable} disabled={disabling}>
                {disabling ? 'Procesando…' : 'Deshabilitar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
