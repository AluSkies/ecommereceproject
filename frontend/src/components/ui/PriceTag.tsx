interface PriceTagProps {
  amount: number
  className?: string
}

export function PriceTag({ amount, className = '' }: PriceTagProps) {
  const formatted = amount.toLocaleString('es-AR')
  return (
    <span className={`font-semibold text-lg text-ink-primary ${className}`}>
      ${formatted}
    </span>
  )
}
