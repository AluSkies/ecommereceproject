import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addToast, removeToast } from '@/redux/uiSlice'

const ToastContext = createContext(undefined)

export function ToastProvider({ children }) {
  const dispatch = useDispatch()
  const toasts = useSelector((state) => state.ui.toasts)

  const dismiss = useCallback((id) => {
    dispatch(removeToast(id))
  }, [dispatch])

  const toast = useCallback(
    ({ message, type = 'success', duration = 3000 }) => {
      dispatch(addToast({ message, type, duration }))
    },
    [dispatch]
  )

  const contextValue = useMemo(() => toast, [toast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  const isError = toast.type === 'error'

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

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
        onClick={() => onDismiss(toast.id)}
        className="ml-auto text-ink-muted hover:text-pearl transition-colors cursor-pointer text-lg leading-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}
