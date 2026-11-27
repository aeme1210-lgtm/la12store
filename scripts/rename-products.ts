/**
 * Fase 2 de la normalización: nombres en español, URLs limpias y manga larga
 * con guion ("Long-Sleeve") — con respaldo y reversión.
 *
 * Orden obligatorio (para que ninguna URL vieja dé 404):
 *   1. `--plan`     Calcula nombres y URLs nuevas SIN escribir en la BD y genera
 *                   lib/slug-redirects.json (URL vieja → nueva). Ese archivo se
 *                   publica en producción ANTES del paso 2: mientras la BD no
 *                   cambia, las URLs viejas siguen existiendo y el mapa no hace nada.
 *   2. `--execute`  Lee lib/slug-redirects.json (fuente de verdad de las URLs),
 *                   guarda backups/normalizacion/fase2-backup-<fecha>.json con
 *                   name/slug/isLongSleeve actuales, lo verifica y aplica todo
 *                   en UNA transacción.
 *   3. `--restore <archivo>` devuelve name/slug/isLongSleeve a lo respaldado.
 *
 * Qué cambia: `name` de todos los productos cuyo nombre propuesto difiere,
 * `slug` solo de las URLs "malas" (texto de mayorista, tallas, "mens"…; ver
 * isBadSlug) e `isLongSleeve` false→true. No toca precios, imágenes, pedidos,
 * ni borra nada.
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { isBadSlug, proposeNames, proposeProduct, slugify } from "./catalog-rules";
import { getStartingPrice } from "../lib/pricing";

const MODE = process.argv.includes("--execute")
  ? "execute"
  : process.argv.includes("--restore")
    ? "restore"
    : "plan";
const REDIRECTS_FILE = "lib/slug-redirects.json";
const DIR = "backups/normalizacion";

interface Row {
  id: string;
  name: string;
  slug: string;
  isLongSleeve: boolean;
}

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

type ProductRow = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

/** Calcula el estado final de cada producto. `slugMap` fija las URLs (paso 2). */
function computeTargets(products: ProductRow[], slugMap?: Record<string, string>) {
  const { names, possibleDuplicates } = proposeNames(products);
  const taken = new Set(products.filter((p) => !isBadSlug(p.slug)).map((p) => p.slug));
  const redirects: Record<string, string> = {};
  const targets: { before: Row; after: Row; priceBefore: number; priceAfter: number }[] = [];

  for (const p of products) {
    const name = names.get(p.id) ?? p.name;
    let slug = p.slug;
    if (isBadSlug(p.slug)) {
      if (slugMap) {
        slug = slugMap[p.slug] ?? p.slug;
      } else {
        const base = slugify(name) || p.slug;
        slug = base;
        for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
        taken.add(slug);
      }
      if (slug !== p.slug) redirects[p.slug] = slug;
    }
    const isLongSleeve = p.isLongSleeve || proposeProduct(p).isLongSleeve;
    const before: Row = { id: p.id, name: p.name, slug: p.slug, isLongSleeve: p.isLongSleeve };
    const after: Row = { id: p.id, name, slug, isLongSleeve };
    if (before.name === after.name && before.slug === after.slug && before.isLongSleeve === after.isLongSleeve)
      continue;
    targets.push({
      before,
      after,
      priceBefore: getStartingPrice(p),
      priceAfter: getStartingPrice({ ...p, name, isLongSleeve }),
    });
  }
  return { targets, redirects, possibleDuplicates };
}

/** UPDATE masivo en lotes de 400, todo dentro de una transacción. */
async function writeRows(rows: Row[], label: string) {
  const chunks: Row[][] = [];
  for (let i = 0; i < rows.length; i += 400) chunks.push(rows.slice(i, i + 400));
  await prisma.$transaction(
    chunks.map((chunk) => {
      const values = Prisma.join(
        chunk.map((r) => Prisma.sql`(${r.id}, ${r.name}, ${r.slug}, ${r.isLongSleeve})`)
      );
      return prisma.$executeRaw`
        UPDATE "Product" AS p
        SET name = v.name, slug = v.slug, "isLongSleeve" = v.ls, "updatedAt" = now()
        FROM (VALUES ${values}) AS v(id, name, slug, ls)
        WHERE p.id = v.id`;
    }),
    { timeout: 300_000 } as never
  );
  console.log(`✓ ${label}: ${rows.length} productos actualizados en una sola transacción.`);
}

