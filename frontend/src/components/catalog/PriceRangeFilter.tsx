interface PriceRange {
  min: string
  max: string
}

interface PriceRangeFilterProps {
  value: PriceRange
  onChange: (range: PriceRange) => void
}

export function PriceRangeFilter({ value, onChange }: PriceRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-widest uppercase text-ink-muted">Precio (ARS)</span>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="price-min" className="text-xs text-ink-muted">
            Desde
          </label>
          <input
            id="price-min"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
            className="w-32 border border-ash px-3 py-1.5 text-sm text-ink-primary bg-pearl outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1 rounded-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="price-max" className="text-xs text-ink-muted">
            Hasta
          </label>
          <input
            id="price-max"
            type="number"
            min="0"
            step="1"
            placeholder="Sin límite"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
            className="w-32 border border-ash px-3 py-1.5 text-sm text-ink-primary bg-pearl outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1 rounded-none"
          />
        </div>
      </div>
    </div>
  )
}
