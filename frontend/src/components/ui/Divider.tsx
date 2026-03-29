interface DividerProps {
  className?: string
}

export function Divider({ className = '' }: DividerProps) {
  return <div className={`mx-auto w-10 h-px bg-gold ${className}`} />
}
