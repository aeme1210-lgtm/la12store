/**
 * Limpieza de productos duplicados (mismo `name`) — La 12 Store.
 *
 * Plan aprobado (ver docs/REDESIGN_ADENDA.md §2, docs/REDESIGN_AUDIT.md §2):
 *   1. Backup JSON completo de TODO lo que se va a borrar, antes de borrar nada.
 *   2. JAMÁS borrar una fila referenciada en OrderItem (se conserva sí o sí,
 *      sin importar si es la más "vieja" o tiene el slug más limpio).
 *   3. Entre las filas no referenciadas de un mismo grupo, se conserva la más
 *      antigua (createdAt asc, desempate por id) y se borran las demás.
 *   4. Requiere --execute explícito. Sin esa bandera, es dry-run: solo genera
 *      el backup y el resumen, no borra nada.
 *
 * Uso:
 *   npx tsx scripts/dedupe-products.ts            # dry-run (recomendado primero)
 *   npx tsx scripts/dedupe-products.ts --execute   # aplica los DELETE reales
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { writeFileSync } from "fs";

const EXECUTE = process.argv.includes("--execute");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

interface Row {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  hasOrderItems: boolean;
  fullRow: unknown;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
  hasOrderItems: boolean;
  [key: string]: unknown;
}

async function main() {
  const dupNames: { name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT name FROM "Product" GROUP BY name HAVING COUNT(*) > 1 ORDER BY name`
  );

  const toDelete: Row[] = [];
  const kept: Row[] = [];

  for (const g of dupNames) {
    const rows: ProductRow[] = await prisma.$queryRawUnsafe(
      `SELECT p.*, EXISTS(SELECT 1 FROM "OrderItem" oi WHERE oi."productId" = p.id) as "hasOrderItems"
       FROM "Product" p WHERE p.name = $1 ORDER BY p."createdAt" ASC, p.id ASC`,
      g.name
    );

    const protectedRows = rows.filter((r) => r.hasOrderItems);
    const keepers = protectedRows.length > 0 ? protectedRows : [rows[0]];
    const keeperIds = new Set(keepers.map((r) => r.id));

    for (const r of rows) {
      const entry: Row = {
        id: r.id,
        slug: r.slug,
        name: r.name,
        createdAt: r.createdAt.toISOString(),
        hasOrderItems: r.hasOrderItems,
        fullRow: r,
      };
      if (keeperIds.has(r.id)) kept.push(entry);
      else toDelete.push(entry);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `docs/dedupe-backup-${timestamp}.json`;
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mode: EXECUTE ? "execute" : "dry-run",
        groups: dupNames.length,
        keptRows: kept.length,
        deletedRows: toDelete.length,
        rowsProtectedByOrderItem: toDelete.filter((r) => r.hasOrderItems).length,
        deleted: toDelete,
      },
      null,
      2
    )
  );

  console.log(`Grupos duplicados: ${dupNames.length}`);
  console.log(`Filas a conservar: ${kept.length}`);
  console.log(`Filas a borrar: ${toDelete.length}`);
  console.log(`Backup completo escrito en: ${backupPath}`);

  const wronglyMarked = toDelete.filter((r) => r.hasOrderItems);
  if (wronglyMarked.length > 0) {
    console.error(
      `ABORTADO: ${wronglyMarked.length} filas marcadas para borrar tienen OrderItem — esto no debería pasar. Revisar lógica antes de continuar.`
    );
    await pool.end();
    process.exit(1);
  }

  if (!EXECUTE) {
    console.log("\nDRY-RUN: no se borró nada. Revisa el backup y vuelve a correr con --execute para aplicar.");
    await pool.end();
    return;
  }

  console.log("\nEjecutando DELETE...");
  let deleted = 0;
  for (const row of toDelete) {
    await prisma.$executeRawUnsafe(`DELETE FROM "Product" WHERE id = $1`, row.id);
    deleted++;
    if (deleted % 100 === 0) console.log(`  ${deleted}/${toDelete.length}...`);
  }
  console.log(`\nCompleto: ${deleted} filas eliminadas.`);
  await pool.end();
}

main().catch(async (e) => {
  console.error("ERROR", e);
  await pool.end();
  process.exit(1);
});
