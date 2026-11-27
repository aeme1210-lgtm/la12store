/**
 * Aplica la normalización del catálogo — con respaldo y reversión.
 *
 * Alcance v1 (deliberadamente conservador, ver docs/NORMALIZACION_PROPUESTA.md):
 *   1. `team`         → equipo canónico (solo si el script lo resolvió con
 *                        confianza; los "REVISAR" no se tocan).
 *   2. `isNew`        → true solo para camisetas adulto 2026 y 26/27.
 *   3. `isLongSleeve` → false → true cuando el nombre dice manga larga / LS.
 *                        Nunca se pasa de true a false.
 *
 * NO toca: `name`, `slug` (URLs indexadas y búsqueda), precios, imágenes,
 * pedidos. Nada se borra: solo UPDATE de esas tres columnas.
 *
 * Seguridad:
 *   - Sin `--execute` es SIMULACIÓN: no escribe en la BD, solo muestra qué
 *     cambiaría y guarda el plan en backups/normalizacion/plan-<fecha>.json.
 *   - Con `--execute`: primero guarda backups/normalizacion/backup-<fecha>.json
 *     con los valores ACTUALES de cada fila afectada, lo vuelve a leer para
 *     confirmar que quedó bien escrito, y recién entonces aplica todo dentro de
 *     UNA transacción (si algo falla, no se aplica nada).
 *   - `--restore <archivo>` devuelve cada fila a los valores del respaldo.
 *
 * Uso:
 *   npx tsx scripts/apply-normalization.ts                       # simulación
 *   npx tsx scripts/apply-normalization.ts --execute             # aplica
 *   npx tsx scripts/apply-normalization.ts --restore backups/normalizacion/backup-XXXX.json
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { proposeProduct } from "./catalog-rules";
import { getStartingPrice } from "../lib/pricing";

const EXECUTE = process.argv.includes("--execute");
const restoreIdx = process.argv.indexOf("--restore");
const RESTORE_FILE = restoreIdx > -1 ? process.argv[restoreIdx + 1] : null;
const DIR = "backups/normalizacion";

interface Snapshot {
  id: string;
  team: string;
  isNew: boolean;
  isLongSleeve: boolean;
}

interface Change {
  id: string;
  slug: string;
  before: Snapshot;
  after: Snapshot;
  priceBefore: number;
  priceAfter: number;
}

// Conexión directa (5432) para la transacción de mantenimiento, igual que el
// CLI de Prisma; cae a DATABASE_URL si no existe.
const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

/** Agrupa ids por valor destino para hacer pocos updateMany en vez de miles de update. */
function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(it);
  }
  return m;
}

async function writeSnapshots(rows: Snapshot[], label: string) {
  type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
  await prisma.$transaction(
    async (tx: Tx) => {
      for (const [team, group] of groupBy(rows, (r) => r.team)) {
        await tx.product.updateMany({ where: { id: { in: group.map((g) => g.id) } }, data: { team } });
      }
      for (const [isNew, group] of groupBy(rows, (r) => String(r.isNew))) {
        await tx.product.updateMany({
          where: { id: { in: group.map((g) => g.id) } },
          data: { isNew: isNew === "true" },
        });
      }
      for (const [ls, group] of groupBy(rows, (r) => String(r.isLongSleeve))) {
        await tx.product.updateMany({
          where: { id: { in: group.map((g) => g.id) } },
          data: { isLongSleeve: ls === "true" },
        });
      }
    },
    { timeout: 120_000 }
  );
  console.log(`✓ ${label}: ${rows.length} productos actualizados en una sola transacción.`);
}

async function restore(file: string) {
  const backup = JSON.parse(readFileSync(file, "utf8")) as { rows: Snapshot[] };
  if (!Array.isArray(backup.rows) || backup.rows.length === 0) throw new Error("Respaldo vacío o inválido");
  console.log(`Restaurando ${backup.rows.length} productos desde ${file}…`);
  await writeSnapshots(backup.rows, "Restauración");
}

async function main() {
  if (RESTORE_FILE) return restore(RESTORE_FILE);

  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  const changes: Change[] = [];

  for (const p of products) {
    const pr = proposeProduct(p);
    const before: Snapshot = { id: p.id, team: p.team, isNew: p.isNew, isLongSleeve: p.isLongSleeve };
    const after: Snapshot = {
      id: p.id,
      team: pr.teamResolved ? pr.team : p.team,
      isNew: pr.isNew,
      isLongSleeve: p.isLongSleeve || pr.isLongSleeve,
    };
    if (before.team === after.team && before.isNew === after.isNew && before.isLongSleeve === after.isLongSleeve)
      continue;
    changes.push({
      id: p.id,
      slug: p.slug,
      before,
      after,
      priceBefore: getStartingPrice(p),
      priceAfter: getStartingPrice({ ...p, isLongSleeve: after.isLongSleeve }),
    });
  }

  const teamChanges = changes.filter((c) => c.before.team !== c.after.team);
  const newOff = changes.filter((c) => c.before.isNew && !c.after.isNew);
  const newOn = changes.filter((c) => !c.before.isNew && c.after.isNew);
  const lsOn = changes.filter((c) => !c.before.isLongSleeve && c.after.isLongSleeve);
  const priceChanges = changes.filter((c) => c.priceBefore !== c.priceAfter);

  console.log(`\n${EXECUTE ? "APLICANDO" : "SIMULACIÓN (no se escribe nada)"} — ${products.length} productos leídos`);
  console.log(`  Productos que cambian:        ${changes.length}`);
  console.log(`  Equipo canónico:              ${teamChanges.length}`);
  console.log(`  Dejan de ser "nuevo":         ${newOff.length}`);
  console.log(`  Pasan a "nuevo":              ${newOn.length}`);
  console.log(`  Se marcan manga larga:        ${lsOn.length}`);
  console.log(`  Cambian de precio mostrado:   ${priceChanges.length}`);
  for (const c of priceChanges.slice(0, 8))
    console.log(`    · ${c.slug}: $${c.priceBefore.toLocaleString("es-CO")} → $${c.priceAfter.toLocaleString("es-CO")}`);
  console.log("  Ejemplos de equipo:");
  for (const c of teamChanges.slice(0, 8)) console.log(`    · "${c.before.team}" → "${c.after.team}"`);

  mkdirSync(DIR, { recursive: true });
  const ts = stamp();

  if (!EXECUTE) {
    const planFile = `${DIR}/plan-${ts}.json`;
    writeFileSync(planFile, JSON.stringify({ createdAt: new Date().toISOString(), changes }, null, 2), "utf8");
    console.log(`\nPlan guardado en ${planFile}. Para aplicar: --execute`);
    return;
  }

  if (changes.length === 0) {
    console.log("Nada que aplicar.");
    return;
  }

  // 1) Respaldo de los valores actuales, y verificación de que se puede leer.
  const backupFile = `${DIR}/backup-${ts}.json`;
  writeFileSync(
    backupFile,
    JSON.stringify({ createdAt: new Date().toISOString(), rows: changes.map((c) => c.before) }, null, 2),
    "utf8"
  );
  const check = JSON.parse(readFileSync(backupFile, "utf8")) as { rows: Snapshot[] };
  if (check.rows.length !== changes.length) throw new Error("El respaldo no coincide — se aborta sin escribir.");
  console.log(`\n✓ Respaldo verificado: ${backupFile}`);

  // 2) Aplicación en una sola transacción.
  await writeSnapshots(changes.map((c) => c.after), "Normalización");
  console.log(`Para revertir: npx tsx scripts/apply-normalization.ts --restore ${backupFile}`);
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
