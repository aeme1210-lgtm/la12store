/**
 * import-products.ts
 * Lee public/products/, parsea cada subcarpeta como producto y lo registra en PostgreSQL.
 * Uso: npx tsx prisma/import-products.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Config ──────────────────────────────────────────────────────────────────
// Ruta absoluta a la carpeta de fotos (un nivel arriba de la12store)
const PHOTOS_ROOT = path.resolve(__dirname, "../../public/products");

// URL base pública de las imágenes (ruta que servirá Next.js)
// Las fotos deben estar en la12store/public/products/ o servirse desde ahí
const IMAGES_URL_BASE = "/products";

// Categorías que NO son camisetas de fútbol → ignorar
const SKIP_CATEGORIES = new Set(["catalog", "779986"]);

// ─── Prisma ───────────────────────────────────────────────────────────────────
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Helpers de parseo ────────────────────────────────────────────────────────

/** Convierte "25_26" o "25/26" a "25/26", preservando ceros: "00_01" → "00/01" */
function normalizeSeason(raw: string): string {
  // Reemplazar _ por / y quitar solo ceros EXTRA al inicio si hay 3 dígitos ("003" → "03")
  return raw.replace("_", "/").replace(/^0(\d{2})\//, "$1/"); // "003/04" → "03/04"
}

const TYPE_KEYWORDS: string[] = [
  "Third Away",
  "Third Home",
  "Special Edition",
  "Goalkeeper Yellow",
  "Goalkeeper White",
  "Goalkeeper Green",
  "Goalkeeper Blue",
  "Goalkeeper Red",
  "Goalkeeper Orange",
  "Goalkeeper",
  "Third",
  "Away",
  "Home",
  "Yellow",
  "White",
  "Red",
  "Black",
  "Blue",
  "Green",
  "Pink",
  "Purple",
  "Orange",
  "Gold",
  "Grey",
  "Navy",
];

interface ParsedFolder {
  season: string;
  team: string;
  type: string;
  isRetro: boolean;
}

function parseFolderName(folderName: string): ParsedFolder {
  let text = folderName.trim();

  // 1. Extraer temporada al inicio: "25_26 ...", "00_01 ...", "003_04 ...", "90_92 ..."
  const seasonMatch = text.match(/^(\d{2,3}[_/]\d{2})\s+/);
  let season = "";
  if (seasonMatch) {
    season = normalizeSeason(seasonMatch[1]);
    text = text.slice(seasonMatch[0].length).trim();
  }

  // 2. Detectar y remover "Retro"
  const isRetro = /\bretro\b/i.test(text);
  text = text.replace(/\bretro\b/gi, "").replace(/\s{2,}/g, " ").trim();

  // 3. Remover "long sleeve" (es un modificador, no parte del nombre/tipo principal)
  text = text.replace(/\blong\s+sleeve\b/gi, "").replace(/\s{2,}/g, " ").trim();

  // 4. Detectar tipo buscando keywords al final del string (case-insensitive)
  let detectedType = "";
  let teamText = text;

  // Ordenar por longitud desc para que "Third Away" matchee antes que "Away"
  for (const keyword of TYPE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(" ", "\\s+")}\\b\\s*$`, "i");
    if (regex.test(text)) {
      detectedType = keyword;
      teamText = text.replace(regex, "").replace(/\s{2,}/g, " ").trim();
      break;
    }
  }

  // 5. Limpiar el nombre del equipo
  const team = teamText
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^[-_\s]+|[-_\s]+$/g, "");

  return {
    season,
    team: team || folderName, // fallback: usar nombre completo
    type: detectedType || "Home", // fallback: Home
    isRetro,
  };
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function makeUniqueSlug(base: string, existing: Set<string>): string {
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

// ─── Mapeo de carpetas de categoría → nombre legible ─────────────────────────
const LEAGUE_NAME_MAP: Record<string, string> = {
  "La Liga": "La Liga",
  "Retro": "Retro",
  "New Season": "New Season",
  "Premier League": "Premier League",
  "Serie A": "Serie A",
  "Ligue 1": "Ligue 1",
  "Bundesliga": "Bundesliga",
  "shorts": "Shorts",
  "player version": "Player Version",
  "Primeira Liga": "Primeira Liga",
  "National Team": "Selecciones",
  "Brasileiro Série A": "Brasileiro Série A",
  "Liga MX": "Liga MX",
  "MLS": "MLS",
  "Windbreaker": "Windbreaker",
  "Other   Clubs": "Other Clubs",
  "kids kit": "Kids Kit",
  "Baby jersey size:9-12": "Baby Jersey",
  "Chilean League": "Chilean League",
  "Pant": "Pant",
  "Women's jersey": "Women's Jersey",
  "Casual T-shirt": "Casual T-shirt",
  "F1": "F1",
  "NBA": "NBA",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("  IMPORTADOR DE PRODUCTOS - public/products → PostgreSQL");
  console.log("=".repeat(60));
  console.log(`  Leyendo carpetas desde: ${PHOTOS_ROOT}\n`);

  if (!fs.existsSync(PHOTOS_ROOT)) {
    console.error(`  ERROR: No existe la carpeta ${PHOTOS_ROOT}`);
    process.exit(1);
  }

  // Cargar slugs existentes para evitar duplicados
  const existingProducts = await prisma.product.findMany({ select: { slug: true } });
  const usedSlugs = new Set(existingProducts.map((p) => p.slug));
  console.log(`  Productos ya en BD: ${existingProducts.length}`);

  const categories = fs
    .readdirSync(PHOTOS_ROOT)
    .filter((name) => {
      const fullPath = path.join(PHOTOS_ROOT, name);
      return fs.statSync(fullPath).isDirectory() && !SKIP_CATEGORIES.has(name);
    })
    .sort();

  console.log(`  Categorías encontradas: ${categories.join(", ")}\n`);

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const categoryFolder of categories) {
    const categoryPath = path.join(PHOTOS_ROOT, categoryFolder);
    const league = LEAGUE_NAME_MAP[categoryFolder] ?? categoryFolder;

    const productFolders = fs
      .readdirSync(categoryPath)
      .filter((name) => fs.statSync(path.join(categoryPath, name)).isDirectory())
      .sort();

    console.log(`\n[ ${league} ] — ${productFolders.length} álbumes`);

    for (const productFolder of productFolders) {
      const productPath = path.join(categoryPath, productFolder);

      // Fotos .jpg/.png/.webp en la subcarpeta
      const photoFiles = fs
        .readdirSync(productPath)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort();

      if (photoFiles.length === 0) {
        console.log(`  [SKIP] ${productFolder} — sin fotos`);
        totalSkipped++;
        continue;
      }

      // Rutas públicas de las imágenes
      const images = photoFiles.map(
        (f) => `${IMAGES_URL_BASE}/${categoryFolder}/${productFolder}/${f}`
      );

      // Parsear nombre del producto
      const parsed = parseFolderName(productFolder);
      const isRetro = parsed.isRetro || categoryFolder === "Retro";

      // Nombre completo del producto
      const name = [
        parsed.season,
        parsed.team,
        parsed.type,
        isRetro ? "Retro" : "",
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s{2,}/g, " ")
        .trim();

      // Slug único
      const slugBase = toSlug(name);
      const slug = makeUniqueSlug(slugBase, usedSlugs);

      // Precios según tipo
      const prices = isRetro
        ? { priceRetro: 170000, priceFan: null, pricePlayer: null }
        : { priceRetro: null, priceFan: 150000, pricePlayer: 180000 };

      try {
        await prisma.product.upsert({
          where: { slug },
          update: {
            images: JSON.stringify(images),
            // Actualizar datos si el producto ya existe
            name,
            team: parsed.team,
            league,
            season: parsed.season || null,
            type: parsed.type,
            isRetro,
            ...prices,
          },
          create: {
            name,
            slug,
            team: parsed.team,
            league,
            season: parsed.season || null,
            type: parsed.type,
            isRetro,
            images: JSON.stringify(images),
            hasPlayer: !isRetro,
            isNew: !isRetro,
            isActive: true,
            stock: 99,
            ...prices,
          },
        });

        console.log(`  ✓ ${name} (${photoFiles.length} fotos) [${slug}]`);
        totalCreated++;
      } catch (err) {
        console.error(`  ✗ ERROR en "${productFolder}":`, err);
        totalErrors++;
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`  RESUMEN:`);
  console.log(`  Productos creados/actualizados: ${totalCreated}`);
  console.log(`  Omitidos (sin fotos):           ${totalSkipped}`);
  console.log(`  Errores:                        ${totalErrors}`);
  console.log("=".repeat(60));
}

main()
  .catch((err) => {
    console.error("Error fatal:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
