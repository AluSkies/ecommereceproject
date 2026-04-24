export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderItem {
  productId: number
  productName: string
  unitPrice: number | string
  quantity: number
  lineTotal: number | string
}

export interface Order {
  id: number
  orderNumber: string
  userId: number
  status: OrderStatus
  items: OrderItem[]
  subtotal: number | string
  discountTotal: number | string
  shippingTotal: number | string
  taxTotal: number | string
  grandTotal: number | string
  currency: string
  shippingSnapshot?: string
  placedAt?: string
  createdAt?: string
  updatedAt?: string
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente de pago',
  CONFIRMED: 'Confirmada',
  PROCESSING: 'En preparación',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

export function statusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-gold-muted text-gold-dark',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-ash text-ink-muted',
}

export function statusClassName(status: OrderStatus): string {
  return STATUS_STYLES[status] ?? 'bg-ash text-ink-muted'
}
