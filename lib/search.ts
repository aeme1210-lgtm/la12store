/**
 * search.ts
 * Utilidades de búsqueda: normalización, aliases y expansión de términos.
 * Usado por el catálogo (server) y el Navbar (client).
 */

import { TEAM_ALIASES } from "@/lib/team-aliases";

/** Convierte texto a minúsculas sin acentos */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Mapa de aliases: clave = forma normalizada que el usuario podría escribir,
 * valor = nombre canónico (tal como está en la BD).
 * Orden no importa — se revisan todos los keys.
 */
const searchAliases: Record<string, string> = {
  // ── Clubes españoles ─────────────────────────────────────────────────────
  barca: "Barcelona",
  barsa: "Barcelona",
  barcsa: "Barcelona",
  blaugrana: "Barcelona",
  culé: "Barcelona",
  "real madrid": "Real Madrid",
  madrid: "Real Madrid",
  merengue: "Real Madrid",
  blancos: "Real Madrid",
  atletico: "Atlético de Madrid",
  atleti: "Atlético de Madrid",
  "atletico madrid": "Atlético de Madrid",
  colchonero: "Atlético de Madrid",
  betis: "Real Betis",
  sevilla: "Sevilla",
  valencia: "Valencia",
  villarreal: "Villarreal",
  "real sociedad": "Real Sociedad",
  bilbao: "Athletic Club",

  // ── Premier League ────────────────────────────────────────────────────────
  "man united": "Manchester United",
  "manchester united": "Manchester United",
  manu: "Manchester United",
  "red devils": "Manchester United",
  "man city": "Manchester City",
  "manchester city": "Manchester City",
  city: "Manchester City",
  liverpool: "Liverpool",
  reds: "Liverpool",
  chelsea: "Chelsea",
  arsenal: "Arsenal",
  gunners: "Arsenal",
  spurs: "Tottenham",
  tottenham: "Tottenham",
  "newcastle united": "Newcastle",
  newcastle: "Newcastle",
  "aston villa": "Aston Villa",
  everton: "Everton",

  // ── Serie A ───────────────────────────────────────────────────────────────
  juve: "Juventus",
  juventus: "Juventus",
  inter: "Inter Milan",
  "inter milan": "Inter Milan",
  nerazzurri: "Inter Milan",
  milan: "AC Milan",
  "ac milan": "AC Milan",
  rossoneri: "AC Milan",
  napoli: "Napoli",
  partenopei: "Napoli",
  roma: "AS Roma",
  lazio: "Lazio",
  fiorentina: "Fiorentina",
  atalanta: "Atalanta",

  // ── Bundesliga ────────────────────────────────────────────────────────────
  bayern: "Bayern Munich",
  "fc bayern": "Bayern Munich",
  bvb: "Borussia Dortmund",
  dortmund: "Borussia Dortmund",
  "borussia dortmund": "Borussia Dortmund",
  leverkusen: "Bayer Leverkusen",
  leipzig: "RB Leipzig",

  // ── Ligue 1 ───────────────────────────────────────────────────────────────
  psg: "Paris Saint-Germain",
  "paris saint germain": "Paris Saint-Germain",
  "paris saint-germain": "Paris Saint-Germain",
  marseille: "Olympique de Marseille",
  lyon: "Olympique Lyonnais",
  monaco: "AS Monaco",

  // ── Otros clubes europeos ─────────────────────────────────────────────────
  ajax: "Ajax",
  porto: "Porto",
  benfica: "Benfica",
  "sporting cp": "Sporting CP",
  sporting: "Sporting CP",
  celtic: "Celtic",
  rangers: "Rangers",

  // ── Clubes latinoamericanos ───────────────────────────────────────────────
  "atletico nacional": "Atlético Nacional",
  nacional: "Atlético Nacional",
  verde: "Atlético Nacional",
  verdolaga: "Atlético Nacional",
  millonarios: "Millonarios",
  millos: "Millonarios",
  "santa fe": "Santa Fe",
  cardenal: "Santa Fe",
  "america de cali": "América de Cali",
  america: "América de Cali",
  escarlata: "América de Cali",
  "junior de barranquilla": "Junior",
  junior: "Junior",
  tiburon: "Junior",
  tiburón: "Junior",
  "deportivo cali": "Deportivo Cali",
  "once caldas": "Once Caldas",
  caldas: "Once Caldas",
  medellin: "Medellín",
  "deportivo independiente medellin": "Medellín",
  "ind medellin": "Medellín",
  dim: "Medellín",
  boca: "Boca Juniors",
  "boca juniors": "Boca Juniors",
  river: "River Plate",
  "river plate": "River Plate",
  flamengo: "Flamengo",
  mengao: "Flamengo",
  palmeiras: "Palmeiras",
  "sao paulo": "São Paulo",
  corinthians: "Corinthians",
  "santos fc": "Santos",
  santos: "Santos",
  "club america": "Club América",
  "chivas": "Chivas",
  "chivas guadalajara": "Chivas",
  "guadalajara": "Chivas",
  "tigres": "Tigres UANL",
  "monterrey": "Monterrey",
  "cruz azul": "Cruz Azul",
  "pumas": "Pumas UNAM",
  "nacional de montevideo": "Nacional",
  "peñarol": "Peñarol",
  penarol: "Peñarol",

  // ── Selecciones nacionales ────────────────────────────────────────────────
  colombia: "Colombia",
  tricolor: "Colombia",
  cafeteros: "Colombia",
  argentina: "Argentina",
  albiceleste: "Argentina",
  brasil: "Brasil",
  brazil: "Brasil",
  canarinha: "Brasil",
  seleção: "Brasil",
  selecao: "Brasil",
  espana: "España",
  españa: "España",
  spain: "España",
  roja: "España",
  furia: "España",
  alemania: "Alemania",
  germany: "Alemania",
  mannschaft: "Alemania",
  francia: "Francia",
  france: "Francia",
  "les bleus": "Francia",
  inglaterra: "Inglaterra",
  england: "Inglaterra",
  "three lions": "Inglaterra",
  italia: "Italia",
  italy: "Italia",
  azzurri: "Italia",
  portugal: "Portugal",
  "selecao das quinas": "Portugal",
  holanda: "Países Bajos",
  "paises bajos": "Países Bajos",
  netherlands: "Países Bajos",
  belgica: "Bélgica",
  belgium: "Bélgica",
  croacia: "Croacia",
  croatia: "Croacia",
  mexico: "México",
  japon: "Japón",
  japan: "Japón",
  corea: "Corea del Sur",
  korea: "Corea del Sur",
  "estados unidos": "Estados Unidos",
  "united states": "Estados Unidos",
  usa: "Estados Unidos",
  eeuu: "Estados Unidos",
  marruecos: "Marruecos",
  morocco: "Marruecos",
  senegal: "Senegal",
  ghana: "Ghana",

  // ── Términos de tipo/categoría ────────────────────────────────────────────
  local: "Local",
  visitante: "Visitante",
  tercera: "Tercera",
  titular: "Local",
  retro: "Retro",
  vintage: "Retro",
  clasica: "Retro",
  clásica: "Retro",
  portero: "Portero",
  goalkeeper: "Portero",
  entrenamiento: "Entrenamiento",
  training: "Entrenamiento",
};

