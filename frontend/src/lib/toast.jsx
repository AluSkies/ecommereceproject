import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(undefined)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ message, type = 'success', duration = 3000 }) => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
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
