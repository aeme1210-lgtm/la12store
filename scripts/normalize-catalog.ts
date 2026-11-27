/**
 * Normalización del catálogo — PROPUESTA en modo SOLO LECTURA.
 *
 * Auditoría 2026-11-26: 1.329 "equipos" distintos para 2.588 productos,
 * `isNew` en 1.398 filas, tallas y "Mens" dentro de los nombres, 31 valores
 * de `type` mezclando inglés/español/colores, manga larga sin marcar.
 *
 * Este script NO escribe, NO actualiza y NO borra nada en la base de datos:
 * solo lee `Product` y genera, para revisión humana:
 *   - backups/normalizacion/propuesta-<fecha>.csv  (una fila por producto)
 *   - backups/normalizacion/resumen-<fecha>.md     (conteos + equipos sin resolver)
 *
 * Cuando el dueño apruebe la propuesta (y se corrija lo que haga falta en
 * los mapas de abajo), un segundo script aplicará los cambios con backup
 * previo — igual que scripts/dedupe-products.ts.
 *
 * Uso:
 *   npx tsx scripts/normalize-catalog.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { mkdirSync, writeFileSync } from "fs";

// ── Diccionarios ────────────────────────────────────────────────────────────

/** Clave normalizada (minúsculas, sin tildes) → nombre canónico en español. */
const TEAM_ALIASES: Record<string, string> = {
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
};

