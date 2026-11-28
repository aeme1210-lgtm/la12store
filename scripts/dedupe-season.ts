/**
 * Oculta camisetas repetidas DENTRO de una misma liga/temporada (por defecto
 * "Temporada 26/27") — típicamente la misma camiseta importada de dos
 * proveedores. No borra nada: `isActive = false` + redirección 308 a la que
 * se conserva.
 *
 * Es duplicado:
 *   1. Mismo nombre (sin tildes ni mayúsculas).
 *   2. Local / Visitante / Tercera / Cuarta del mismo equipo, temporada,
 *      versión (Fan/Jugador), público (adulto/mujer/niño), prenda y manga,
 *      cuando lo único que cambia es un COLOR en el detalle ("· Gris"): un
 *      equipo tiene una sola camiseta visitante por temporada.
 * NO se toca: Edición especial, Entrenamiento, Pre-partido y Portero (suelen
 * venir en varios colores reales), ni variantes con un detalle que no es
 * color ("UCL", "Full Sponsors", nombre de jugador).
 *
 * Se conserva: con pedidos > más fotos > más antigua.
 *
 * Uso (mismo orden que las otras fases):
 *   npx tsx scripts/dedupe-season.ts [--league "Temporada 26/27"]            # plan + mapa
 *   npx tsx scripts/dedupe-season.ts [--league …] --execute                  # aplica
 *   npx tsx scripts/dedupe-season.ts --restore backups/…json                 # revierte
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { strip } from "./catalog-rules";

const arg = (f: string) => {
  const i = process.argv.indexOf(f);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const LEAGUE = arg("--league") ?? "Temporada 26/27";
const MODE = process.argv.includes("--execute") ? "execute" : process.argv.includes("--restore") ? "restore" : "plan";
const REDIRECTS_FILE = "lib/slug-redirects.json";
const DIR = "backups/normalizacion";

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const norm = (s: string) => strip(s).replace(/\s+/g, " ").trim();

const COLORS = new Set([
  "verde", "negra", "blanca", "dorada", "roja", "azul", "amarilla", "rosada", "morada", "gris",
  "marino", "beige", "naranja", "vinotinto", "fluorescente", "plateada", "cafe",
]);
const ONE_PER_SEASON = /\b(Local|Visitante|Tercera|Cuarta)\b/;

async function load() {
  return prisma.product.findMany({
    where: { isActive: true, league: LEAGUE },
    include: { _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "asc" },
  });
}
type P = Awaited<ReturnType<typeof load>>[number];

function groupKey(p: P): string {
  const [base, detail = ""] = p.name.split(" · ");
  const exact = `exact|${norm(p.name)}`;
  if (!ONE_PER_SEASON.test(base)) return exact;
  const detailWords = norm(detail).split(" ").filter(Boolean);
  // Detalle con algo que no es color → variante real, se agrupa solo por nombre exacto.
  if (detailWords.some((w) => !COLORS.has(w))) return exact;
  return `kit|${norm(base)}|${p.team}|${p.isLongSleeve}`;
}

function plan(products: P[]) {
  const groups = new Map<string, P[]>();
  for (const p of products) {
    const k = groupKey(p);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  // Dentro de un mismo kit, solo son la misma camiseta las que tienen el MISMO
  // color o ninguno. Dos colores distintos (Sporting niño negra vs. rosada) son
  // productos distintos. Si hay varios colores, las sin color quedan aparte.
  const clusters: P[][] = [];
  for (const [k, g] of groups) {
    if (!k.startsWith("kit|") || g.length < 2) { clusters.push(g); continue; }
    const color = (p: P) => norm(p.name.split(" · ")[1] ?? "");
    const byColor = new Map<string, P[]>();
    for (const p of g) byColor.set(color(p), [...(byColor.get(color(p)) ?? []), p]);
    const colored = [...byColor.keys()].filter((c) => c);
    if (colored.length === 1) clusters.push(g); // una sola variante de color + las sin color
    else for (const v of byColor.values()) clusters.push(v);
  }

  const hide: { dup: P; keep: P }[] = [];
  for (const g of clusters) {
    if (g.length < 2) continue;
    const sorted = [...g].sort(
      (a, b) =>
        b._count.orderItems - a._count.orderItems ||
        (JSON.parse(b.images || "[]") as string[]).length - (JSON.parse(a.images || "[]") as string[]).length ||
        a.createdAt.getTime() - b.createdAt.getTime()
    );
    const [keep, ...rest] = sorted;
    for (const dup of rest) if (dup._count.orderItems === 0) hide.push({ dup, keep });
  }
  return hide;
}

async function main() {
  mkdirSync(DIR, { recursive: true });
  if (MODE === "restore") {
    const file = arg("--restore")!;
    const rows = (JSON.parse(readFileSync(file, "utf8")).rows as { id: string }[]).map((r) => r.id);
    await prisma.product.updateMany({ where: { id: { in: rows } }, data: { isActive: true } });
    console.log(`✓ Restaurados ${rows.length} productos.`);
    return;
  }

  const products = await load();
  const hide = plan(products);
  console.log(`\n${MODE === "execute" ? "APLICANDO" : "PLAN (no escribe en la BD)"} — ${LEAGUE}: ${products.length} activos`);
  console.log(`  Duplicados a ocultar: ${hide.length}  → quedan ${products.length - hide.length}`);
  for (const { dup, keep } of hide.slice(0, 12)) console.log(`    · oculta "${dup.name}"  →  conserva "${keep.name}"`);

  const map = JSON.parse(readFileSync(REDIRECTS_FILE, "utf8")) as Record<string, string>;
  if (MODE === "plan") {
    const dupTo = new Map(hide.map(({ dup, keep }) => [dup.slug, keep.slug]));
    for (const [from, to] of Object.entries(map)) if (dupTo.has(to)) map[from] = dupTo.get(to)!;
    for (const [from, to] of dupTo) map[from] = to;
    writeFileSync(REDIRECTS_FILE, JSON.stringify(map, null, 1) + "\n", "utf8");
    writeFileSync(
      `${DIR}/dedupe-season-plan-${stamp()}.json`,
      JSON.stringify(hide.map(({ dup, keep }) => ({ hide: dup.name, hideSlug: dup.slug, keep: keep.name, keepSlug: keep.slug })), null, 1)
    );
    console.log(`\nMapa actualizado (${Object.keys(map).length} redirecciones). Publica y luego --execute.`);
    return;
  }

  const missing = hide.filter(({ dup, keep }) => map[dup.slug] !== keep.slug);
  if (missing.length) throw new Error(`${missing.length} duplicados sin redirección — corre el plan primero.`);
  const backupFile = `${DIR}/dedupe-season-backup-${stamp()}.json`;
  writeFileSync(backupFile, JSON.stringify({ rows: hide.map(({ dup }) => ({ id: dup.id, slug: dup.slug })) }, null, 1));
  await prisma.product.updateMany({ where: { id: { in: hide.map(({ dup }) => dup.id) } }, data: { isActive: false } });
  console.log(`\n✓ Ocultados ${hide.length}. Respaldo: ${backupFile}`);
  console.log(`Para revertir: npx tsx scripts/dedupe-season.ts --restore ${backupFile}`);
}

main()
  .catch((e) => {
    console.error("✗", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
