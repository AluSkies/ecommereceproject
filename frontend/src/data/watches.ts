export const CATEGORIES = {
  LUJO: 'de Lujo',
  DEPORTIVOS: 'Deportivos',
  INTELIGENTES: 'Inteligentes',
} as const

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES]

export interface WatchSpecs {
  movimiento: string
  material: string
  diametro: string
  resistenciaAgua: string
  garantia: string
}

export interface Watch {
  id: number
  name: string
  brand: string
  price: number
  category: Category
  image: string
  description: string
  featured: boolean
  specs: WatchSpecs
}

export const watches: Watch[] = [
  // ── de Lujo ────────────────────────────────────────────────
  {
    id: 1,
    name: 'Submariner Date',
    brand: 'Rolex',
    price: 12500000,
    category: CATEGORIES.LUJO,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
    description:
      'El ícono absoluto de la relojería deportiva de lujo. Resistente al agua hasta 300 metros con su bisel Cerachrom patentado.',
    featured: true,
    specs: {
      movimiento: 'Automático Calibre 3235',
      material: 'Acero Oyster 904L',
      diametro: '41 mm',
      resistenciaAgua: '300 m',
      garantia: '5 años',
    },
  },
  {
    id: 2,
    name: 'Seamaster 300M',
    brand: 'Omega',
    price: 7800000,
    category: CATEGORIES.LUJO,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
    description:
      'Reloj oficial de la marina británica. Co-Axial Master Chronometer certificado con resistencia magnética superior.',
    featured: true,
    specs: {
      movimiento: 'Automático Co-Axial Cal. 8800',
      material: 'Acero inoxidable',
      diametro: '42 mm',
      resistenciaAgua: '300 m',
      garantia: '5 años',
    },
  },
  {
    id: 3,
    name: 'Carrera Heuer-02',
    brand: 'TAG Heuer',
    price: 5200000,
    category: CATEGORIES.LUJO,
    image: 'https://images.unsplash.com/photo-1594576722512-58214d7bb1d2?w=600&q=80',
    description:
      'Cronógrafo de manufactura con 80 horas de reserva de marcha. Herencia directa del automovilismo de los años 60.',
    featured: false,
    specs: {
      movimiento: 'Automático HEUER-02',
      material: 'Titanio Grade 2',
      diametro: '44 mm',
      resistenciaAgua: '100 m',
      garantia: '2 años',
    },
  },
  {
    id: 4,
    name: 'Constellation Co-Axial',
    brand: 'Omega',
    price: 6100000,
    category: CATEGORIES.LUJO,
    image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80',
    description:
      'Elegancia atemporal con estrella en el bisel. Disponible en acero y oro sedna con esfera de nácar.',
    featured: false,
    specs: {
      movimiento: 'Automático Co-Axial Cal. 8700',
      material: 'Acero y Oro Sedna',
      diametro: '39 mm',
      resistenciaAgua: '100 m',
      garantia: '5 años',
    },
  },
  // ── Deportivos ─────────────────────────────────────────────
  {
    id: 5,
    name: 'Prospex Speedtimer',
    brand: 'Seiko',
    price: 1200000,
    category: CATEGORIES.DEPORTIVOS,
    image: 'https://images.unsplash.com/photo-1548171916-c8fd5d9f3f9c?w=600&q=80',
    description:
      'Cronógrafo solar de alto rendimiento. Cero batería — cero preocupaciones. Bisel de aluminio anodizado.',
    featured: true,
    specs: {
      movimiento: 'Solar V192',
      material: 'Acero inoxidable',
      diametro: '44.5 mm',
      resistenciaAgua: '200 m',
      garantia: '2 años',
    },
  },
  {
    id: 6,
    name: 'Aqua Terra 150M',
    brand: 'Omega',
    price: 4500000,
    category: CATEGORIES.DEPORTIVOS,
    image: 'https://images.unsplash.com/photo-1619134778706-7015533a6150?w=600&q=80',
    description:
      'El perfecto puente entre elegancia y rendimiento deportivo. Sumergible hasta 150m con movimiento anti-magnético.',
    featured: false,
    specs: {
      movimiento: 'Automático Co-Axial Cal. 8900',
      material: 'Acero inoxidable',
      diametro: '41 mm',
      resistenciaAgua: '150 m',
      garantia: '5 años',
    },
  },
  {
    id: 7,
    name: 'Formula 1 Calibre 16',
    brand: 'TAG Heuer',
    price: 2100000,
    category: CATEGORIES.DEPORTIVOS,
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80',
    description:
      'Cronógrafo automático inspirado en la Fórmula 1. Bisel de cerámica negra con marcadores de taquímetro.',
    featured: false,
    specs: {
      movimiento: 'Automático Calibre 16',
      material: 'Acero con bisel cerámico',
      diametro: '43 mm',
      resistenciaAgua: '200 m',
      garantia: '2 años',
    },
  },
  {
    id: 8,
    name: '5 Sports GMT',
    brand: 'Seiko',
    price: 890000,
    category: CATEGORIES.DEPORTIVOS,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80',
    description:
      'Viajero incansable. Función GMT con aguja adicional para seguir dos zonas horarias simultáneamente.',
    featured: true,
    specs: {
      movimiento: 'Automático 4R34',
      material: 'Acero inoxidable',
      diametro: '42.5 mm',
      resistenciaAgua: '100 m',
      garantia: '2 años',
    },
  },
  // ── Inteligentes ───────────────────────────────────────────
  {
    id: 9,
    name: 'Forerunner 965',
    brand: 'Garmin',
    price: 1850000,
    category: CATEGORIES.INTELIGENTES,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80',
    description:
      'GPS de entrenamiento de nivel élite. Pantalla AMOLED de 1.4" con mapas topográficos y monitoreo de salud 24/7.',
    featured: true,
    specs: {
      movimiento: 'Digital',
      material: 'Cristal de zafiro',
      diametro: '47 mm',
      resistenciaAgua: '100 m (5 ATM)',
      garantia: '1 año',
    },
  },
  {
    id: 10,
    name: 'Apple Watch Ultra 2',
    brand: 'Apple',
    price: 2300000,
    category: CATEGORIES.INTELIGENTES,
    image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80',
    description:
      'El reloj más robusto de Apple. Titanio aeroespacial, pantalla Wayfinder y sirena de emergencia de 86 dB.',
    featured: true,
    specs: {
      movimiento: 'Digital S9 SiP',
      material: 'Titanio aeroespacial',
      diametro: '49 mm',
      resistenciaAgua: '100 m (EN13319)',
      garantia: '1 año',
    },
  },
  {
    id: 11,
    name: 'Fenix 7X Pro Solar',
    brand: 'Garmin',
    price: 2750000,
    category: CATEGORIES.INTELIGENTES,
    image: 'https://images.unsplash.com/photo-1617625802912-cde586faf749?w=600&q=80',
    description:
      'El compañero definitivo para aventuras extremas. Carga solar, mapas TopoActive y modo expedición de 37 días.',
    featured: false,
    specs: {
      movimiento: 'Digital con carga solar',
      material: 'Titanio con Power Glass',
      diametro: '51 mm',
      resistenciaAgua: '100 m (10 ATM)',
      garantia: '1 año',
    },
  },
  {
    id: 12,
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    price: 1150000,
    category: CATEGORIES.INTELIGENTES,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80',
    description:
      'Chip S9 con doble toque. ECG, detección de caídas y accidentes de tráfico. 18 horas de autonomía.',
    featured: false,
    specs: {
      movimiento: 'Digital S9 SiP',
      material: 'Aluminio / acero inoxidable',
      diametro: '45 mm',
      resistenciaAgua: '50 m (WR50)',
      garantia: '1 año',
    },
  },
]

export const getFeatured = (): Watch[] => watches.filter((w) => w.featured)
export const getByCategory = (cat: Category): Watch[] =>
  watches.filter((w) => w.category === cat)
export const getById = (id: number): Watch | undefined =>
  watches.find((w) => w.id === id)
