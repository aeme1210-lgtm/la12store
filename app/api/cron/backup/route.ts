/**
 * /api/cron/backup
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoint para el cron job semanal de Vercel.
 * Genera un backup de datos (SQL INSERT statements) y lo sube a Google Drive.
 *
 * No usa pg_dump (no disponible en Vercel serverless).
 * Exporta todas las tablas vía Prisma y genera SQL válido para restaurar.
 *
 * Seguridad: requiere header Authorization: Bearer {CRON_SECRET}
 * Vercel inyecta este header automáticamente en los cron jobs.
 * Para disparar manualmente: curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/backup
 *
 * Variables de entorno requeridas:
 *   CRON_SECRET                  — secret compartido con Vercel
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — JSON de la Service Account de Google
 *   GOOGLE_DRIVE_FOLDER_ID       — ID de carpeta en Google Drive
 */

import { NextRequest, NextResponse } from "next/server";
import { gzipSync } from "zlib";
import { google } from "googleapis";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma";

// ── Auth ──────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

// ── Google Drive ──────────────────────────────────────────────────────────────

async function buildDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON no configurado");
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
}

async function uploadToDrive(filename: string, buffer: Buffer) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID no configurado");

  const drive = await buildDriveClient();
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType: "application/gzip",
    },
    media: {
      mimeType: "application/gzip",
      body: Readable.from(buffer),
    },
    fields: "id, name",
  });

  // Pruning: mantener los últimos 10 backups automáticos (vercel-*)
  const list = await drive.files.list({
    q: `'${folderId}' in parents and name contains 'backup-la12store-vercel-' and trashed = false`,
    orderBy: "createdTime asc",
    fields: "files(id, name)",
    pageSize: 100,
  });
  const old = (list.data.files ?? []).slice(0, -10);
  await Promise.all(old.map((f) => drive.files.delete({ fileId: f.id! })));

  return res.data;
}

// ── SQL generation ────────────────────────────────────────────────────────────

/**
 * Serializa un valor JS a su representación en SQL literal.
 * Soporta: null, boolean, number, Date, string.
 */
function toSqlLiteral(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  // Strings: escapar comillas simples duplicándolas
  return `'${String(v).replace(/'/g, "''")}'`;
}

/** Genera un bloque de INSERTs para una tabla. */
function tableToSQL<T extends Record<string, unknown>>(
  tableName: string,
  rows: T[]
): string {
  if (rows.length === 0) return `-- ${tableName}: sin registros\n`;

  const cols = Object.keys(rows[0])
    .map((c) => `"${c}"`)
    .join(", ");

  const inserts = rows
    .map((row) => {
      const vals = Object.values(row).map(toSqlLiteral).join(", ");
      return `INSERT INTO "${tableName}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`;
    })
    .join("\n");

  return `-- ${tableName} (${rows.length} filas)\n${inserts}\n`;
}

/** Construye el contenido SQL completo del backup. */
async function generateSQL(timestamp: string): Promise<string> {
  const lines: string[] = [];

  lines.push("-- ══════════════════════════════════════════════════════");
  lines.push(`-- BACKUP LA 12 STORE — Data-only (via Vercel Cron)`);
  lines.push(`-- Generado: ${timestamp}`);
  lines.push("-- NOTA: Este backup contiene solo datos (no DDL/schema).");
  lines.push("--       Para restaurar el schema, usa las migraciones de Prisma.");
  lines.push("-- ══════════════════════════════════════════════════════\n");

  lines.push("SET client_encoding = 'UTF8';");
  lines.push("BEGIN;\n");

  // ── Tablas en orden de dependencias (FK-safe) ─────────────────────────────
  // AdminUser y Category no tienen FK
  const adminUsers = await prisma.adminUser.findMany();
  lines.push(tableToSQL("AdminUser", adminUsers as Record<string, unknown>[]));

  const categories = await prisma.category.findMany();
  lines.push(tableToSQL("Category", categories as Record<string, unknown>[]));

  // Product depende de nada
  const products = await prisma.product.findMany();
  lines.push(tableToSQL("Product", products as Record<string, unknown>[]));

  // Order depende de nada (FK solo a OrderItem)
  const orders = await prisma.order.findMany();
  lines.push(tableToSQL("Order", orders as Record<string, unknown>[]));

  // OrderItem depende de Order y Product
  const orderItems = await prisma.orderItem.findMany();
  lines.push(tableToSQL("OrderItem", orderItems as Record<string, unknown>[]));

  lines.push("COMMIT;\n");
  lines.push("-- ── Fin del backup ──────────────────────────────────────");

  return lines.join("\n");
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // ── Verificar autorización ──────────────────────────────────────────────
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const startedAt = new Date();
  const timestamp = startedAt.toISOString();

  try {
    // ── 1. Generar SQL ────────────────────────────────────────────────────
    const sql = await generateSQL(timestamp);
    const sqlBytes = Buffer.from(sql, "utf8");

    // ── 2. Gzip ───────────────────────────────────────────────────────────
    const gzipped = gzipSync(sqlBytes, { level: 9 });

    // ── 3. Nombre del archivo ─────────────────────────────────────────────
    const dateStr = startedAt.toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `backup-la12store-vercel-${dateStr}.sql.gz`;

    // ── 4. Subir a Drive ──────────────────────────────────────────────────
    const uploaded = await uploadToDrive(filename, gzipped);

    return NextResponse.json({
      ok: true,
      filename: uploaded.name,
      fileId: uploaded.id,
      sizeKB: Math.round(gzipped.length / 1024),
      sqlKB: Math.round(sqlBytes.length / 1024),
      timestamp,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/backup] Error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Forzar ejecución dinámica (no cachear en build)
export const dynamic = "force-dynamic";
// Timeout extendido para Vercel Pro (máx 300s en funciones serverless Pro)
export const maxDuration = 300;
