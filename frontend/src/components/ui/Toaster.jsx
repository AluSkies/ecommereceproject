import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectToasts, removeToast } from '@/redux/uiSlice'

// Reemplaza al ToastContainer que vivía en lib/toast.jsx (Context).
// Lee los toasts del store (uiSlice) y maneja el auto-cierre por toast.
export function Toaster() {
  const toasts = useSelector(selectToasts)
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  )
}

function Toast({ toast }) {
  const dispatch = useDispatch()
  const isError = toast.type === 'error'

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id, toast.duration])

  return (
    <div
      role="status"
      className={`
        pointer-events-auto flex items-center gap-3 px-5 py-3 shadow-card
        text-sm tracking-wide animate-slide-up
        ${isError ? 'bg-obsidian text-red-400 border border-red-400/30' : 'bg-obsidian text-gold border border-gold/30'}
      `}
    >
      <span className="text-base">{isError ? '✕' : '✓'}</span>
      <span className="text-pearl">{toast.message}</span>
      <button
        type="button"
        onClick={() => dispatch(removeToast(toast.id))}
        className="ml-auto text-ink-muted hover:text-pearl transition-colors cursor-pointer text-lg leading-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}
