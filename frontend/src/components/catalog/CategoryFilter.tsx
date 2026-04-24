import type { Category } from '@/data/watches'

interface CategoryFilterProps {
  categories: Category[]
  selectedCode: string | null
  onChange: (code: string | null) => void
}

export function CategoryFilter({
  categories,
  selectedCode,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors duration-300 ${
          selectedCode === null
            ? 'bg-gold text-obsidian'
            : 'border border-ash text-ink-muted hover:border-gold hover:text-gold'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.code}
          onClick={() => onChange(cat.code)}
          className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors duration-300 ${
            selectedCode === cat.code
              ? 'bg-gold text-obsidian'
              : 'border border-ash text-ink-muted hover:border-gold hover:text-gold'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
