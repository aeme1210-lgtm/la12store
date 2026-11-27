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
import { proposeProduct } from "./catalog-rules";

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
      const pr = proposeProduct(p);
      const t = { team: pr.team, resolved: pr.teamResolved };
      canonicalSet.add(t.team);
      if (!t.resolved) unresolved.set(t.team, (unresolved.get(t.team) ?? 0) + 1);
      const { kind, audience: aud, sleeve: man, shirtType: tipo, season: temp, version: ver } = pr;
      const nombrePropuesto = pr.name;
      const isNewPropuesto = pr.isNew;
      const isLongSleevePropuesto = pr.isLongSleeve;
      const alertas = pr.alerts;

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
