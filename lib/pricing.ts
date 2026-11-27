/**
 * Única fuente de verdad para el cálculo de precio de un producto.
 * Reemplaza la lógica que antes estaba duplicada en ProductCard.tsx,
 * ProductDetail.tsx y lib/utils.ts (getProductPrice, ahora eliminada de ahí).
 */

export type ProductVersion = "Fan" | "Player" | "Retro" | "Manga Larga";

import { isPlayerOnly } from "@/lib/product-rules";

export interface PricedProduct {
  /** Si se pasa, se detectan productos que solo existen en versión Jugador. */
  name?: string;
  type?: string | null;
  priceFan?: number | null;
  pricePlayer?: number | null;
  priceRetro?: number | null;
  priceLongSleeve?: number | null;
  isRetro: boolean;
  isLongSleeve?: boolean;
}

const DEFAULT_FAN = 150000;
const DEFAULT_PLAYER = 180000;
const DEFAULT_RETRO = 170000;
const DEFAULT_LONG_SLEEVE = 185000;

/**
 * Resuelve el precio real de un producto según su versión.
 * Prioridad: manga larga (si el producto es manga larga) > retro > player > fan.
 */
export function getProductPrice(
  product: PricedProduct,
  version?: string
): number {
  if (product.isLongSleeve) {
    return product.priceLongSleeve ?? DEFAULT_LONG_SLEEVE;
  }
  if (product.isRetro) {
    return product.priceRetro ?? DEFAULT_RETRO;
  }
  if (version === "Player" || isPlayerOnlyProduct(product)) {
    return product.pricePlayer ?? DEFAULT_PLAYER;
  }
  return product.priceFan ?? DEFAULT_FAN;
}

/** Producto que solo se vende en versión Jugador (ver lib/product-rules.ts). */
export function isPlayerOnlyProduct(product: PricedProduct): boolean {
  return !!product.name && isPlayerOnly({ name: product.name, type: product.type });
}

/** Precio "desde" para mostrar en tarjeta de catálogo (el más bajo disponible). */
export function getStartingPrice(product: PricedProduct): number {
  if (product.isLongSleeve) {
    return product.priceLongSleeve ?? DEFAULT_LONG_SLEEVE;
  }
  if (product.isRetro) {
    return product.priceRetro ?? DEFAULT_RETRO;
  }
  if (isPlayerOnlyProduct(product)) {
    return product.pricePlayer ?? DEFAULT_PLAYER;
  }
  return product.priceFan ?? DEFAULT_FAN;
}
