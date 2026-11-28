/**
 * Lanzamientos con fecha de apertura (aniversario La 12 Store).
 *
 * La sección de guayos queda BLOQUEADA hasta `unlockAt`: en la portada se ve
 * con candado y cuenta regresiva, y sus productos no aparecen en el catálogo,
 * la búsqueda, el sitemap ni por URL directa. Pasada la hora se abre sola, sin
 * publicar nada nuevo: todas las páginas que la usan se renderizan en cada visita.
 *
 * Para cargar guayos basta con crear productos con `league: "Guayos"`
 * (p. ej. con scripts/import-yupoo-category.ts --league "Guayos").
 *
 * Variables opcionales (Vercel → Settings → Environment Variables):
 *   GUAYOS_UNLOCK_AT  fecha ISO para mover la apertura sin tocar código,
 *                     p. ej. "2026-11-29T15:00:00-05:00".
 *   GUAYOS_LEAGUE     solo para pruebas locales (mostrar otra liga con fotos).
 */
const DEFAULT_UNLOCK = "2026-11-29T15:00:00-05:00"; // domingo 29/11/2026, 3:00 p. m. Colombia

export const GUAYOS = {
  league: process.env.GUAYOS_LEAGUE || "Guayos",
  slug: "guayos",
  unlockAt: new Date(process.env.GUAYOS_UNLOCK_AT || DEFAULT_UNLOCK),
} as const;

export function isGuayosUnlocked(now: Date = new Date()): boolean {
  return now.getTime() >= GUAYOS.unlockAt.getTime();
}
