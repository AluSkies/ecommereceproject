import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-obsidian text-ink-inverse border-t border-gold/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl tracking-[0.2em] uppercase text-gold">
              Tempus
            </p>
            <p className="mt-2 text-sm text-ink-inverse/50 max-w-xs">
              Relojes de lujo, deportivos e inteligentes. Calidad y elegancia en cada pieza.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm text-ink-inverse/60">
            <div className="flex flex-col gap-3">
              <span className="text-xs tracking-widest uppercase text-gold/70">Tienda</span>
              <Link to="/" className="hover:text-gold transition-colors duration-300">Inicio</Link>
              <Link to="/catalogo" className="hover:text-gold transition-colors duration-300">Catálogo</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs tracking-widest uppercase text-gold/70">Contacto</span>
              <a href="mailto:info@tempus.com" className="hover:text-gold transition-colors duration-300">
                info@tempus.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gold/10 text-xs text-ink-inverse/30 text-center tracking-wider">
          © {new Date().getFullYear()} Tempus. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
