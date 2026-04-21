import { Link } from 'react-router-dom'
import { getFeatured, CATEGORIES } from '@/data/watches'
import { WatchGrid } from '@/components/watch/WatchGrid'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

const featured = getFeatured()

const categoryPreviews = [
  {
    label: CATEGORIES.LUJO,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    description: 'Alta relojería. Cada pieza, una obra maestra.',
  },
  {
    label: CATEGORIES.DEPORTIVOS,
    image: 'https://images.unsplash.com/photo-1548171916-c8fd5d9f3f9c?w=800&q=80',
    description: 'Construidos para el rendimiento extremo.',
  },
  {
    label: CATEGORIES.INTELIGENTES,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80',
    description: 'Tecnología en tu muñeca. Sin compromisos.',
  },
]

export function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] bg-obsidian flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=80')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-4">
              Nueva Colección
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-ink-inverse leading-[1.05] tracking-tight">
              El tiempo,<br />
              redefinido.
            </h1>
            <p className="mt-6 text-ink-inverse/60 text-lg leading-relaxed max-w-sm">
              Relojes de lujo, deportivos e inteligentes. Elegí el tuyo.
            </p>
            <div className="mt-10">
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
        <WatchGrid watches={featured} />
      </section>

      {/* ── Category previews ────────────────────────────── */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryPreviews.map(({ label, image, description }) => (
              <Link
                key={label}
                to={`/catalogo?categoria=${encodeURIComponent(label)}`}
                className="group relative overflow-hidden aspect-[4/5] bg-obsidian"
              >
                <img
                  src={image}
                  alt={label}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
                    {label}
                  </p>
                  <p className="font-display text-xl text-ink-inverse leading-snug">
                    {description}
                  </p>
                  <p className="mt-3 text-xs tracking-widest uppercase text-gold group-hover:translate-x-1 transition-transform duration-300">
                    Explorar →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse all CTA ────────────────────────────────── */}
      <section className="bg-obsidian py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <Divider className="mb-6 mx-auto" />
          <SectionTitle light centered subtitle="12 modelos disponibles">
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
