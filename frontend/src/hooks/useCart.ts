import { useSyncExternalStore } from 'react'
import { getById, type Watch } from '@/data/watches'

const STORAGE_KEY = 'tempus_cart'

/** Lo único que se persiste: id del reloj + cantidad. */
interface StoredLine {
  id: number
  quantity: number
}

/** Línea resuelta con los datos del reloj para la UI. */
export interface CartLine {
  watch: Watch
  quantity: number
  lineTotal: number
}

function read(): StoredLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (l): l is StoredLine =>
          typeof l?.id === 'number' && typeof l?.quantity === 'number',
      )
      .map((l) => ({ id: l.id, quantity: Math.max(1, Math.floor(l.quantity)) }))
  } catch {
    return []
  }
}

// Snapshot cacheado: useSyncExternalStore exige que getSnapshot devuelva la misma
// referencia mientras el estado no cambie.
let snapshot: StoredLine[] = read()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function write(lines: StoredLine[]) {
  snapshot = lines
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // localStorage lleno o no disponible: seguimos con el estado en memoria.
  }
  emit()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Sincroniza cambios hechos en otra pestaña.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      snapshot = read()
      emit()
    }
  })
}

function mutate(fn: (lines: StoredLine[]) => StoredLine[]) {
  write(fn(snapshot))
}

/**
 * Siembra un par de items de demostración si el carrito está vacío, para que la
 * pantalla sea revisable sin un botón "Agregar al carrito" todavía.
 * TODO: eliminar cuando exista el botón "Agregar al carrito" en producto/catálogo.
 */
export function seedCartIfEmpty() {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    write([
      { id: 1, quantity: 1 },
      { id: 3, quantity: 2 },
    ])
  }
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, () => snapshot, () => snapshot)

  const items: CartLine[] = lines
    .map((l) => {
      const watch = getById(l.id)
      if (!watch) return null
      return { watch, quantity: l.quantity, lineTotal: watch.price * l.quantity }
    })
    .filter((x): x is CartLine => x !== null)

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return {
    items,
    subtotal,
    count,
    addItem(id: number, qty = 1) {
      mutate((prev) => {
        const existing = prev.find((l) => l.id === id)
        if (existing) {
          return prev.map((l) =>
            l.id === id ? { ...l, quantity: l.quantity + qty } : l,
          )
        }
        return [...prev, { id, quantity: Math.max(1, qty) }]
      })
    },
    setQuantity(id: number, qty: number) {
      // qty <= 0 elimina la línea (mismo contrato que el backend).
      if (qty <= 0) {
        mutate((prev) => prev.filter((l) => l.id !== id))
        return
      }
      mutate((prev) =>
        prev.map((l) => (l.id === id ? { ...l, quantity: qty } : l)),
      )
    },
    removeItem(id: number) {
      mutate((prev) => prev.filter((l) => l.id !== id))
    },
    clear() {
      write([])
    },
  }
}
