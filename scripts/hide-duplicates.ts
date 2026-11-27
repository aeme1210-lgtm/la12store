/**
 * Oculta productos duplicados (mismo producto importado dos veces) — sin borrar.
 *
 * Un grupo es duplicado SOLO si, además de tener el mismo nombre final, cumple:
 *   - mismos flags y precios (isRetro, isLongSleeve, priceFan/Player/Retro), y
 *   - su nombre ORIGINAL de proveedor (respaldo de la fase 2) no muestra una
 *     señal distinta: "Players", "Women", "Kids", "Long Sleeve", colores,
 *     "Special/Commemorative", "Polo/Vest/Jacket"… Si la muestra, el grupo
 *     NO se toca (pueden ser productos distintos con el mismo nombre).
 *
 * En cada grupo se conserva uno (con pedidos > más fotos > más tallas > liga
 * específica > más antiguo) y los demás pasan a `isActive = false`. Nada se
 * borra: el producto sigue en la BD, sus pedidos quedan intactos y su URL
 * redirige (308, proxy.ts) a la camiseta que se conserva.
 *
 * Orden (igual que la fase 2):
 *   1. `--plan`     No escribe en la BD. Agrega a lib/slug-redirects.json
 *                   "URL del duplicado → URL del que se conserva" (y reapunta
 *                   cadenas viejas). Ese mapa se publica primero.
 *   2. `--execute`  Respaldo verificado de isActive + una transacción.
 *   3. `--restore <archivo>` vuelve a activar lo respaldado.
 *
 * Requiere el respaldo de la fase 2 (nombres originales):
 *   --originals backups/normalizacion/fase2-backup-<fecha>.json
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const arg = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const MODE = process.argv.includes("--execute") ? "execute" : process.argv.includes("--restore") ? "restore" : "plan";
const ORIGINALS = arg("--originals") ?? "backups/normalizacion/fase2-backup-2026-11-27T18-12-36.json";
const REDIRECTS_FILE = "lib/slug-redirects.json";
const DIR = "backups/normalizacion";

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

/** Palabras del nombre original que indican un producto distinto. */
const SIGNAL =
  /\b(players?|women'?s?|womens|kids?|baby|long|ls|sleeves?|retro|special|commemorative|anniversary|concept|training|pre-?match|goalkeeper|gk|fan|stadium|authentic|polo|jacket|windbreaker|hoodie|vest|shorts|black|white|red|blue|green|yellow|gold|pink|purple|grey|gray|navy|beige|orange|maroon)\b/gi;
const signature = (name: string) =>
  [...new Set((name.toLowerCase().match(SIGNAL) ?? []).map((w) => w.replace(/s$/, "").replace("-", "")))]
    .sort()
    .join(",");

/** Ligas genéricas de importaciones viejas: se prefiere conservar la específica. */
const GENERIC_LEAGUES = new Set(["New Season", "Other Clubs", "Retro"]);

async function loadProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "asc" },
  });
}
type P = Awaited<ReturnType<typeof loadProducts>>[number];

