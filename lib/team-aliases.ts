/**
 * Equipos canónicos del catálogo (normalización 2026-11-27).
 * Fuente única para la búsqueda de la tienda (lib/search.ts) y los scripts
 * de normalización (scripts/catalog-rules.ts).
 */

/** Minúsculas y sin tildes — misma normalización que usan las claves. */
export const stripAccents = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

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
  espana: "España", "south africa": "Sudáfrica",
  "san lorenzo": "San Lorenzo", "racing club": "Racing Club", "vasco da gama": "Vasco da Gama",
  // Clubes distintos que comparten la primera palabra con otro alias (revisión 2026-11-27):
  // sin esto, "Atletico Mineiro" terminaba como Atlético de Madrid y "Miami FC" como Inter Miami.
  "atletico mineiro": "Atlético Mineiro", "atletico nacional": "Atlético Nacional",
  "athletico paranaense": "Athletico Paranaense", "miami fc": "Miami FC",
  // Grafías de proveedores (importación todojerseys, 2026-11-28): abreviaturas,
  // nombres con guiones intercalados y errores de tipeo.
  "b-a": "FC Barcelona", "f-cb": "FC Barcelona", fcb: "FC Barcelona", "b pedri": "FC Barcelona",
  rm: "Real Madrid", madrid: "Real Madrid", "at madrid": "Atlético de Madrid", atmadrid: "Atlético de Madrid",
  "man u": "Manchester United", munited: "Manchester United", "m city": "Manchester City", city: "Manchester City",
  "be-tis": "Real Betis", "ben-fica": "Benfica", benfca: "Benfica", benfica: "Benfica",
  "por-to": "Porto", poto: "Porto", porto: "Porto", athbil: "Athletic Club", rome: "AS Roma",
  munchen: "Bayern Múnich", koln: "FC Colonia", koeln: "FC Colonia", frankfurt: "Eintracht Frankfurt",
  leipzig: "RB Leipzig", "rb leipzig": "RB Leipzig", bremen: "Werder Bremen", hamburg: "Hamburgo",
  hamburger: "Hamburgo", nurnberg: "Núremberg", nuremberg: "Núremberg", hertha: "Hertha BSC", s04: "Schalke 04",
  beisketas: "Beşiktaş", besketas: "Beşiktaş", besiktas: "Beşiktaş", lisbon: "Sporting CP",
  "lisbon sporting": "Sporting CP", vla: "Aston Villa", "da gama": "Vasco da Gama", mineiro: "Atlético Mineiro",
  "cf american": "Club América", american: "Club América", "ca america": "Club América",
  "c america": "Club América", "club america": "Club América", leon: "Club León", atlanta: "Atlanta United",
  "miami messi": "Inter Miami", messi: "Argentina", uninese: "Udinese", udinese: "Udinese",
  sociedad: "Real Sociedad", vallecano: "Rayo Vallecano", "rayo vallecano": "Rayo Vallecano",
  ranger: "Rangers", rangers: "Rangers", "al-nassr": "Al Nassr", "al nassr": "Al Nassr",
  kadiz: "Cádiz", cadiz: "Cádiz", gijon: "Sporting de Gijón", gijpon: "Sporting de Gijón",
  "sporting de gijon": "Sporting de Gijón", valladollid: "Real Valladolid", valladolid: "Real Valladolid",
  burnly: "Burnley", burnley: "Burnley", alavs: "Alavés", alves: "Alavés", alaves: "Alavés",
  queretato: "Querétaro", queretaro: "Querétaro", monterey: "Monterrey", wolve: "Wolves", wolves: "Wolves",
  marseilles: "Olympique de Marsella", lyonnais: "Olympique de Lyon",
  lyon: "Olympique de Lyon", asse: "Saint-Étienne", "saint-etienne": "Saint-Étienne",
  "stade bretois": "Stade Brestois", "stade rennes": "Rennes", leeds: "Leeds United",
  "leeds united": "Leeds United", leicester: "Leicester City", "leicester city": "Leicester City",
  stoke: "Stoke City", "stoke city": "Stoke City", hull: "Hull City", "hull city": "Hull City",
  "universidad chile": "Universidad de Chile", venice: "Venezia", venezia: "Venezia",
};
