/**
 * Reglas derivadas del producto que NO viven como columna en la BD.
 *
 * Auditoría 2026-11-26: los datos importados de proveedor mezclan versión,
 * corte y tallas dentro del `name`. Mientras no exista el script de
 * normalización (Sprint de datos), estas reglas se derivan en tiempo de
 * render a partir del nombre — sin escribir en la BD.
 */

interface NamedProduct {
  name: string;
  type?: string | null;
}

/**
 * Producto que el proveedor solo ofrece en versión Jugador ("Player Version",
 * "Player Edition", "Versión Jugador"). Antes se le ofrecía "Fan" a $150.000
 * por defecto → 110 productos vendiéndose $30.000 por debajo de su costo real.
 */
export function isPlayerOnly(p: NamedProduct): boolean {
  const text = `${p.name} ${p.type ?? ""}`;
  return /\bplayer\b|versi[oó]n jugador/i.test(text);
}

/** Niño / bebé — se excluye de Estrenos y de colecciones editoriales. */
export function isKidsProduct(p: NamedProduct): boolean {
  // Límites Unicode (no \b): \b no reconoce "é"/"ñ" y "Bebé" no coincidía
  // con los nombres en español de la fase 2.
  return /(?<![\p{L}])(kids?|baby|infant|niñ[oa]s?|beb[eé])(?![\p{L}])/iu.test(p.name);
}

/** Fragmentos de `name` usados para excluir niño/bebé en consultas Prisma. */
export const KIDS_NAME_FRAGMENTS = ["Kids", "Kid ", "Baby", "Infant", "Niño", "Bebé"];

/**
 * Limpia el nombre de proveedor para mostrarlo: quita rangos de talla
 * ("S-4XL", "Size 16-28"), duplicados ("Home Home"), guiones bajos y el
 * prefijo "Mens".
 */
export function displayName(name: string): string {
  return name
    // Entidades HTML que llegaron crudas del scraping ("Women&#x27;s").
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    // Texto de mayorista (90 productos de Yupoo, auditoría 2026-11-27):
    // "Kit Cheap Football Jersey Wholesale Yupoo" nunca debe verlo el cliente.
    .replace(/\b(cheap|wholesale|yupoo)\b/gi, "")
    .replace(/\bFootball Jersey\b/gi, "")
    .replace(/\s*Sizes?[_ ]?(S|\d+)\s*-\s*(\w+)/gi, "")
    .replace(/\s*\bS\s*-\s*[2-4]?X*L\b/gi, "")
    .replace(/^Mens\s+/i, "")
    .replace(/\bJersey\b/gi, "")
    .replace(/\b(Home)\s+\1\b/gi, "$1")
    .replace(/\s+Home\s+Retro$/i, " Retro")
    // El importador agregaba "Home" al final aunque fuera visitante/tercera.
    .replace(/(\b(?:Home|Away|Third|Visitante|Tercera|Goalkeeper|Portero)\b.*?)\s+Home\s*$/i, "$1")
    .replace(/_/g, "/")
    .replace(/\s*\/\s*(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Plazo de entrega real (FAQ oficial): bajo encargo 25–30 días calendario
 * hasta Santa Marta + 2–4 días hábiles de envío nacional. Todo el catálogo
 * web es bajo encargo hasta que exista un campo de inventario real.
 */
export const DELIVERY = {
  label: "Bajo encargo",
  short: "Llega en 4–5 semanas",
  detail:
    "Pedimos tu camiseta al taller: tarda 25–30 días en llegar a Santa Marta y luego 2–4 días hábiles hasta tu casa, con envío gratis.",
} as const;