function planGroups(products: P[], originals: Map<string, string>) {
  const groups = new Map<string, P[]>();
  for (const p of products) groups.set(p.name, [...(groups.get(p.name) ?? []), p]);

  const hide: { dup: P; keep: P }[] = [];
  let skippedSignal = 0;
  let skippedFlags = 0;
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const flags = new Set(g.map((p) => `${p.isRetro}/${p.isLongSleeve}/${p.priceFan}/${p.pricePlayer}/${p.priceRetro}`));
    if (flags.size > 1) { skippedFlags++; continue; }
    const sigs = new Set(g.map((p) => signature(originals.get(p.id) ?? p.name)));
    if (sigs.size > 1) { skippedSignal++; continue; }

    const score = (p: P) => [
      p._count.orderItems > 0 ? 1 : 0,
      (JSON.parse(p.images || "[]") as string[]).length,
      (JSON.parse(p.sizes || "[]") as string[]).length,
      GENERIC_LEAGUES.has(p.league) ? 0 : 1,
    ];
    const sorted = [...g].sort((a, b) => {
      const sa = score(a), sb = score(b);
      for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return sb[i] - sa[i];
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    const [keep, ...rest] = sorted;
    // Nunca se oculta un producto con pedidos.
    for (const dup of rest) if (dup._count.orderItems === 0) hide.push({ dup, keep });
  }
  return { hide, skippedSignal, skippedFlags };
}

async function setActive(rows: { id: string; isActive: boolean }[], label: string) {
  const off = rows.filter((r) => !r.isActive).map((r) => r.id);
  const on = rows.filter((r) => r.isActive).map((r) => r.id);
  await prisma.$transaction([
    prisma.product.updateMany({ where: { id: { in: off } }, data: { isActive: false } }),
    prisma.product.updateMany({ where: { id: { in: on } }, data: { isActive: true } }),
  ]);
  console.log(`✓ ${label}: ${off.length} ocultados, ${on.length} activados — una sola transacción.`);
}

async function main() {
  mkdirSync(DIR, { recursive: true });

  if (MODE === "restore") {
    const file = arg("--restore")!;
    const b = JSON.parse(readFileSync(file, "utf8")) as { rows: { id: string; isActive: boolean }[] };
    await setActive(b.rows, "Restauración");
    return;
  }

  if (!existsSync(ORIGINALS)) throw new Error(`No existe ${ORIGINALS} (nombres originales de la fase 2).`);
  const originals = new Map(
    (JSON.parse(readFileSync(ORIGINALS, "utf8")).rows as { id: string; name: string }[]).map((r) => [r.id, r.name])
  );
  const products = await loadProducts();
  const { hide, skippedSignal, skippedFlags } = planGroups(products, originals);

  console.log(`\n${MODE === "execute" ? "APLICANDO" : "PLAN (no escribe en la BD)"} — ${products.length} productos activos`);
  console.log(`  Duplicados a ocultar:                 ${hide.length}`);
  console.log(`  Grupos que NO se tocan (otra señal):  ${skippedSignal}`);
  console.log(`  Grupos que NO se tocan (precio/flag): ${skippedFlags}`);
  for (const { dup, keep } of hide.slice(0, 6)) console.log(`    · oculta ${dup.slug}  →  conserva ${keep.slug}`);

  const map = JSON.parse(readFileSync(REDIRECTS_FILE, "utf8")) as Record<string, string>;

  if (MODE === "plan") {
    const dupTo = new Map(hide.map(({ dup, keep }) => [dup.slug, keep.slug]));
    // Reapunta cadenas: URL vieja → duplicado pasa a URL vieja → conservado.
    for (const [from, to] of Object.entries(map)) if (dupTo.has(to)) map[from] = dupTo.get(to)!;
    for (const [from, to] of dupTo) map[from] = to;
    writeFileSync(REDIRECTS_FILE, JSON.stringify(map, null, 1) + "\n", "utf8");
    const planFile = `${DIR}/duplicados-plan-${stamp()}.json`;
    writeFileSync(
      planFile,
      JSON.stringify(hide.map(({ dup, keep }) => ({ hide: dup.slug, keep: keep.slug, name: dup.name })), null, 1),
      "utf8"
    );
    console.log(`\nMapa actualizado: ${REDIRECTS_FILE} (${Object.keys(map).length} redirecciones). Plan: ${planFile}`);
    console.log("Publica el mapa y luego corre --execute.");
    return;
  }

  // execute: el mapa publicado debe cubrir cada duplicado.
  const missing = hide.filter(({ dup, keep }) => map[dup.slug] !== keep.slug);
  if (missing.length) throw new Error(`${missing.length} duplicados sin redirección publicada — corre --plan y publica.`);
  const backupFile = `${DIR}/duplicados-backup-${stamp()}.json`;
  const rows = hide.map(({ dup }) => ({ id: dup.id, slug: dup.slug, isActive: true }));
  writeFileSync(backupFile, JSON.stringify({ createdAt: new Date().toISOString(), rows }, null, 1), "utf8");
  if ((JSON.parse(readFileSync(backupFile, "utf8")).rows as unknown[]).length !== rows.length)
    throw new Error("Respaldo inconsistente — se aborta sin escribir.");
  console.log(`\n✓ Respaldo verificado: ${backupFile}`);
  await setActive(rows.map((r) => ({ id: r.id, isActive: false })), "Duplicados");
  console.log(`Para revertir: npx tsx scripts/hide-duplicates.ts --restore ${backupFile}`);
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
