import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'
import { SmartImage } from '@/components/ui/SmartImage'

export function WatchCard({ watch }) {
  const isOutOfStock = watch.stock <= 0

  return (
    <Link
      to={`/producto/${watch.id}`}
      className="group flex flex-col bg-surface-card border border-transparent shadow-card hover:shadow-card-hover hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 ease-luxury relative"
    >
      {/* Image */}
      <div className="aspect-watch overflow-hidden bg-smoke relative">
        <SmartImage
          src={watch.image}
          alt={`${watch.brand} ${watch.name}`}
          className={`w-full h-full object-cover transition-transform duration-500 ease-luxury group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-obsidian/80 text-gold text-xs tracking-widest uppercase px-4 py-2 backdrop-blur-sm">
              Sin Stock
            </span>
          </div>
        )}
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