/** Palabras de ruido que el proveedor mete en `team`. */
const NOISE = [
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
const SUPPLIER_JUNK = /\b(cheap|wholesale|yupoo|replica|aaa|thai)\b/i;

// ── Utilidades ──────────────────────────────────────────────────────────────

const strip = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const titleCase = (s: string) =>
  s.replace(/\S+/g, (w) => (w.length <= 3 && /^[a-z]+$/.test(w) && w !== "fc" ? w : w[0].toUpperCase() + w.slice(1)));

function cleanTeamKey(team: string): string {
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
function canonicalTeam(team: string, name: string): { team: string; resolved: boolean } {
  let key = cleanTeamKey(team);
  if (!key) key = cleanTeamKey(name);
  if (!key) return { team: team.trim(), resolved: false };
  if (TEAM_ALIASES[key]) return { team: TEAM_ALIASES[key], resolved: true };
  // Intento por prefijo: "real madrid hom" → "real madrid"
  const words = key.split(" ");
  for (let n = words.length - 1; n >= 1; n--) {
    const prefix = words.slice(0, n).join(" ");
    if (TEAM_ALIASES[prefix]) return { team: TEAM_ALIASES[prefix], resolved: true };
  }
  const looksClean = /^[\p{L} .'-]+$/u.test(key) && words.length <= 4;
  return { team: titleCase(key), resolved: looksClean };
}

function garmentKind(name: string): string {
  const n = strip(name);
  if (/windbreaker|jacket|chaqueta|rompevientos/.test(n)) return "Chaqueta";
  if (/training suit|tracksuit|sudadera/.test(n)) return "Conjunto de entrenamiento";
  if (/\bpolo\b/.test(n)) return "Polo";
  if (/\bvest\b|\bchaleco\b/.test(n)) return "Esqueleto";
  if (/\bshorts?\b/.test(n)) return "Pantaloneta";
  if (/kids? kit|\bkit\b/.test(n) && /kid|nin/.test(n)) return "Conjunto niño";
  return "Camiseta";
}

function audience(name: string): string {
  const n = strip(name);
  if (/\b(baby|infant|bebe)\b/.test(n)) return "Bebé";
  if (/\bkids?\b|\bnin[oa]s?\b|size 1\d/.test(n)) return "Niño";
  if (/\bwom[ae]n'?s?\b|\bmujer\b|\blady\b|\bfemale\b/.test(n)) return "Mujer";
  return "Adulto";
}

function sleeve(name: string, isLongSleeve: boolean): string {
  return isLongSleeve || /\bls\b|long sleeve|manga larga/i.test(name) ? "Larga" : "Corta";
}

function shirtType(name: string, type: string): string {
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

function season(name: string, raw: string | null): string {
  const src = `${raw ?? ""} ${name}`;
  const pair = src.match(/\b(\d{2,4})[/_-](\d{2})\b/);
  if (pair) {
    const a = pair[1].length === 2 ? (Number(pair[1]) > 50 ? `19${pair[1]}` : `20${pair[1]}`) : pair[1];
    return `${a}/${pair[2]}`;
  }
  const year = src.match(/\b(19|20)\d{2}\b/);
  return year ? year[0] : "";
}

function version(p: { name: string; type: string; isRetro: boolean }): string {
  if (p.isRetro) return "Retro";
  if (/\bplayer\b|versi[oó]n jugador/i.test(`${p.name} ${p.type}`)) return "Jugador";
  return "Fan";
}

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    // Única operación contra la BD: lectura.
    const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

    const rows: string[][] = [];
    const unresolved = new Map<string, number>();
    const canonicalSet = new Set<string>();
    const counts = {
      total: products.length,
      isNewActual: 0,
      isNewPropuesto: 0,
      mangaLargaSinMarcar: 0,
      alertasPrecio: 0,
      noCamiseta: 0,
      nombresConTallas: 0,
    };
    const byKind = new Map<string, number>();
    const byAudience = new Map<string, number>();

    for (const p of products) {
      const t = canonicalTeam(p.team, p.name);
      canonicalSet.add(t.team);
      if (!t.resolved) unresolved.set(t.team, (unresolved.get(t.team) ?? 0) + 1);

      const kind = garmentKind(p.name);
      const aud = audience(p.name);
      const man = sleeve(p.name, p.isLongSleeve);
      const tipo = shirtType(p.name, p.type);
      const temp = season(p.name, p.season);
      const ver = version(p);

      const sufijos = [
        kind !== "Camiseta" ? null : null,
        ver === "Retro" ? "Retro" : ver === "Jugador" ? "Versión Jugador" : null,
        man === "Larga" ? "Manga Larga" : null,
        aud !== "Adulto" ? aud : null,
      ].filter(Boolean);
      const base = kind === "Camiseta" ? `${t.team} ${tipo}` : `${kind} ${t.team}`;
      const nombrePropuesto = [base, temp, ...sufijos].filter(Boolean).join(" ").replace(/\s+/g, " ");

      const isNewPropuesto = /2026\/27|2026$/.test(temp) && aud === "Adulto" && kind === "Camiseta";
      const isLongSleevePropuesto = man === "Larga";

      const alertas: string[] = [];
      if (ver === "Jugador" && (p.priceFan ?? 150000) < 180000)
        alertas.push("Jugador con precio Fan < $180.000 (ya mitigado en código)");
      if (isLongSleevePropuesto && !p.isLongSleeve) alertas.push("Manga larga sin isLongSleeve");
      if (isLongSleevePropuesto && (p.priceLongSleeve ?? p.priceFan ?? 0) < 185000 && (p.priceRetro ?? 0) < 185000)
        alertas.push("Manga larga con precio < $185.000");
      if (p.isRetro && p.priceRetro == null) alertas.push("Retro sin priceRetro (usa default $170.000)");
      const startYear = Number((temp.match(/^\d{4}/) ?? ["0"])[0]);
      if (p.isRetro && startYear >= 2023)
        alertas.push(`Marcado retro pero es temporada reciente (${temp}) → se cobra $170.000`);
      if (SUPPLIER_JUNK.test(p.name)) alertas.push("Nombre con texto de mayorista visible al cliente");

      if (p.isNew) counts.isNewActual++;
      if (isNewPropuesto) counts.isNewPropuesto++;
      if (isLongSleevePropuesto && !p.isLongSleeve) counts.mangaLargaSinMarcar++;
      if (alertas.length) counts.alertasPrecio++;
      if (kind !== "Camiseta") counts.noCamiseta++;
      if (/S-\w*XL|Size/i.test(p.name)) counts.nombresConTallas++;
      byKind.set(kind, (byKind.get(kind) ?? 0) + 1);
      byAudience.set(aud, (byAudience.get(aud) ?? 0) + 1);

      rows.push([
        p.id, p.slug, p.name, nombrePropuesto, p.team, t.team, t.resolved ? "sí" : "REVISAR",
        p.league, kind, aud, ver, man, temp, tipo,
        String(p.isNew), String(isNewPropuesto), String(p.isLongSleeve), String(isLongSleevePropuesto),
        alertas.join(" | "),
      ]);
    }

    const header = [
      "id", "slug", "nombre_actual", "nombre_propuesto", "equipo_actual", "equipo_propuesto",
      "equipo_resuelto", "liga", "prenda", "publico", "version", "manga", "temporada",
      "tipo_camiseta", "isNew_actual", "isNew_propuesto", "isLongSleeve_actual",
      "isLongSleeve_propuesto", "alertas",
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    const dir = "backups/normalizacion";
    mkdirSync(dir, { recursive: true });
    // BOM para que Excel abra bien las tildes.
    const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    writeFileSync(`${dir}/propuesta-${stamp}.csv`, csv, "utf8");

    const topUnresolved = [...unresolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60);
    const fmtMap = (m: Map<string, number>) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join("\n");

    const md = `# Propuesta de normalización del catálogo — ${stamp}

> Generado por \`scripts/normalize-catalog.ts\`. **Solo lectura: la base de datos no fue modificada.**
> Detalle por producto en \`propuesta-${stamp}.csv\` (ábrelo con Excel o Google Sheets).

## Resumen

| Métrica | Actual | Propuesto |
|---|---|---|
| Productos | ${counts.total} | ${counts.total} |
| Equipos distintos | ${new Set(products.map((p) => p.team)).size} | ${canonicalSet.size} |
| Marcados "nuevo" (isNew) | ${counts.isNewActual} | ${counts.isNewPropuesto} (solo camisetas adulto 2026 y 26/27) |
| Manga larga sin marcar | ${counts.mangaLargaSinMarcar} | 0 |
| Productos con alguna alerta (precio, retro, texto de mayorista) | ${counts.alertasPrecio} | — |
| Prendas que no son camiseta | ${counts.noCamiseta} | separadas por tipo |
| Nombres con tallas dentro | ${counts.nombresConTallas} | 0 |

## Por tipo de prenda

| Prenda | Productos |
|---|---|
${fmtMap(byKind)}

## Por público

| Público | Productos |
|---|---|
${fmtMap(byAudience)}

## Equipos que el script no pudo resolver (top 60)

Estos nombres quedaron "limpios" pero sin equivalencia canónica. Agrega los
correctos a \`TEAM_ALIASES\` en el script y vuelve a correrlo.

| Equipo limpio | Productos |
|---|---|
${topUnresolved.map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

**Equipos sin resolver en total:** ${unresolved.size} (${[...unresolved.values()].reduce((a, b) => a + b, 0)} productos)
`;
    writeFileSync(`${dir}/resumen-${stamp}.md`, md, "utf8");

    console.log(`✓ ${products.length} productos analizados (sin escribir en la BD).`);
    console.log(`  Equipos: ${new Set(products.map((p) => p.team)).size} → ${canonicalSet.size}`);
    console.log(`  Sin resolver: ${unresolved.size}`);
    console.log(`  isNew: ${counts.isNewActual} → ${counts.isNewPropuesto}`);
    console.log(`  Archivos: ${dir}/propuesta-${stamp}.csv, ${dir}/resumen-${stamp}.md`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
