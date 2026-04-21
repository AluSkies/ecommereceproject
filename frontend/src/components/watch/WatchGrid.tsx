import type { Watch } from '@/data/watches'
import { WatchCard } from './WatchCard'

interface WatchGridProps {
  watches: Watch[]
  onClearFilters?: () => void
}

export function WatchGrid({ watches, onClearFilters }: WatchGridProps) {
  if (watches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-ink-muted text-sm tracking-widest uppercase">Sin resultados</p>
        <div className="w-10 h-px bg-gold" />
        {onClearFilters ? (
          <button
            onClick={onClearFilters}
            className="text-gold text-sm tracking-widest uppercase hover:text-gold-dark transition-colors duration-300"
          >
            Limpiar filtros →
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {watches.map((watch) => (
        <WatchCard key={watch.id} watch={watch} />
      ))}
    </div>
  )
}
