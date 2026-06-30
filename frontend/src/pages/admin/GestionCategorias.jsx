import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearActionError,
} from '@/redux/categoriesSlice'
import { clearCatalogCache } from '@/features/catalog'

import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Field } from '@/components/ui/Field'

export function GestionCategorias() {
  const dispatch = useDispatch()
  const { categories, loading, error, actionError } = useSelector((state) => state.categories)

  // Alta
  const [newId, setNewId] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Edición inline
  const [editing, setEditing] = useState(null) // { id, description }
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (creating) return
    dispatch(clearActionError())
    setCreating(true)
    const result = await dispatch(createCategory({ id: Number(newId), description: newDescription }))
    setCreating(false)
    if (!result.error) {
      clearCatalogCache()
      setNewId('')
      setNewDescription('')
    }
  }

  const handleSaveEdit = async () => {
    dispatch(clearActionError())
    const result = await dispatch(updateCategory({ id: editing.id, description: editing.description }))
    if (!result.error) {
      clearCatalogCache()
      setEditing(null)
    }
  }

  const handleDelete = async (id) => {
    dispatch(clearActionError())
    const result = await dispatch(deleteCategory(id))
    if (!result.error) {
      clearCatalogCache()
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <Divider className="mb-4" />
        <SectionTitle subtitle="Administración del catálogo">
          Gestión de Categorías
        </SectionTitle>
      </div>

      {/* Alta */}
      <form onSubmit={handleCreate} className="bg-white border border-ash p-6 mb-10 flex flex-col gap-6">
        <p className="text-xs tracking-[0.3em] uppercase text-gold">Nueva categoría</p>
        <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] gap-6">
          <Field label="ID" name="newId" type="number" required value={newId} onChange={(_, v) => setNewId(v)} placeholder="99" />
          <Field label="Descripción" name="newDescription" required value={newDescription} onChange={(_, v) => setNewDescription(v)} placeholder="Ej: Edición Limitada" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" disabled={creating} className={creating ? 'opacity-60 cursor-not-allowed' : ''}>
            {creating ? 'Creando…' : '+ Crear Categoría'}
          </Button>
        </div>
      </form>

      {actionError && (
        <div className="mb-8 bg-red-50 border border-red-200 p-4">
          <p className="text-sm tracking-widest uppercase text-red-600">{actionError}</p>
        </div>
      )}

      {loading ? (
        <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">Cargando categorías…</p>
      ) : error ? (
        <div className="bg-white border border-ash p-8 text-center">
          <p className="text-sm text-red-600 tracking-widest uppercase">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-ash p-12 text-center">
          <p className="text-ink-muted text-sm tracking-widest uppercase">No hay categorías registradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-ash p-5 flex items-center justify-between gap-4 hover:border-gold transition-colors">
              {editing && editing.id === cat.id ? (
                <>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-xs tracking-widest uppercase text-ink-muted">#{cat.id}</span>
                    <input
                      value={editing.description}
                      onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                      className="flex-1 border border-ash px-3 py-2 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveEdit} className="text-xs tracking-widest uppercase text-gold hover:underline">Guardar</button>
                    <button onClick={() => setEditing(null)} className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink-primary">Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-xs tracking-widest uppercase text-ink-muted">#{cat.id}</span>
                    <span className="font-display text-lg text-ink-primary">{cat.description}</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setEditing({ id: cat.id, description: cat.description })} className="text-xs tracking-widest uppercase text-ink-muted hover:text-gold transition-colors">Editar</button>
                    <button onClick={() => setConfirmDelete(cat.id)} className="text-xs tracking-widest uppercase text-ink-muted hover:text-red-600 transition-colors">Eliminar</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDelete != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-red-600 p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-2xl text-red-600 mb-2">Eliminar Categoría</h3>
            <p className="text-sm text-ink-secondary mb-8">Esta acción no se puede deshacer. ¿Continuar?</p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" className="!bg-red-600 !border-red-600 hover:!bg-red-700 hover:!border-red-700" onClick={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
