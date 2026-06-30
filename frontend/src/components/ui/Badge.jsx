const codeClasses = {
  LUXURY: 'bg-gold-muted text-gold border border-gold',
  SPORT: 'bg-smoke text-ink-secondary border border-ash',
  VINTAGE: 'bg-obsidian text-ink-inverse',
  DRESS: 'bg-smoke text-ink-primary border border-ash',
}

export function Badge({ code, label, className = '' }) {
  const classes =
    codeClasses[code] ?? 'bg-smoke text-ink-secondary border border-ash'
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-medium tracking-widest uppercase rounded-sm ${classes} ${className}`}
    >
      {label}
    </span>
  )
}
