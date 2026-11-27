import type { Prisma } from "@prisma/client";
import { BRAND_URLS } from "@/lib/brand-urls";
import { KIDS_NAME_FRAGMENTS } from "@/lib/product-rules";

/**
 * Colecciones editoriales (redesign-v3).
 *
 * Son la unidad de navegación "de marca": cada Reel/TikTok aterriza en una
 * colección (/coleccion/[slug]?utm_source=instagram&utm_campaign=...), no en
 * el catálogo de 2.588 referencias. Viven en código (no en la BD) a propósito:
 * no requieren cambio de esquema (el historial de migraciones está roto, ver
 * CLAUDE.md) y se editan en un solo archivo. Cuando haya panel para curarlas,
 * se migran a una tabla `Collection`.
 *
 * Los filtros se validaron contra la BD real el 2026-11-26 (conteos en
 * comentario) para que ninguna colección salga vacía.
 */

export interface Collection {
  slug: string;
  /** Línea corta encima del título. */
  kicker: string;
  title: string;
  /** Un párrafo, tono hincha — no descripción de tienda. */
  story: string;
  /** Foto editorial propia (BRAND_URLS). Si falta, se usa la 1ª camiseta. */
  cover?: string;
  where: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput[];
}

const notKids: Prisma.ProductWhereInput[] = KIDS_NAME_FRAGMENTS.map((f) => ({
  NOT: { name: { contains: f, mode: "insensitive" } },
}));

const nameAny = (terms: string[]): Prisma.ProductWhereInput => ({
  OR: terms.map((t) => ({ name: { contains: t, mode: "insensitive" as const } })),
});

// Prisma `contains` usa LIKE: "_" es comodín, por eso se escapa (`\_`) para
// que "96_97" (formato de algunos proveedores) coincida literalmente.
const NINETIES = [
  "199",
  ...Array.from({ length: 10 }, (_, i) => `9${i}/`),
  ...Array.from({ length: 10 }, (_, i) => `9${i}\\_`),
];

export const COLLECTIONS: Collection[] = [
  {
    // ~390 productos
    slug: "mundial-2026",
    kicker: "Norteamérica 2026",
    title: "Rumbo al Mundial",
    story:
      "Cuarenta y ocho selecciones, un verano entero de fútbol. Escoge la tuya antes de que empiece a rodar el balón — y si es la Tricolor, mejor todavía.",
    where: { AND: [{ league: "Mundial FIFA 2026" }, ...notKids] },
  },
  {
    // ~533 productos
    slug: "retro-90s",
    kicker: "La década que no se negocia",
    title: "Los 90",
    story:
      "Cuellos de botón, sponsors que ya no existen y diseños que hoy nadie se atreve a hacer. La época en que la camiseta era tan protagonista como el diez.",
    cover: BRAND_URLS.gallery[0],
    where: { AND: [{ isRetro: true }, nameAny(NINETIES), ...notKids] },
  },
  {
    // ~138 productos
    slug: "albiceleste-y-xeneize",
    kicker: "Argentina · Boca Juniors",
    title: "Albiceleste y Xeneize",
    story:
      "De la 10 en la playa a La Bombonera en la memoria. Las camisetas de la selección campeona y del club más pasional de Sudamérica, juntas.",
    cover: BRAND_URLS.gallery[4],
    where: { AND: [nameAny(["Argentina", "Boca"]), ...notKids] },
  },
  {
    // ~192 productos
    slug: "selecciones-de-leyenda",
    kicker: "Retro · Selecciones",
    title: "Selecciones de leyenda",
    story:
      "Italia 82, Brasil 70, Alemania 90, Colombia 94. Las camisetas que se vieron en las finales que tu papá todavía te cuenta.",
    cover: BRAND_URLS.gallery[6],
    where: {
      AND: [
        { isRetro: true },
        { league: { in: ["Selecciones Nacionales", "Retro"] } },
        nameAny([
          "Argentina", "Brazil", "Brasil", "Italy", "Italia", "Germany", "Alemania",
          "France", "Francia", "Colombia", "Netherlands", "Holland", "England",
          "Spain", "Mexico",
        ]),
        ...notKids,
      ],
    },
  },
  {
    // ~400 productos
    slug: "noches-de-europa",
    kicker: "Retro · Clubes europeos",
    title: "Noches de Europa",
    story:
      "Old Trafford, San Siro, el Bernabéu. Las camisetas de las noches de Champions que se quedaron grabadas — con el parche, si lo quieres, gratis.",
    cover: BRAND_URLS.gallery[1],
    where: {
      AND: [
        { isRetro: true },
        nameAny([
          "Real Madrid", "Barcelona", "M-U", "Manchester United", "Milan", "Inter",
          "Juventus", "Liverpool", "Bayern", "Arsenal", "Chelsea",
        ]),
        ...notKids,
      ],
    },
  },
  {
    // ~16 productos
    slug: "la-tricolor",
    kicker: "Colombia",
    title: "La Tricolor",
    story:
      "Amarilla de domingo, de barrio y de estadio. Todas las versiones de la camiseta de Colombia que tenemos, en un solo lugar.",
    where: { AND: [nameAny(["Colombia"]), ...notKids] },
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
