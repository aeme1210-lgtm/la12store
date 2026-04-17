/**
 * search.ts
 * Utilidades de búsqueda: normalización, aliases y expansión de términos.
 * Usado por el catálogo (server) y el Navbar (client).
 */

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

  for (const [alias, canonical] of Object.entries(searchAliases)) {
    if (normalizeText(alias) === normalized || normalized.includes(normalizeText(alias))) {
      terms.add(canonical);
    }
  }

  return Array.from(terms);
}
