import { CATEGORIES, type Category } from '@/data/watches'

interface CategoryFilterProps {
  selected: Category | null
  onChange: (category: Category | null) => void
}

const allCategories = Object.values(CATEGORIES) as Category[]

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors duration-300 ${
          selected === null
            ? 'bg-gold text-obsidian'
            : 'border border-ash text-ink-muted hover:border-gold hover:text-gold'
        }`}
      >
        Todos
      </button>
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 text-xs tracking-widest uppercase transition-colors duration-300 ${
            selected === cat
              ? 'bg-gold text-obsidian'
              : 'border border-ash text-ink-muted hover:border-gold hover:text-gold'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
