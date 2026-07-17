import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { writeFileSync } from "fs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const LEAGUE = "Temporada 26/27";
const SEASON = "2026/27";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// 46 álbumes reales extraídos de la página 1 de
// https://maiyuyan.x.yupoo.com/search/album?uid=1&sort=&q=26%2F27&page=1
// (recorrida con navegador real — el listado se renderiza vía JS, no vía
// server-render, ver docs/DECISIONS_V2.md). Página 1 completa (46/46).
// El buscador reporta 13 páginas totales para "26/27" — páginas 2+ quedan
// para una sesión futura, ver docs/IMPORT_2627_REPORT.md.
const ALBUMS: { id: string; title: string }[] = [
  { id: "229000092", title: "Haiti 26_27 Home Jersey S-4XL" },
  { id: "231225128", title: "Albania 26_27 Home Jersey S-4XL" },
  { id: "234548264", title: "Brazil 26_27 Special Edition Jersey S-XXL" },
  { id: "231012582", title: "Uruguay 26_27 Special Edition Jersey S-XXL" },
  { id: "232144687", title: "Benfica 26_27 Fourth away game" },
  { id: "232807658", title: "University of Chile 26_27 Sweatshirt S-2XL" },
  { id: "236415777", title: "Gremio 26_27 Away Jersey S-4XL" },
  { id: "236405698", title: "Bahia 26_27 Home Jersey S-4XL" },
  { id: "236404760", title: "Arsenal 26_27 Away Jersey S-4XL" },
  { id: "230697507", title: "Halloween 26_27 Special Edition S-4XL" },
  { id: "230698094", title: "Internacional 26_27 Home Jersey S-4XL" },
  { id: "231949717", title: "Olimpia 26_27 Away Jersey S-4XL" },
  { id: "234767731", title: "Curacao 26_27 S-4XL" },
  { id: "234771161", title: "Fluminense 26_27 Training Blue S-4XL" },
  { id: "239197732", title: "Barcelona 26_27 Home Jersey S-4XL" },
  { id: "236409172", title: "Corinthians 26_27 Home Jersey S-4XL" },
  { id: "228996573", title: "Flamengo 26_27 Training Apricot S-4XL" },
  { id: "228999281", title: "Corinthians 26_27 Training Maroon S-4XL" },
  { id: "228998804", title: "Spain 26_27 Training Navy Blue Jersey S-XXL" },
  { id: "231225384", title: "Arsenal 26_27 Special Edition Green Jersey S-4XL" },
  { id: "231225908", title: "Atletico Nacional 26_27 Home Jersey S-4XL" },
  { id: "232142764", title: "Santander 26_27 Goalkeeper S-4XL" },
  { id: "234551619", title: "Chivas de Guadalajara 26_27 Special Edition Jersey White S-4XL" },
  { id: "234551820", title: "Chivas de Guadalajara 26_27 Third Long Sleeve Jersey S-4XL" },
  { id: "234918481", title: "Leeds United 26_27 Special Edition Jersey S-XXL" },
  { id: "234918768", title: "Mexico 26_27 Baby Home Jersey size 9_12" },
  { id: "234923420", title: "Sunderland 26_27 Special Edition Jersey S-XXL" },
  { id: "234922031", title: "Santos 26_27 Training Vest Beige S-4XL" },
  { id: "232145665", title: "Brazil 26_27 Home Jersey S-XXL" },
  { id: "234770800", title: "Everton 26_27 Special Edition Jersey S-XXL" },
  { id: "234918180", title: "Internacional 26_27 Home Jersey SIZE 16-28" },
  { id: "239460470", title: "Nacional 26_27 Goalkeeper Navy Blue Jersey S-XXL" },
  { id: "239197851", title: "Bayern Munich 26_27 Away Jersey S-4XL" },
  { id: "239202519", title: "Corinthians 26_27 Home Player Version Jersey S-4XL" },
  { id: "239202630", title: "Corinthians 26_27 Home Jersey S-XXL" },
  { id: "239205871", title: "Flamengo 26_27 Away Jersey S-XXL" },
  { id: "239205775", title: "Flamengo 26_27 Away Player Version Jersey S-4XL" },
  { id: "239614219", title: "Sao Paulo 26_27 Goalkeeper Jersey S-4XL" },
  { id: "239609714", title: "Real Madrid 26_27 Home Jersey S-4XL" },
  { id: "239616923", title: "St. Pauli 26_27 Special Edition Jersey S-4XL" },
  { id: "239455472", title: "Inter Miami 26_27 Special Edition Player Version Jersey S-2XL" },
  { id: "239455289", title: "Inter Miami 26_27 Away Player Version Jersey S-4XL" },
  { id: "232798134", title: "Colo Colo 26_27 Goalkeeper Jersey Yellow S-3XL" },
  { id: "232799125", title: "Flamengo 26_27 Pre-match Jersey S-4XL" },
  { id: "232805779", title: "Real Betis 26_27 Special Edition Jersey S-XXL" },
];

