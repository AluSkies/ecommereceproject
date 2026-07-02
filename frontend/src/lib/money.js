// Helper numérico reutilizable. Vivía en lib/cart.jsx (Context); se movió acá
// al migrar a Redux para que las páginas lo sigan importando sin depender del Context.
export function toNumber(value) {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? Number(value) : value
}
