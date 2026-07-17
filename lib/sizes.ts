/**
 * Fuente de verdad única de qué tallas existen por versión — pulido final,
 * bug real confirmado en captura de iPhone: con "Player" seleccionado se
 * podía elegir 4XL, que no existe en esa versión (Jugador llega hasta 3XL).
 * `product.sizes` en la BD es una sola lista por producto, sin distinguir
 * versión — este archivo filtra esa lista según la versión activa, para que
 * ficha, carrito, checkout y el servidor apliquen la misma regla.
 *
 * Ver public/images/guia-tallas-oficial-la12store.png (guía oficial): Fan
 * hasta 4XL, Jugador hasta 3XL, Mujer hasta XL/GG. La categoría "Mujer" no
 * existe todavía como version/tipo en los datos reales del negocio (no hay
 * ningún producto así etiquetado en la BD) — el límite queda definido aquí
 * para aplicarse el día que exista, pero hoy solo Fan/Player son alcanzables.
 */

export const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const;

const MAX_SIZE_BY_VERSION: Record<string, (typeof SIZE_ORDER)[number]> = {
  Fan: "4XL",
  Player: "3XL",
  Mujer: "XL",
};

function sizeIndex(size: string): number {
  return SIZE_ORDER.indexOf(size.toUpperCase() as (typeof SIZE_ORDER)[number]);
}

/**
 * Filtra una lista cruda de tallas a las que existen para una versión dada.
 * Versiones sin límite conocido (ej. "Retro") devuelven la lista sin tocar.
 * Tallas que no reconocemos (fuera de SIZE_ORDER) se conservan tal cual —
 * defensivo, para no ocultar por error una talla real que no esté en la lista.
 */
export function availableSizesFor(sizes: string[], version: string): string[] {
  const max = MAX_SIZE_BY_VERSION[version];
  if (!max) return sizes;
  const maxIdx = sizeIndex(max);
  return sizes.filter((s) => {
    const idx = sizeIndex(s);
    return idx === -1 || idx <= maxIdx;
  });
}

export function isValidSizeForVersion(size: string, version: string): boolean {
  const max = MAX_SIZE_BY_VERSION[version];
  if (!max) return true;
  const idx = sizeIndex(size);
  if (idx === -1) return true;
  return idx <= sizeIndex(max);
}
