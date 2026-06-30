/**
 * @typedef {'PENDING'|'CONFIRMED'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED'|'REFUNDED'} OrderStatus
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} productId
 * @property {string} productName
 * @property {number|string} unitPrice
 * @property {number} quantity
 * @property {number|string} lineTotal
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} orderNumber
 * @property {number} userId
 * @property {OrderStatus} status
 * @property {OrderItem[]} items
 * @property {number|string} subtotal
 * @property {number|string} discountTotal
 * @property {number|string} shippingTotal
 * @property {number|string} taxTotal
 * @property {number|string} grandTotal
 * @property {string} currency
 * @property {string} [shippingSnapshot]
 * @property {string} [placedAt]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

const STATUS_LABELS = {
  PENDING: 'Pendiente de pago',
  CONFIRMED: 'Confirmada',
  PROCESSING: 'En preparación',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

const STATUS_STYLES = {
  PENDING: 'bg-gold-muted text-gold-dark',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-ash text-ink-muted',
}

export function statusClassName(status) {
  return STATUS_STYLES[status] ?? 'bg-ash text-ink-muted'
}
