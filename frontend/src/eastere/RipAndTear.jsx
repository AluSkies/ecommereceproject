import { useEffect, useRef } from 'react'

function loadJsDos() {
  if (window.Dos) return Promise.resolve()
  // Inject CSS
  if (!document.getElementById('js-dos-css')) {
    const link = document.createElement('link')
    link.id = 'js-dos-css'
    link.rel = 'stylesheet'
    link.href = '/js-dos/js-dos.css'
    document.head.appendChild(link)
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/js-dos/js-dos.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export function RipAndTear() {
  const containerRef = useRef(null)
  const dosRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      await loadJsDos()
      if (cancelled || !containerRef.current) return
      dosRef.current = window.Dos(containerRef.current, {
        url: '/doom.jsdos',
        theme: 'dark',
        pathPrefix: '/js-dos/',
      })
    }

    boot().catch(console.error)

    return () => {
      cancelled = true
      dosRef.current?.stop?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-obsidian z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gold/20">
        <span className="font-display text-gold tracking-[0.3em] uppercase text-sm select-none">
          ☠ RIP AND TEAR
        </span>
        <span className="text-ink-muted text-xs tracking-widest uppercase select-none">
          IDDQD — DOOM SLAYER CLEARANCE
        </span>
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  )
}
