import React from 'react'

const variantClasses = {
  primary:
    'bg-gold text-obsidian font-semibold shadow-sm hover:bg-gold-light hover:shadow-lg hover:-translate-y-0.5 active:bg-gold-dark active:translate-y-0',
  secondary:
    'bg-obsidian text-ink-inverse shadow-sm hover:bg-ink-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'border border-gold text-gold hover:bg-gold hover:text-obsidian hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
}

const sizeClasses = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-7 py-3 text-sm',
  lg: 'px-9 py-4 text-base',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full tracking-wider uppercase transition-all duration-300 ease-luxury cursor-pointer ' +
  'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 disabled:active:scale-100'

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
    </svg>
  )
}

export function Button({
  as,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const Tag = as ?? 'button'
  const isDisabled = disabled || loading
  // Anchors/Links don't support `disabled`; emulate it via aria + classes.
  const disabledProps =
    Tag === 'button' ? { disabled: isDisabled } : { 'aria-disabled': isDisabled || undefined }

  return (
    <Tag
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...disabledProps}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </Tag>
  )
}