const TYPE_KEYWORDS = [
  "Special Edition", "Player Version", "Pre-match", "Third Away", "Third",
  "Goalkeeper", "Training", "Home", "Away",
];

function parseTitle(title: string) {
  let text = title.replace(/\s*S-?\d?XL.*$/i, "").replace(/\s*SIZE.*$/i, "").trim();
  const isLongSleeve = /long[\s-]?sleeve/i.test(text);
  text = text.replace(/\blong[\s-]?sleeve\b/gi, "").replace(/\s{2,}/g, " ").trim();
  text = text.replace(/26[_/]27/i, "").replace(/\s{2,}/g, " ").trim();

  let detectedType = "";
  let teamText = text;
  for (const kw of TYPE_KEYWORDS) {
    const re = new RegExp(`\\b${kw.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (re.test(text)) {
      detectedType = kw;
      teamText = text.replace(re, "").replace(/\s{2,}/g, " ").trim();
      break;
    }
  }
  const team = teamText.replace(/^[-_\s]+|[-_\s]+$/g, "") || text;
  return { team, type: detectedType || "Home", isLongSleeve };
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

interface Result {
  album: string;
  title: string;
  status: "created" | "skipped_duplicate" | "error_no_photos" | "error_fetch";
  detail?: string;
}

async function fetchAlbumPhotos(albumId: string): Promise<string[]> {
  const res = await fetch(`https://maiyuyan.x.yupoo.com/albums/${albumId}?uid=1`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  // Yupoo sirve .jpg o .jpeg segun el album (formato original de subida) —
  // hay que aceptar ambos. Prioriza "big"; si no hay, cualquier imagen que
  // no sea small/medium/icon.
  const bigMatches = [...html.matchAll(/https:\/\/photo\.yupoo\.com\/[a-z0-9]+\/[a-f0-9]+\/big\.jpe?g/g)];
  const urls = [...new Set(bigMatches.map((m) => m[0]))];
  if (urls.length > 0) return urls.slice(0, 6);
  const fallback = [...html.matchAll(/https:\/\/photo\.yupoo\.com\/[a-z0-9/]+\.jpe?g/g)]
    .map((m) => m[0])
    .filter((u) => !u.includes("small.jp") && !u.includes("icons/"));
  return [...new Set(fallback)].slice(0, 6);
}

async function main() {
  const results: Result[] = [];
  let created = 0;

  for (const album of ALBUMS) {
    try {
      await new Promise((r) => setTimeout(r, 400)); // evita rate-limit del proveedor
      const photos = await fetchAlbumPhotos(album.id);
      if (photos.length === 0) {
        results.push({ album: album.id, title: album.title, status: "error_no_photos" });
        continue;
      }

      const { team, type, isLongSleeve } = parseTitle(album.title);

      // Dedupe dentro de esta coleccion (equipo + tipo + liga + manga larga).
      const existing = await prisma.product.findFirst({
        where: { league: LEAGUE, team: { equals: team, mode: "insensitive" }, type, isLongSleeve },
      });
      if (existing) {
        results.push({ album: album.id, title: album.title, status: "skipped_duplicate", detail: existing.slug });
        continue;
      }

      const name = `${team} ${type}${isLongSleeve ? " Manga Larga" : ""} 26/27`.replace(/\s{2,}/g, " ").trim();
      let slug = toSlug(name);
      let i = 2;
      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${toSlug(name)}-${i}`;
        i++;
      }

      await prisma.product.create({
        data: {
          name,
          slug,
          team,
          league: LEAGUE,
          season: SEASON,
          type,
          isRetro: false,
          isLongSleeve,
          images: JSON.stringify(photos),
          hasPlayer: true,
          isNew: true,
          isActive: true,
          stock: 99,
          priceFan: isLongSleeve ? null : 150000,
          pricePlayer: isLongSleeve ? null : 180000,
          priceRetro: null,
          priceLongSleeve: isLongSleeve ? 185000 : null,
          isFeatured: false,
          isTrending: false,
        },
      });
      created++;
      results.push({ album: album.id, title: album.title, status: "created", detail: slug });
    } catch (e) {
      results.push({ album: album.id, title: album.title, status: "error_fetch", detail: (e as Error).message });
    }
  }

  const errorCount = results.filter((r) => r.status.startsWith("error")).length;
  const errorRate = errorCount / ALBUMS.length;

  writeFileSync(
    "backups/import-2627-result.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), total: ALBUMS.length, created, errorRate, results }, null, 2)
  );

  console.log(`CREATED ${created}/${ALBUMS.length}`);
  console.log(`ERROR_RATE ${(errorRate * 100).toFixed(1)}%`);
  console.log(JSON.stringify(results.filter((r) => r.status !== "created"), null, 2));

  if (errorRate > 0.3) {
    console.error("ABORTADO: tasa de error > 30%, revisar backups/import-2627-result.json");
  }

  await pool.end();
}

main().catch(async (e) => {
  console.error("FATAL", e);
  await pool.end();
  process.exit(1);
});
