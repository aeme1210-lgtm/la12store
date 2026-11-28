/**
 * Reglas de normalización del catálogo — compartidas por
 * scripts/normalize-catalog.ts (propuesta, solo lectura) y
 * scripts/apply-normalization.ts (aplicación con respaldo).
 * Funciones puras: no tocan la base de datos.
 */

import { TEAM_ALIASES } from "../lib/team-aliases";

export { TEAM_ALIASES };

// ── Diccionarios ────────────────────────────────────────────────────────────


/**
 * Primeras palabras que no alcanzan para identificar un club: solo valen si
 * la clave completa está en TEAM_ALIASES, nunca como prefijo.
 */
const AMBIGUOUS_PREFIXES = new Set([
  "atletico", "athletic", "inter", "real", "racing", "sporting", "ac", "paris", "miami",
  "river", "deportivo", "universidad", "university", "fc", "club", "united", "city",
]);

/** Palabras de ruido que el proveedor mete en `team`. */
export const NOISE = [
  "mens", "men's", "womens", "women's", "women", "kids", "kid", "baby", "infant",
  "jersey", "jerseys", "shirt", "soccer", "football", "kit", "home", "away", "third",
  "fourth", "goalkeeper", "gk", "retro", "player", "version", "edition", "special",
  "commemorative", "anniversary", "training", "suit", "windbreaker", "jacket", "polo",
  "ls", "long", "sleeve", "manga", "larga", "local", "visitante", "tercera", "world",
  "cup", "pre-match", "prematch", "pre", "match", "promotional", "apparel", "concept",
  "fans", "fan", "at", "the", "hird", "3rd", "sizes", "size", "vest", "dark", "light", "game",
  "red", "blue", "black", "white", "yellow", "green", "purple", "gold", "grey", "gray",
  "navy", "pink", "maroon", "beige", "orange", "stripe",
  // Truncados y texto de mayorista que llegó en algunos nombres de proveedor.
  "awa", "hom", "kits", "tracksuits", "tracksuit", "cheap", "wholesale", "yupoo", "yu", "clothes",
  // Importación Pandasport (2026-11-27): "Woman crop top", "Long-Sleeve", "Venezia FC".
  "woman", "crop", "top", "long-sleeve", "long-sleeved", "sleeved", "shorts", "short", "fc", "cf",
  // Importación todojerseys (2026-11-28).
  "sets", "set", "street", "girl", "girls", "shirts", "shisrts", "jersyes", "vesion", "versio", "pv",
  "anniverasjerseys", "souvenir", "with", "sponsor", "sponsors", "sponsers", "without", "full",
  "add", "authentic", "uniform", "adults", "youth", "and", "cropped", "cr7", "ucl", "last",
];

/** Texto de mayorista que nunca debería verse en la tienda. */
export const SUPPLIER_JUNK = /\b(cheap|wholesale|yupoo|replica|aaa|thai)\b/i;

// ── Utilidades ──────────────────────────────────────────────────────────────

export const strip = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const titleCase = (s: string) =>
  s.replace(/\S+/g, (w) => (w.length <= 3 && /^[a-z]+$/.test(w) && w !== "fc" ? w : w[0].toUpperCase() + w.slice(1)));

export function cleanTeamKey(team: string): string {
  let s = strip(team)
    // "_" y "/" primero: "1992_93" no tiene límite de palabra y escapaba a los regex de año.
    .replace(/[_/]/g, " ")
    // "11retro", "milanretro", "retro17-" → separa "retro" pegado.
    .replace(/retro/g, " retro ")
    .replace(/\+\s*all\s+sponsors/g, " ")
    .replace(/\bsizes?\s*[\w-]+/g, " ")
    .replace(/\bs\s*-\s*[2-4]?x*l\b/g, " ")
    .replace(/\b\d{1,3}(st|nd|rd|th)\b/g, " ")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b\d{2}\s?-\s?\d{2}\b/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/[_/()]/g, " ");
  const noise = new Set(NOISE);
  s = s
    .split(/\s+/)
    .filter((w) => w && !noise.has(w))
    .join(" ")
    .trim();
  return s;
}

const CANONICAL_TEAMS = new Set(Object.values(TEAM_ALIASES));
const CANONICAL_BY_KEY = new Map([...CANONICAL_TEAMS].map((t) => [strip(t), t]));

/**
 * Equipo canónico. `name` es el respaldo cuando `team` es solo ruido
 * ("Mens", "Kids", "Womens" — 213 productos importados así).
 * "Resuelto" = está en el diccionario o ya es un nombre limpio (solo letras,
 * máximo 4 palabras). Lo demás se marca REVISAR.
 */
