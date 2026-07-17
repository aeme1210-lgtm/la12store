/**
 * Fuente de verdad única de la política de envío.
 *
 * REGLA COMERCIAL DEFINITIVA (pulido final, prevalece sobre cualquier
 * política anterior — ver docs/DECISIONS_V2.md y docs/DECISIONS_PULIDO_FINAL.md):
 * TODAS las camisetas compradas desde la web tienen envío GRATIS a toda
 * Colombia, sin excepción de ciudad y sin monto mínimo. No existe distinción
 * Santa Marta/resto del país, ni envío "según destino" a confirmar.
 */

export const SHIPPING = {
  nacional: {
    label: "Envío gratis en todas las camisetas de la web",
    cost: 0,
  },
} as const;

/** Línea de envío para mostrar en el checkout/carrito — siempre gratis. */
export function shippingLineFor(): string {
  return SHIPPING.nacional.label;
}

export function shippingSummaryText(): string {
  return SHIPPING.nacional.label;
}
