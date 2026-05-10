import { prisma } from "@/lib/prisma";

export interface BarcaPromoStatus {
  active: boolean;
  endAt: Date | null;
}

/**
 * Lee el estado de la promo desde la BD.
 * Si la promo expiró, la desactiva automáticamente.
 * Llamar solo desde Server Components / Route Handlers.
 */
export async function getBarcaPromoStatus(): Promise<BarcaPromoStatus> {
  try {
    const promo = await prisma.promo.findUnique({
      where: { slug: "campeones-barca" },
    });

    if (!promo || !promo.active) return { active: false, endAt: null };

    const now = new Date();
    if (now > promo.endAt) {
      // Auto-desactivar sin bloquear la respuesta
      prisma.promo
        .update({ where: { slug: "campeones-barca" }, data: { active: false } })
        .catch(() => {});
      return { active: false, endAt: null };
    }

    return { active: true, endAt: promo.endAt };
  } catch {
    return { active: false, endAt: null };
  }
}

/**
 * Detecta si el nombre de un producto corresponde a una camiseta del Barça.
 * Normaliza acentos para capturar "Barça", "Barca", "FC Barcelona", etc.
 */
export function isBarcaProduct(productName: string): boolean {
  const n = productName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return n.includes("barcelona") || n.includes("barca");
}

/** Aplica el 20 % de descuento y redondea al entero más cercano. */
export function applyBarcaDiscount(price: number): number {
  return Math.round(price * 0.8);
}

/** Tiempo restante a partir de un timestamp. Nunca devuelve negativos. */
export function getTimeRemaining(endAt: Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = Math.max(0, endAt.getTime() - Date.now());
  if (total === 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}
