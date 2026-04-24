import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

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

  const CartBadge = (
    <Link
      to="/carrito"
      aria-label={`Carrito (${itemCount} artículos)`}
      className="relative inline-flex items-center justify-center p-2 text-ink-muted hover:text-gold transition-colors duration-300"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 bg-gold text-obsidian text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}
    </Link>
  )

  return (
    <header ref={drawerRef} className="fixed top-0 left-0 right-0 z-50 bg-pearl border-b border-ash">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-semibold text-xl tracking-[0.2em] uppercase text-ink-primary hover:text-gold transition-colors duration-300"
        >
          Tempus
        </Link>

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
            <NavLink
              to="/mis-ordenes"
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors duration-300 ${
                  isActive ? 'text-gold' : 'text-ink-muted hover:text-ink-primary'
                }`
              }
            >
              Mis órdenes
            </NavLink>
          ) : null}

          <div className="flex items-center gap-3 pl-4 border-l border-ash">
            {CartBadge}
            {isAuthenticated ? (
              <>
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
              </>
            ) : (
              <NavLink
                to="/login"
                state={{ from: location }}
                className={({ isActive }) =>
                  `text-sm tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'text-gold' : 'text-ink-muted hover:text-ink-primary'
                  }`
                }
              >
                Ingresar
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {CartBadge}
          <button
            className="p-2 text-ink-primary"
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
        </div>
      </nav>

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
          <NavLink
            to="/carrito"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `text-sm tracking-widest uppercase ${isActive ? 'text-gold' : 'text-ink-secondary'}`
            }
          >
            Carrito {itemCount > 0 ? `(${itemCount})` : ''}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/mis-ordenes"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm tracking-widest uppercase ${isActive ? 'text-gold' : 'text-ink-secondary'}`
                }
              >
                Mis órdenes
              </NavLink>
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
