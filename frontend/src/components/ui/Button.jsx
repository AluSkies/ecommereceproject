const variantClasses = {
  primary:
    'bg-gold text-obsidian font-semibold hover:bg-gold-light active:bg-gold-dark',
  secondary:
    'bg-obsidian text-ink-inverse hover:bg-ink-primary/80',
  ghost:
    'border border-gold text-gold hover:bg-gold-muted',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const base =
  'inline-flex items-center justify-center tracking-wider uppercase transition-all duration-300 ease-luxury cursor-pointer'

export function Button({
  as,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const Tag = as ?? 'button'
  return (
    <Tag
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
