/**
 * Fuente de verdad única de la política de envío.
 *
 * REDESIGN_V2 (decisión de negocio, ya no TODO_OWNER): Santa Marta es
 * gratis; el envío nacional NO tiene una tarifa fija publicable — se
 * confirma por WhatsApp según el destino, antes de que el cliente pague.
 * El checkout nunca debe inventar ni bloquear con una cifra de envío.
 */

export const SHIPPING = {
  santaMarta: {
    label: "Envío gratis en Santa Marta",
    cost: 0,
  },
  nacional: {
    label: "Envío nacional: se confirma por WhatsApp según tu destino, antes de pagar",
  },
} as const;

function isSantaMarta(city?: string): boolean {
  if (!city) return false;
  return /santa\s*marta/i.test(city.trim());
}

/** Línea de envío honesta para mostrar en el checkout/carrito — nunca un monto inventado. */
export function shippingLineFor(city?: string): string {
  return isSantaMarta(city) ? SHIPPING.santaMarta.label : SHIPPING.nacional.label;
}

export function shippingSummaryText(): string {
  return `${SHIPPING.santaMarta.label} · ${SHIPPING.nacional.label}`;
}