async function main() {
  mkdirSync(DIR, { recursive: true });

  if (MODE === "restore") {
    const file = process.argv[process.argv.indexOf("--restore") + 1];
    const backup = JSON.parse(readFileSync(file, "utf8")) as { rows: Row[] };
    if (!Array.isArray(backup.rows) || !backup.rows.length) throw new Error("Respaldo vacío o inválido");
    await writeRows(backup.rows, "Restauración");
    return;
  }

  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  if (MODE === "plan") {
    const { targets, redirects, possibleDuplicates } = computeTargets(products);
    summarize(targets, redirects, possibleDuplicates, products);
    writeFileSync(REDIRECTS_FILE, JSON.stringify(redirects, null, 1) + "\n", "utf8");
    const planFile = `${DIR}/fase2-plan-${stamp()}.json`;
    writeFileSync(planFile, JSON.stringify({ targets, possibleDuplicates }, null, 1), "utf8");
    console.log(`\nMapa de URLs: ${REDIRECTS_FILE} (${Object.keys(redirects).length} redirecciones)`);
    console.log(`Plan: ${planFile}`);
    console.log("SIMULACIÓN: la BD no se modificó. Publica el mapa y luego corre --execute.");
    return;
  }

  // ── execute ──
  if (!existsSync(REDIRECTS_FILE)) throw new Error(`Falta ${REDIRECTS_FILE}: corre --plan y publícalo primero.`);
  const slugMap = JSON.parse(readFileSync(REDIRECTS_FILE, "utf8")) as Record<string, string>;
  const missing = products.filter((p) => isBadSlug(p.slug) && !slugMap[p.slug]);
  if (missing.length) throw new Error(`${missing.length} URLs malas sin entrada en el mapa — corre --plan otra vez.`);
  const newSlugs = Object.values(slugMap);
  if (new Set(newSlugs).size !== newSlugs.length) throw new Error("El mapa tiene URLs nuevas repetidas.");

  const { targets, redirects, possibleDuplicates } = computeTargets(products, slugMap);
  summarize(targets, redirects, possibleDuplicates, products);

  const backupFile = `${DIR}/fase2-backup-${stamp()}.json`;
  writeFileSync(
    backupFile,
    JSON.stringify({ createdAt: new Date().toISOString(), rows: targets.map((t) => t.before) }, null, 1),
    "utf8"
  );
  const check = JSON.parse(readFileSync(backupFile, "utf8")) as { rows: Row[] };
  if (check.rows.length !== targets.length) throw new Error("Respaldo inconsistente — se aborta sin escribir.");
  console.log(`\n✓ Respaldo verificado: ${backupFile}`);

  await writeRows(targets.map((t) => t.after), "Fase 2");
  console.log(`Para revertir: npx tsx scripts/rename-products.ts --restore ${backupFile}`);
}

function summarize(
  targets: ReturnType<typeof computeTargets>["targets"],
  redirects: Record<string, string>,
  dups: string[][],
  products: ProductRow[]
) {
  const renamed = targets.filter((t) => t.before.name !== t.after.name);
  const ls = targets.filter((t) => !t.before.isLongSleeve && t.after.isLongSleeve);
  const priced = targets.filter((t) => t.priceBefore !== t.priceAfter);
  console.log(`\n${MODE === "execute" ? "APLICANDO" : "PLAN"} — ${products.length} productos`);
  console.log(`  Nombres que cambian:        ${renamed.length}`);
  console.log(`  URLs que cambian:           ${Object.keys(redirects).length}`);
  console.log(`  Nuevas de manga larga:      ${ls.length}`);
  console.log(`  Cambian de precio mostrado: ${priced.length}`);
  for (const t of priced.slice(0, 10))
    console.log(`    · ${t.after.name}: $${t.priceBefore.toLocaleString("es-CO")} → $${t.priceAfter.toLocaleString("es-CO")}`);
  console.log(`  Posibles duplicados (mismo nombre final): ${dups.length} grupos / ${dups.flat().length} productos`);
  console.log("  Ejemplos:");
  for (const t of renamed.filter((_, i) => i % Math.max(1, Math.floor(renamed.length / 8)) === 0).slice(0, 8))
    console.log(`    · ${t.before.name}  →  ${t.after.name}`);
}

main()
  .catch((e) => {
    console.error("✗ Error — no se aplicó nada fuera de la transacción:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
