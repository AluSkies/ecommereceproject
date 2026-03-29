import type { WatchSpecs as WatchSpecsType } from '@/data/watches'

interface WatchSpecsProps {
  specs: WatchSpecsType
}

const specLabels: Record<keyof WatchSpecsType, string> = {
  movimiento: 'Movimiento',
  material: 'Material',
  diametro: 'Diámetro',
  resistenciaAgua: 'Resistencia al agua',
  garantia: 'Garantía',
}

export function WatchSpecs({ specs }: WatchSpecsProps) {
  const entries = Object.entries(specLabels) as [keyof WatchSpecsType, string][]

  return (
    <dl className="divide-y divide-ash">
      {entries.map(([key, label], i) => (
        <div
          key={key}
          className={`flex justify-between py-3 text-sm ${i % 2 === 0 ? 'bg-smoke px-3' : 'px-3'}`}
        >
          <dt className="text-xs tracking-widest uppercase text-ink-muted">{label}</dt>
          <dd className="font-medium text-ink-primary text-right">{specs[key]}</dd>
        </div>
      ))}
    </dl>
  )
}