/**
 * Dado el texto de búsqueda del usuario, devuelve los términos a buscar en la BD.
 * Si hay alias, devuelve el nombre canónico + el texto original (para que coincida
 * con nombres parciales también).
 */
export function resolveSearchTerms(query: string): string[] {
  const normalized = normalizeText(query.trim());
  if (!normalized) return [];

  const terms = new Set<string>([query.trim()]);
  const padded = ` ${normalized} `;

  // Alias que aparecen como palabra(s) completa(s) en la búsqueda. Incluye los
  // equipos canónicos de la BD tras la normalización (2026-11-27): "bayern" →
  // "Bayern Múnich", "spain" → "España".
  const matched: [string, string][] = [];
  for (const [alias, canonical] of [
    ...Object.entries(searchAliases),
    ...Object.entries(TEAM_ALIASES).filter(([a]) => a.length >= 4),
  ]) {
    const a = normalizeText(alias);
    if (padded.includes(` ${a} `)) matched.push([a, canonical]);
  }
  // Gana el alias más específico: en "inter milan" no se suma "milan" → AC Milan.
  const specific = matched.filter(
    ([a]) => !matched.some(([b]) => b !== a && b.length > a.length && ` ${b} `.includes(` ${a} `))
  );
  for (const [, canonical] of specific) terms.add(canonical);

  // Los nombres quedaron en español: la frase completa se traduce como UN
  // término ("real madrid home" → "Real Madrid Local"), no como "Local"
  // suelto, que traería todas las camisetas locales del catálogo.
  let phrase = normalized;
  const longestTeam = [...specific].sort((x, y) => y[0].length - x[0].length)[0];
  if (longestTeam) phrase = phrase.replace(longestTeam[0], longestTeam[1]);
  for (const [en, es] of Object.entries(KIT_WORDS_ES)) {
    phrase = phrase.replace(new RegExp(`(^|\\s)${en}(?=\\s|$)`), `$1${es}`);
  }
  if (phrase !== normalized) terms.add(phrase);
  if (KIT_WORDS_ES[normalized]) terms.add(KIT_WORDS_ES[normalized]);

  // Si hay un equipo en la búsqueda junto con otras palabras, el nombre del
  // equipo solo trae todo el club; la frase traducida es la que afina.
  if (longestTeam && phrase.trim() !== longestTeam[1] && Object.keys(KIT_WORDS_ES).some((w) => padded.includes(` ${w} `))) {
    terms.delete(longestTeam[1]);
  }

  return Array.from(terms);
}

/** Inglés del proveedor → español de los nombres normalizados. */
const KIT_WORDS_ES: Record<string, string> = {
  home: "Local",
  away: "Visitante",
  third: "Tercera",
  goalkeeper: "Portero",
  training: "Entrenamiento",
  player: "Versión Jugador",
  kids: "Niño",
  women: "Mujer",
  womens: "Mujer",
  jacket: "Chaqueta",
  windbreaker: "Chaqueta",
};
