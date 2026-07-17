/**
 * Estados honestos del pedido (REDESIGN_V2 Fase 5).
 *
 * Este negocio no tiene pasarela de pago automática: todo pago se verifica a
 * mano contra la app bancaria real antes de despachar. Por eso NUNCA existe
 * un estado "pagado" ni "confirmado" automático — el pedido queda
 * "pendiente de verificación" hasta que alguien del equipo lo revisa y lo
 * marca manualmente. Ver ADMIN_GUIDE.md para el protocolo anti-fraude.
 */

export const ORDER_STATUS = {
  DRAFT: "DRAFT",
  READY_FOR_PAYMENT: "READY_FOR_PAYMENT",
  PAYMENT_INSTRUCTIONS_VIEWED: "PAYMENT_INSTRUCTIONS_VIEWED",
  RECEIPT_SELECTED: "RECEIPT_SELECTED",
  RECEIPT_SHARE_STARTED: "RECEIPT_SHARE_STARTED",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  CONFIRMED_MANUALLY: "CONFIRMED_MANUALLY",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/**
 * Estados que el propio cliente puede reportar desde el checkout (endpoint
 * público). CONFIRMED_MANUALLY y DRAFT quedan fuera a propósito: el primero
 * solo lo puede poner un admin tras verificar el pago real, el segundo nunca
 * llega a existir como fila en la base de datos (es puramente local, antes
 * de crear el pedido).
 */
export const CLIENT_UPDATABLE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.PAYMENT_INSTRUCTIONS_VIEWED,
  ORDER_STATUS.RECEIPT_SELECTED,
  ORDER_STATUS.RECEIPT_SHARE_STARTED,
  ORDER_STATUS.PENDING_VERIFICATION,
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  READY_FOR_PAYMENT: "Listo para pagar",
  PAYMENT_INSTRUCTIONS_VIEWED: "Vio instrucciones de pago",
  RECEIPT_SELECTED: "Comprobante seleccionado",
  RECEIPT_SHARE_STARTED: "Compartiendo comprobante",
  PENDING_VERIFICATION: "Pendiente de verificación",
  CONFIRMED_MANUALLY: "Confirmado manualmente",
  // Vocabulario legacy de pedidos creados antes de esta fase — se conserva
  // para no romper la vista de admin sobre datos históricos reales.
  pending: "Pendiente (legacy)",
  confirmed: "Confirmado (legacy)",
  shipped: "Enviado (legacy)",
  delivered: "Entregado (legacy)",
  cancelled: "Cancelado (legacy)",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-400",
  READY_FOR_PAYMENT: "bg-blue-500/10 text-blue-400",
  PAYMENT_INSTRUCTIONS_VIEWED: "bg-blue-500/10 text-blue-400",
  RECEIPT_SELECTED: "bg-amber-500/10 text-amber-400",
  RECEIPT_SHARE_STARTED: "bg-amber-500/10 text-amber-400",
  PENDING_VERIFICATION: "bg-yellow-500/10 text-yellow-500",
  CONFIRMED_MANUALLY: "bg-green-500/10 text-green-400",
  pending: "bg-yellow-500/10 text-yellow-500",
  confirmed: "bg-blue-500/10 text-blue-400",
  shipped: "bg-purple-500/10 text-purple-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] ?? "bg-gray-500/10 text-gray-400";
}
