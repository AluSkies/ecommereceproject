import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Cerrar menú al hacer click fuera (comportamiento convencional)
  useEffect(() => {
    if (!menuOpen) return
    function handleOutsideClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menuOpen])

  const displayName =
    user?.firstName?.trim() ||
    (user?.email ? user.email.split('@')[0] : '')

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header ref={drawerRef} className="fixed top-0 left-0 right-0 z-50 bg-pearl border-b border-ash">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-display font-semibold text-xl tracking-[0.2em] uppercase text-ink-primary hover:text-gold transition-colors duration-300"
        >
          Tempus
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm tracking-widest uppercase transition-colors duration-300 ${
                isActive ? 'text-gold' : 'text-ink-muted hover:text-ink-primary'
              }`
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/catalogo"
            className={({ isActive }) =>
              `text-sm tracking-widest uppercase transition-colors duration-300 ${
                isActive ? 'text-gold' : 'text-ink-muted hover:text-ink-primary'
              }`
            }
          >
            Catálogo
          </NavLink>

          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-ash">
              <span className="text-xs tracking-widest uppercase text-ink-muted">
                Hola, <span className="text-ink-primary">{displayName}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm tracking-widest uppercase text-ink-muted hover:text-gold transition-colors duration-300 cursor-pointer"
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              state={{ from: location }}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors duration-300 pl-4 border-l border-ash ${
                  isActive ? 'text-gold' : 'text-ink-muted hover:text-ink-primary'
                }`
              }
            >
              Ingresar
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-ink-primary"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-pearl border-t border-ash px-4 py-6 flex flex-col gap-6">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `text-sm tracking-widest uppercase ${isActive ? 'text-gold' : 'text-ink-secondary'}`
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/catalogo"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `text-sm tracking-widest uppercase ${isActive ? 'text-gold' : 'text-ink-secondary'}`
            }
          >
            Catálogo
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="text-xs tracking-widest uppercase text-ink-muted">
                Hola, <span className="text-ink-primary">{displayName}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-left text-sm tracking-widest uppercase text-ink-secondary hover:text-gold cursor-pointer"
              >
                Salir
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              state={{ from: location }}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase ${isActive ? 'text-gold' : 'text-ink-secondary'}`
              }
            >
              Ingresar
            </NavLink>
          )}
        </div>
      )}
    </header>
  )
}
