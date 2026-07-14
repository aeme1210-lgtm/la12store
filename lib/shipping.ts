/**
 * Fuente de verdad única de las cifras de envío.
 *
 * FASE 1 encontró cifras contradictorias en el código real (no solo en docs de
 * negocio): Footer.tsx / ProductDetail.tsx / faq/page.tsx decían envío nacional
 * $25.000-$30.000 + internacional y Santa Marta gratis, mientras que las páginas
 * promo (campeones-barca, super-clasico) decían "envío gratis a toda Colombia".
 *
 * TODO_OWNER: confirmar cuál de las dos versiones es la real antes de publicar.
 * Mientras tanto se usa la versión más citada en el código (nacional con costo,
 * Santa Marta e internacional gratis) y las páginas promo dejan de contradecirla.
 */

export const SHIPPING = {
  santaMarta: {
    label: "Envío gratis en Santa Marta",
    cost: 0,
  },
  nacional: {
    label: "Envío nacional",
    // TODO_OWNER: confirmar cifra exacta (se vio $25.000 y $30.000 en distintos
    // lugares del código, y "gratis" en las páginas promo — son incompatibles).
    costMin: 25000,
    costMax: 30000,
  },
  internacional: {
    label: "Envío internacional",
    cost: 0,
    // TODO_OWNER: confirmar que envío internacional es realmente gratis siempre,
    // o si depende del país/peso.
  },
} as const;

export function shippingSummaryText(): string {
  return `${SHIPPING.santaMarta.label} · ${SHIPPING.nacional.label} desde $${SHIPPING.nacional.costMin.toLocaleString("es-CO")} · ${SHIPPING.internacional.label}`;
}
