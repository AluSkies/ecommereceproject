import type { Category } from '@/data/watches'

const categoryClasses: Record<string, string> = {
  'de Lujo': 'bg-gold-muted text-gold border border-gold',
  Deportivos: 'bg-smoke text-ink-secondary border border-ash',
  Inteligentes: 'bg-obsidian text-ink-inverse',
}

interface BadgeProps {
  category: Category
  className?: string
}

export function Badge({ category, className = '' }: BadgeProps) {
  const classes = categoryClasses[category] ?? 'bg-smoke text-ink-secondary border border-ash'
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-medium tracking-widest uppercase rounded-sm ${classes} ${className}`}
    >
      {category}
    </span>
  )
}
