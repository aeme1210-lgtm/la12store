import { prisma } from "@/lib/prisma";

/**
 * "ESTRENOS" — selección determinista sembrada por fecha (YYYYMMDD), sin
 * cron ni servicio pago. Mismo resultado para todos los visitantes del
 * mismo día; cambia al día siguiente. La página que la usa debe declarar
 * `export const revalidate = 86400` (ISR de 24h) para que el cálculo no se
 * repita en cada request.
 *
 * FC Barcelona y Real Madrid de la temporada 26/27 SIEMPRE están presentes
 * (si existen en el catálogo); el resto rota entre los demás productos de
 * la colección "Temporada 26/27".
 */

const COLLECTION_LEAGUE = "Temporada 26/27";
const TARGET_COUNT = 10;

/** LCG determinista — mismo seed = misma secuencia, sin dependencias externas. */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function shuffleDeterministic<T>(arr: T[], seed: number): T[] {
  const rand = seededRandom(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface EstrenoProduct {
  id: string;
  slug: string;
  name: string;
  team: string;
  images: string;
  priceFan: number | null;
  pricePlayer: number | null;
  priceRetro: number | null;
  priceLongSleeve: number | null;
  isRetro: boolean;
  isLongSleeve: boolean;
  isTrending: boolean;
  isNew: boolean;
  league: string;
  season: string | null;
  type: string;
}

export async function getEstrenos(): Promise<EstrenoProduct[]> {
  const all = await prisma.product.findMany({
    where: { league: COLLECTION_LEAGUE, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (all.length === 0) return [];

  const isFixed = (p: (typeof all)[number]) =>
    /barcelona|barça|barca/i.test(p.team) || /real madrid/i.test(p.team);

  const fixed = all.filter(isFixed);
  const rest = all.filter((p) => !isFixed(p));

  const shuffledRest = shuffleDeterministic(rest, todaySeed());
  const remainingSlots = Math.max(0, TARGET_COUNT - fixed.length);

  return [...fixed, ...shuffledRest.slice(0, remainingSlots)];
}
