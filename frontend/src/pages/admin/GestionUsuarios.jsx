import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers, disableUser, clearActionError } from '@/redux/usersSlice'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

function roleBadge(role) {
  const base = 'inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border'
  if (role === 'ADMIN') return `${base} border-gold text-gold bg-gold/10`
  return `${base} border-ash text-ink-muted bg-smoke`
}

export function GestionUsuarios() {
  const dispatch = useDispatch()
  const { users, loadingUsers: loading, errorUsers: error, disablingId, actionError } = useSelector((state) => state.users)
  const [confirmDisable, setConfirmDisable] = useState(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const handleDisable = async (id) => {
    dispatch(clearActionError())
    const result = await dispatch(disableUser(id))
    if (!result.error) {
      setConfirmDisable(null)
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Administración de cuentas">
          Gestión de Usuarios
        </SectionTitle>
      </div>

      {actionError && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">{actionError}</p>
        </div>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">Cargando usuarios…</p>
      ) : error ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-sm text-red-600 tracking-widest uppercase">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-ash p-12 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => {
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ')
            const disabled = u.isActive === false
            return (
              <div key={u.id} className="bg-white border border-ash p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gold transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-display text-lg text-ink-primary truncate">{fullName || u.email}</p>
                    <span className={roleBadge(u.role)}>{u.role}</span>
                    {disabled && (
                      <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-red-600 text-red-600 bg-red-50">
                        Deshabilitado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mt-1">ID #{u.id} · {u.email}</p>
                </div>

                <div className="shrink-0">
                  {disabled ? (
                    <span className="text-xs tracking-widest uppercase text-ink-muted">—</span>
                  ) : (
                    <button
                      type="button"
                      disabled={disablingId === u.id}
                      onClick={() => setConfirmDisable(u)}
                      className="text-xs tracking-widest uppercase text-red-600 border border-red-600 px-4 py-2 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {disablingId === u.id ? 'Procesando…' : 'Deshabilitar'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-600 p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-2xl text-red-600 mb-2">Deshabilitar Usuario</h3>
            <p className="text-sm text-ink-secondary mb-8">
              La cuenta <span className="font-bold">#{confirmDisable.id}</span> ({confirmDisable.email}) no podrá iniciar sesión. ¿Continuar?
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDisable(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" className="!bg-red-600 !border-red-600 hover:!bg-red-700 hover:!border-red-700" onClick={() => handleDisable(confirmDisable.id)}>
                Deshabilitar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