export function canonicalTeam(team: string, name: string): { team: string; resolved: boolean } {
  // Ya canónico (fase 1 aplicada): se respeta tal cual, con sus tildes.
  // Sin esto "Japón" → clave "japon" → "Japon".
  if (CANONICAL_TEAMS.has(team.trim())) return { team: team.trim(), resolved: true };
  const byStripped = CANONICAL_BY_KEY.get(strip(team.trim()));
  if (byStripped) return { team: byStripped, resolved: true };
  let key = cleanTeamKey(team);
  if (!key) key = cleanTeamKey(name);
  if (!key) return { team: team.trim(), resolved: false };
  if (TEAM_ALIASES[key]) return { team: TEAM_ALIASES[key], resolved: true };
  // Intento por prefijo: "real madrid hom" → "real madrid"
  const words = key.split(" ");
  for (let n = words.length - 1; n >= 1; n--) {
    const prefix = words.slice(0, n).join(" ");
    if (n === 1 && AMBIGUOUS_PREFIXES.has(prefix)) continue;
    if (TEAM_ALIASES[prefix]) return { team: TEAM_ALIASES[prefix], resolved: true };
  }
  const looksClean = /^[\p{L} .'-]+$/u.test(key) && words.length <= 4;
  return { team: prettyFromOriginal(team, key) ?? titleCase(key), resolved: looksClean };
}

/**
 * Nombre de equipo con la grafía ORIGINAL del proveedor (siglas y tildes):
 * "SV Elversberg", "CD Castellón", "AEK Athens", "El Salvador" — en vez de
 * la clave en minúsculas ("sv elversberg"). Solo se usa si conserva las
 * mismas palabras que la clave limpia.
 */
function prettyFromOriginal(original: string, key: string): string | null {
  const keyWords = key.split(" ");
  const out: string[] = [];
  for (const tok of original.replace(/[_/()]/g, " ").split(/\s+/)) {
    const s = strip(tok);
    if (keyWords.includes(s) && !out.some((o) => strip(o) === s)) {
      out.push(/^[a-zà-ÿ]/.test(tok) ? tok[0].toUpperCase() + tok.slice(1) : tok);
    }
  }
  return out.length === keyWords.length ? out.join(" ") : null;
}

export function garmentKind(name: string): string {
  const n = strip(name);
  if (/windbreaker|jacket|chaqueta|rompevientos/.test(n)) return "Chaqueta";
  if (/training suit|tracksuit|sudadera/.test(n)) return "Conjunto de entrenamiento";
  if (/hoodie|sweatshirt|\bbuzo\b/.test(n)) return "Buzo";
  if (/\bpolo\b/.test(n)) return "Polo";
  if (/\bvest\b|\bchaleco\b/.test(n)) return "Esqueleto";
  if (/\bshorts?\b/.test(n)) return "Pantaloneta";
  if (/kids? kit|\bkit\b/.test(n) && /kid|nin/.test(n)) return "Conjunto niño";
  return "Camiseta";
}

export function audience(name: string): string {
  const n = strip(name);
  if (/\b(baby|infant|bebe)\b/.test(n)) return "Bebé";
  if (/\bkids?\b|\bnin[oa]s?\b|size 1\d/.test(n)) return "Niño";
  if (/\bwom[ae]n'?s?\b|\bmujer\b|\blady\b|\bfemale\b|\bgirls?\b/.test(n)) return "Mujer";
  return "Adulto";
}

export function sleeve(name: string, isLongSleeve: boolean): string {
  // "Long-Sleeve" con guion se escapaba (fase 2): esas camisetas se cobraban como Fan.
  return isLongSleeve || /\bls\b|long[- ]?sleeves?|manga larga/i.test(name) ? "Larga" : "Corta";
}

export function shirtType(name: string, type: string): string {
  const t = strip(`${type} ${name}`);
  if (/goalkeeper|\bgk\b|portero/.test(t)) return "Portero";
  if (/pre-?match|pre-partido/.test(t)) return "Pre-partido";
  if (/training|entrenamiento/.test(t)) return "Entrenamiento";
  if (/special|commemorative|anniversary|edicion especial|concept/.test(t)) return "Edición especial";
  if (/fourth|cuarta/.test(t)) return "Cuarta";
  // "hird", "3rd" y "awa" llegan truncados en nombres de proveedor.
  if (/third|tercera|\bhird\b|\b3rd\b/.test(t)) return "Tercera";
  if (/\baway\b|\bawa\b|visitante/.test(t)) return "Visitante";
  return "Local";
}

export function season(name: string, raw: string | null): string {
  // Quita rangos de talla ("SIZE 16-28") para que no se lean como temporada 2016/28.
  const src = `${raw ?? ""} ${name}`.replace(/\bsizes?\s*\d+\s*-\s*\d+/gi, " ");
  const pair = src.match(/\b(\d{2,4})[/_-](\d{2})\b/);
  if (pair) {
    const a = pair[1].length === 2 ? (Number(pair[1]) > 50 ? `19${pair[1]}` : `20${pair[1]}`) : pair[1];
    return `${a}/${pair[2]}`;
  }
  const year = src.match(/\b(19|20)\d{2}\b/);
  return year ? year[0] : "";
}

export function version(p: { name: string; type: string; isRetro: boolean }): string {
  if (p.isRetro) return "Retro";
  if (/\bplayer\b|versi[oó]n jugador/i.test(`${p.name} ${p.type}`)) return "Jugador";
  return "Fan";
}

// ── Propuesta por producto ──────────────────────────────────────────────────

export interface ProductInput {
  name: string;
  team: string;
  type: string;
  season: string | null;
  isRetro: boolean;
  isLongSleeve: boolean;
  priceFan: number | null;
  priceRetro: number | null;
  priceLongSleeve: number | null;
}

export interface Proposal {
  team: string;
  teamResolved: boolean;
  kind: string;
  audience: string;
  sleeve: string;
  shirtType: string;
  season: string;
  version: string;
  name: string;
  isNew: boolean;
  isLongSleeve: boolean;
  alerts: string[];
}

/** Propuesta completa para un producto. Pura: no consulta ni escribe la BD. */
export function proposeProduct(p: ProductInput): Proposal {
  const t = canonicalTeam(p.team, p.name);
  const kind = garmentKind(p.name);
  const aud = audience(p.name);
  const man = sleeve(p.name, p.isLongSleeve);
  const tipo = shirtType(p.name, p.type);
  const temp = season(p.name, p.season);
  const ver = version(p);

  const sufijos = [
    ver === "Retro" ? "Retro" : ver === "Jugador" ? "Versión Jugador" : null,
    man === "Larga" ? "Manga Larga" : null,
    // "Conjunto niño" ya dice el público: no repetir "Niño" al final.
    aud !== "Adulto" && !/niño/i.test(kind) ? aud : null,
  ].filter(Boolean);
  const base =
    kind === "Camiseta"
      ? `${t.team} ${tipo}`
      : kind === "Conjunto niño"
        ? `${kind} ${t.team} ${tipo}` // conserva Local/Visitante del conjunto
        : `${kind} ${t.team}`;
  const name = [base, temp, ...sufijos].filter(Boolean).join(" ").replace(/\s+/g, " ");

  const isNew = /2026\/27|2026$/.test(temp) && aud === "Adulto" && kind === "Camiseta";
  const isLongSleeve = man === "Larga";

  const alerts: string[] = [];
  if (ver === "Jugador" && (p.priceFan ?? 150000) < 180000)
    alerts.push("Jugador con precio Fan < $180.000 (ya mitigado en código)");
  if (isLongSleeve && !p.isLongSleeve) alerts.push("Manga larga sin isLongSleeve");
  if (isLongSleeve && (p.priceLongSleeve ?? p.priceFan ?? 0) < 185000 && (p.priceRetro ?? 0) < 185000)
    alerts.push("Manga larga con precio < $185.000");
  if (p.isRetro && p.priceRetro == null) alerts.push("Retro sin priceRetro (usa default $170.000)");
  const startYear = Number((temp.match(/^\d{4}/) ?? ["0"])[0]);
  if (p.isRetro && startYear >= 2023)
    alerts.push(`Marcado retro pero es temporada reciente (${temp}) → se cobra $170.000`);
  if (SUPPLIER_JUNK.test(p.name)) alerts.push("Nombre con texto de mayorista visible al cliente");

  return {
    team: t.team, teamResolved: t.resolved, kind, audience: aud, sleeve: man,
    shirtType: tipo, season: temp, version: ver, name, isNew, isLongSleeve, alerts,
  };
}

// ── Fase 2: nombres únicos y URLs limpias ───────────────────────────────────

const COLOR_ES: Record<string, string> = {
  green: "Verde", black: "Negra", white: "Blanca", gold: "Dorada", golden: "Dorada",
  red: "Roja", blue: "Azul", yellow: "Amarilla", pink: "Rosada", purple: "Morada",
  grey: "Gris", gray: "Gris", navy: "Azul marino", beige: "Beige", orange: "Naranja",
  maroon: "Vinotinto", fluorescent: "Fluorescente", silver: "Plateada", brown: "Café",
};

const WORD_ES: Record<string, string> = {
  baseball: "Béisbol", reflective: "Reflectiva", casual: "Casual", embroidered: "Bordado",
  rainbow: "Arcoíris", stripes: "Rayas", stripe: "Rayas", champions: "Champions",
  league: "League", centenary: "Centenario", anniversary: "Aniversario", original: "Original",
};

/** Palabras que no aportan para distinguir dos productos del mismo equipo/temporada. */
// Los colores SÍ distinguen (Mallorca roja vs. blanca): se excluyen de NOISE aquí.
const DESCRIPTOR_STOP = new Set([
  ...NOISE.filter((w) => !(w in COLOR_ES)),
  "with", "pants", "and", "x", "of", "for", "stadium", "sale", "presale",
  "quality", "players", "fc", "co", "branded", "version", "jerseys", "shirt", "edicion",
  "especial", "local", "visitante", "tercera", "portero", "entrenamiento", "partido",
  "jugador", "player", "nino", "nina", "mujer", "bebe", "s", "xxl", "xl", "l", "m",
  "sleeved", "sleeves", "original", "womens", "woman", "crop", "top", "shorts", "short",
  // Nombres de equipo en cualquier idioma ("Spain" cuando el equipo ya es "España").
  ...Object.keys(TEAM_ALIASES).flatMap((k) => k.split(" ")),
]);

/**
 * Detalle que distingue a un producto de otro con el mismo nombre propuesto:
 * colores y palabras del nombre original que las reglas descartaron
 * ("Black Panther", "Baseball", "Green"). Máximo 3 palabras.
 */
export function descriptor(originalName: string, team: string): string {
  const teamWords = new Set(strip(team).split(/\s+/));
  const words = strip(originalName)
    .replace(/&#x27;|&amp;/g, " ")
    .replace(/[_/(),.+-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/\d/.test(w) && !DESCRIPTOR_STOP.has(w) && !teamWords.has(w) && !SUPPLIER_JUNK.test(w));
  const out: string[] = [];
  for (const w of words) {
    const t = COLOR_ES[w] ?? WORD_ES[w] ?? (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : null);
    if (t && !out.includes(t)) out.push(t);
    if (out.length === 3) break;
  }
  // "Navy Blue" → "Azul marino", no "Azul marino Azul".
  return out.filter((w) => !(w === "Azul" && out.includes("Azul marino"))).join(" ");
}

/**
 * Nombre final por producto. Si dos productos quedan con el mismo nombre se
 * les agrega su detalle distintivo ("Liverpool Edición especial 2025/26 ·
 * Verde"). Los que siguen iguales después de eso son, casi siempre, el mismo
 * producto importado dos veces: se reportan como posibles duplicados.
 */
export function proposeNames(
  products: (ProductInput & { id: string })[]
): { names: Map<string, string>; possibleDuplicates: string[][] } {
  const base = new Map(products.map((p) => [p.id, proposeProduct(p).name]));
  const groups = new Map<string, string[]>();
  for (const [id, n] of base) groups.set(n, [...(groups.get(n) ?? []), id]);

  const byId = new Map(products.map((p) => [p.id, p]));
  const names = new Map(base);
  for (const ids of groups.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) {
      const p = byId.get(id)!;
      const d = descriptor(p.name, proposeProduct(p).team);
      if (d) names.set(id, `${base.get(id)} · ${d}`);
    }
  }

  const final = new Map<string, string[]>();
  for (const [id, n] of names) final.set(n, [...(final.get(n) ?? []), id]);
  const possibleDuplicates = [...final.values()].filter((ids) => ids.length > 1);
  return { names, possibleDuplicates };
}

/** URL a partir del nombre: sin tildes, minúsculas, guiones. */
export function slugify(s: string): string {
  return strip(s)
    .replace(/[·/]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/**
 * URLs que vale la pena cambiar: las que muestran texto de mayorista, tallas,
 * entidades HTML o el prefijo "mens". Las demás se conservan aunque el nombre
 * cambie, para no mover URLs que ya están indexadas sin necesidad.
 */
export function isBadSlug(slug: string): boolean {
  return /cheap|wholesale|yupoo?|(^|-)s-?[2-4]?x+l(-|$)|size-?\d|x27|(^|-)mens-|(^|-)womens-|quality|pre-sale/.test(slug);
}
