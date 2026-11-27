/**
 * Reglas de normalización del catálogo — compartidas por
 * scripts/normalize-catalog.ts (propuesta, solo lectura) y
 * scripts/apply-normalization.ts (aplicación con respaldo).
 * Funciones puras: no tocan la base de datos.
 */

// ── Diccionarios ────────────────────────────────────────────────────────────

/** Clave normalizada (minúsculas, sin tildes) → nombre canónico en español. */
export const TEAM_ALIASES: Record<string, string> = {
  // Clubes
  "m-u": "Manchester United", mu: "Manchester United", "man utd": "Manchester United",
  "man united": "Manchester United", "manchester united": "Manchester United",
  "man city": "Manchester City", "manchester city": "Manchester City",
  "paris psg": "PSG", psg: "PSG", "paris saint germain": "PSG", "paris saint-germain": "PSG", paris: "PSG",
  inter: "Inter de Milán", "inter milan": "Inter de Milán", internazionale: "Inter de Milán",
  ac: "AC Milan", "ac milan": "AC Milan", milan: "AC Milan",
  "river bed": "River Plate", river: "River Plate", "river plate": "River Plate",
  bayern: "Bayern Múnich", "bayern munich": "Bayern Múnich", "fc bayern": "Bayern Múnich",
  "atletico madrid": "Atlético de Madrid", atletico: "Atlético de Madrid",
  "real madrid": "Real Madrid", barcelona: "FC Barcelona", "fc barcelona": "FC Barcelona", barca: "FC Barcelona",
  dortmund: "Borussia Dortmund", "borussia dortmund": "Borussia Dortmund",
  tottenham: "Tottenham", spurs: "Tottenham",
  "newcastle united": "Newcastle", newcastle: "Newcastle",
  "west ham utd": "West Ham", "west ham united": "West Ham", "west ham": "West Ham",
  "sao paulo": "São Paulo", "colo colo": "Colo-Colo", "catholic university": "Universidad Católica",
  chivas: "Chivas", "chivas de guadalajara": "Chivas",
  "sporting gijon": "Sporting de Gijón", cologne: "FC Colonia",
  "boca juniors": "Boca Juniors", boca: "Boca Juniors",
  juventus: "Juventus", juve: "Juventus", roma: "AS Roma", "as roma": "AS Roma",
  liverpool: "Liverpool", arsenal: "Arsenal", chelsea: "Chelsea", napoli: "Napoli",
  "la galaxy": "LA Galaxy", "inter miami": "Inter Miami",
  // Selecciones
  brazil: "Brasil", brasil: "Brasil", germany: "Alemania", italy: "Italia", italia: "Italia",
  france: "Francia", spain: "España", england: "Inglaterra", netherlands: "Países Bajos",
  holland: "Países Bajos", mexico: "México", japan: "Japón", belgium: "Bélgica",
  switzerland: "Suiza", portugal: "Portugal", argentina: "Argentina", colombia: "Colombia",
  peru: "Perú", cameroon: "Camerún", turkiye: "Turquía", turkey: "Turquía",
  usa: "Estados Unidos", "united states": "Estados Unidos", canada: "Canadá",
  uruguay: "Uruguay", chile: "Chile", ecuador: "Ecuador", croatia: "Croacia",
  denmark: "Dinamarca", scotland: "Escocia", nigeria: "Nigeria", morocco: "Marruecos",
  "south korea": "Corea del Sur", korea: "Corea del Sur", sweden: "Suecia", norway: "Noruega",
  columbia: "Colombia", wales: "Gales", ireland: "Irlanda", tunisia: "Túnez", algeria: "Argelia",
  haiti: "Haití", senegal: "Senegal", jamaica: "Jamaica", guatemala: "Guatemala",
  // Clubes (segunda pasada, 2026-11-27)
  "m u": "Manchester United", naples: "Napoli", marseille: "Olympique de Marsella",
  "deportivo universidad catolica": "Universidad Católica", "universidad catolica": "Universidad Católica",
  "university of chile": "Universidad de Chile", "universidad de chile": "Universidad de Chile",
  "deportivo la coruna": "Deportivo La Coruña", "athletic bilbao": "Athletic Club", bilbao: "Athletic Club",
  celtic: "Celtic", celtics: "Celtic", eindhoven: "PSV", psv: "PSV", schalke: "Schalke 04",
  leverkusen: "Bayer Leverkusen", miami: "Inter Miami", gremio: "Grêmio", malaga: "Málaga",
  celta: "Celta de Vigo", "real betis": "Real Betis", betis: "Real Betis", sevilla: "Sevilla",
  "san lorenzo": "San Lorenzo", "racing club": "Racing Club", "vasco da gama": "Vasco da Gama",
  // Clubes distintos que comparten la primera palabra con otro alias (revisión 2026-11-27):
  // sin esto, "Atletico Mineiro" terminaba como Atlético de Madrid y "Miami FC" como Inter Miami.
  "atletico mineiro": "Atlético Mineiro", "atletico nacional": "Atlético Nacional",
  "athletico paranaense": "Athletico Paranaense", "miami fc": "Miami FC",
};

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

/**
 * Equipo canónico. `name` es el respaldo cuando `team` es solo ruido
 * ("Mens", "Kids", "Womens" — 213 productos importados así).
 * "Resuelto" = está en el diccionario o ya es un nombre limpio (solo letras,
 * máximo 4 palabras). Lo demás se marca REVISAR.
 */
export function canonicalTeam(team: string, name: string): { team: string; resolved: boolean } {
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
  return { team: titleCase(key), resolved: looksClean };
}

export function garmentKind(name: string): string {
  const n = strip(name);
  if (/windbreaker|jacket|chaqueta|rompevientos/.test(n)) return "Chaqueta";
  if (/training suit|tracksuit|sudadera/.test(n)) return "Conjunto de entrenamiento";
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
  if (/\bwom[ae]n'?s?\b|\bmujer\b|\blady\b|\bfemale\b/.test(n)) return "Mujer";
  return "Adulto";
}

export function sleeve(name: string, isLongSleeve: boolean): string {
  return isLongSleeve || /\bls\b|long sleeve|manga larga/i.test(name) ? "Larga" : "Corta";
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
  const src = `${raw ?? ""} ${name}`;
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
    aud !== "Adulto" ? aud : null,
  ].filter(Boolean);
  const base = kind === "Camiseta" ? `${t.team} ${tipo}` : `${kind} ${t.team}`;
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
