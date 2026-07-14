/**
 * Capa de normalización derivada para el campo `type` de Product.
 *
 * FASE 1 confirmó contra la BD real que `type` mezcla tipo de camiseta
 * (Home/Away/Third/Goalkeeper...) con colores (Red/Yellow/Black...) y con
 * idiomas mezclados (inglés/español), acumulado por años de scripts de
 * importación distintos (ver /scripts).
 *
 * En vez de reescribir 3,344 filas a mano (alto riesgo, ver REDESIGN_SYSTEM.md
 * §2), este módulo traduce cada valor crudo conocido a dos campos separados y
 * en español, en tiempo de consulta/render. La columna `type` en la BD NO se
 * modifica. Los scripts de importación (Fase 3) sí se corrigen para que datos
 * NUEVOS ya entren limpios — este mapa cubre el historial existente.
 *
 * Si aparece un valor de `type` no mapeado aquí, se devuelve tal cual (no se
 * inventa una traducción) y se loguea para revisión manual.
 */

export interface NormalizedType {
  /** Tipo de camiseta en español, o null si el valor crudo era solo un color. */
  tipoCamiseta: string | null;
  /** Color extraído, si el valor crudo era (o incluía) un color. */
  colorPrincipal: string | null;
  /** Valor crudo original, para debug/administración. */
  raw: string;
}

const TYPE_MAP: Record<string, string> = {
  home: "Local",
  local: "Local",
  away: "Visitante",
  visitante: "Visitante",
  third: "Tercera",
  "third away": "Tercera",
  tercera: "Tercera",
  goalkeeper: "Portero",
  portero: "Portero",
  "special edition": "Edición Especial",
  "edición especial": "Edición Especial",
  "pre-partido": "Pre-partido",
  entrenamiento: "Entrenamiento",
};

const COLOR_MAP: Record<string, string> = {
  red: "Rojo",
  yellow: "Amarillo",
  white: "Blanco",
  black: "Negro",
  blue: "Azul",
  purple: "Morado",
  green: "Verde",
  gold: "Dorado",
  grey: "Gris",
  gray: "Gris",
  navy: "Azul marino",
};

/** Combinaciones "Goalkeeper Red", "Goalkeeper Blue", etc. */
const GOALKEEPER_COLOR = /^goalkeeper\s+(.+)$/i;

export function normalizeType(rawType: string): NormalizedType {
  const raw = rawType.trim();
  const key = raw.toLowerCase();

  const gkMatch = raw.match(GOALKEEPER_COLOR);
  if (gkMatch) {
    const colorKey = gkMatch[1].toLowerCase();
    return {
      tipoCamiseta: "Portero",
      colorPrincipal: COLOR_MAP[colorKey] ?? null,
      raw,
    };
  }

  if (key in TYPE_MAP) {
    return { tipoCamiseta: TYPE_MAP[key] || null, colorPrincipal: null, raw };
  }

  if (key in COLOR_MAP) {
    return { tipoCamiseta: null, colorPrincipal: COLOR_MAP[key], raw };
  }

  // Valor no mapeado: se devuelve tal cual, sin inventar traducción.
  return { tipoCamiseta: raw, colorPrincipal: null, raw };
}

/** Lista de tipos de camiseta válidos en español, para poblar el filtro "Tipo". */
export const KNOWN_SHIRT_TYPES = [
  "Local",
  "Visitante",
  "Tercera",
  "Portero",
  "Edición Especial",
  "Pre-partido",
  "Entrenamiento",
];

/** Lista de colores conocidos, para poblar el filtro "Color" (separado de "Tipo"). */
export const KNOWN_COLORS = [
  "Rojo",
  "Amarillo",
  "Blanco",
  "Negro",
  "Azul",
  "Morado",
  "Verde",
  "Dorado",
  "Gris",
  "Azul marino",
];

export interface TaxonomyIndex {
  /** Tipos de camiseta (español) realmente presentes en el catálogo, ordenados. */
  tipos: string[];
  /** Colores (español) realmente presentes en el catálogo, ordenados. */
  colores: string[];
  /** tipoCamiseta (español) -> valores crudos de `type` que corresponden, para filtrar en Prisma. */
  tipoToRaw: Record<string, string[]>;
  /** colorPrincipal (español) -> valores crudos de `type` que corresponden, para filtrar en Prisma. */
  colorToRaw: Record<string, string[]>;
}

/**
 * Construye el índice tipo/color a partir de los valores crudos de `type`
 * presentes hoy en la BD (ej. resultado de `prisma.product.groupBy({by:["type"]})`).
 * Se usa tanto para poblar las opciones del filtro como para traducir una
 * selección de usuario ("Portero") de vuelta a los valores crudos que hay
 * que pasarle a Prisma (`type: { in: [...] }`).
 */
export function buildTaxonomyIndex(rawTypes: string[]): TaxonomyIndex {
  const tipoToRaw: Record<string, string[]> = {};
  const colorToRaw: Record<string, string[]> = {};

  for (const raw of rawTypes) {
    const { tipoCamiseta, colorPrincipal } = normalizeType(raw);
    if (tipoCamiseta) {
      (tipoToRaw[tipoCamiseta] ??= []).push(raw);
    }
    if (colorPrincipal) {
      (colorToRaw[colorPrincipal] ??= []).push(raw);
    }
  }

  return {
    tipos: Object.keys(tipoToRaw).sort(),
    colores: Object.keys(colorToRaw).sort(),
    tipoToRaw,
    colorToRaw,
  };
}
