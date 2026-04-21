import { Divider } from './Divider'

interface SectionTitleProps {
  children: React.ReactNode
  subtitle?: string
  centered?: boolean
  light?: boolean
  withDivider?: boolean
}

export function SectionTitle({
  children,
  subtitle,
  centered = false,
  light = false,
  withDivider = false,
}: SectionTitleProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {withDivider && <Divider className={centered ? 'mb-4' : 'mb-4'} />}
      <h2
        className={`font-display font-medium leading-tight tracking-tight text-3xl md:text-4xl ${
          light ? 'text-ink-inverse' : 'text-ink-primary'
        }`}
      >
        {children}
      </h2>
      {subtitle && (
        <p className={`mt-2 text-sm tracking-wide ${light ? 'text-ink-inverse/70' : 'text-ink-muted'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
