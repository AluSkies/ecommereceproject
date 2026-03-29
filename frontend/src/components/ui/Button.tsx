import { type ComponentPropsWithoutRef, type ElementType } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gold text-obsidian font-semibold hover:bg-gold-light active:bg-gold-dark',
  secondary:
    'bg-obsidian text-ink-inverse hover:bg-ink-primary/80',
  ghost:
    'border border-gold text-gold hover:bg-gold-muted',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const base =
  'inline-flex items-center justify-center tracking-wider uppercase transition-all duration-300 ease-luxury cursor-pointer'

type ButtonProps<T extends ElementType = 'button'> = {
  as?: T
  variant?: Variant
  size?: Size
} & ComponentPropsWithoutRef<T>

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps<T>) {
  const Tag = (as ?? 'button') as ElementType
  return (
    <Tag
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
