import { Link } from 'react-router-dom'
import { useCategories, useFeaturedWatches, WatchGrid } from '@/features/catalog'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { SmartImage } from '@/components/ui/SmartImage'
import { categoryImageByCode, FALLBACK_CATEGORY_IMAGE } from '@/lib/categoryImages'

export function Home() {
  const { data: featured, loading, error } = useFeaturedWatches(4)
  const { data: categories } = useCategories()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] bg-obsidian flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-4 animate-fade-in-up">
              Nueva Colección
            </p>
            <h1
              className="font-display text-5xl md:text-7xl font-medium text-ink-inverse leading-[1.05] tracking-tight animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              El tiempo,<br />
              redefinido.
            </h1>
            <p
              className="mt-6 text-ink-inverse/60 text-lg leading-relaxed max-w-sm animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              La colección completa, elegí el tuyo.
            </p>
            <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button as={Link} to="/catalogo" variant="primary" size="lg">
                Explorar Colección
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <Divider className="mb-4" />
            <SectionTitle subtitle="Los favoritos de nuestra colección">
              Destacados
            </SectionTitle>
          </div>
          <Link
            to="/catalogo"
            className="text-xs tracking-widest uppercase text-gold hover:text-gold-dark transition-colors duration-300 self-end"
          >
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <p className="text-ink-muted text-sm tracking-widest uppercase text-center py-12">
            Cargando destacados…
          </p>
        ) : error ? (
          <p className="text-sm tracking-widest uppercase text-center py-12 text-red-600">
            No se pudo cargar el catálogo
          </p>
        ) : (
          <WatchGrid watches={featured} />
        )}
      </section>

      {/* ── Category previews ────────────────────────────── */}
      {categories.length > 0 ? (
        <section className="bg-smoke py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Divider className="mb-4 mx-auto" />
              <SectionTitle
                centered
                subtitle="Encontrá el reloj que se adapta a tu estilo"
              >
                Explorá por Categoría
              </SectionTitle>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.code}
                  to={`/catalogo?categoria=${encodeURIComponent(cat.code)}`}
                  className="group relative overflow-hidden aspect-[4/5] bg-obsidian"
                >
                  <SmartImage
                    src={categoryImageByCode[cat.code] ?? FALLBACK_CATEGORY_IMAGE}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
                      {cat.name}
                    </p>
                    {cat.description ? (
                      <p className="font-display text-lg text-ink-inverse leading-snug">
                        {cat.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs tracking-widest uppercase text-gold group-hover:translate-x-1 transition-transform duration-300">
                      Explorar →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Browse all CTA ────────────────────────────────── */}
      <section className="bg-obsidian py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <Divider className="mb-6 mx-auto" />
          <SectionTitle light centered subtitle="Colección completa">
            Toda la Colección
          </SectionTitle>
          <div className="mt-8">
            <Button as={Link} to="/catalogo" variant="ghost" size="lg">
              Ver Catálogo Completo
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
