import { Link } from 'react-router-dom'
import type { Watch } from '@/data/watches'
import { Badge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'

interface WatchCardProps {
  watch: Watch
}

export function WatchCard({ watch }: WatchCardProps) {
  return (
    <Link
      to={`/producto/${watch.id}`}
      className="group flex flex-col bg-surface-card shadow-card hover:shadow-card-hover transition-all duration-300 ease-luxury"
    >
      {/* Image */}
      <div className="aspect-watch overflow-hidden bg-smoke">
        <img
          src={watch.image}
          alt={`${watch.brand} ${watch.name}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-luxury group-hover:scale-105"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Badge code={watch.categoryCode} label={watch.categoryName} />
        {watch.brand ? (
          <p className="text-xs tracking-widest uppercase text-ink-muted mt-1">
            {watch.brand}
          </p>
        ) : null}
        <p className="font-display text-base text-ink-primary leading-snug">
          {watch.name}
        </p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <PriceTag amount={watch.price} />
          <span className="text-gold text-xs tracking-widest uppercase transition-transform duration-300 group-hover:translate-x-1">
            Ver detalle →
          </span>
        </div>
      </div>
    </Link>
  )
}
