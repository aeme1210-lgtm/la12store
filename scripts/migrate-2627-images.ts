import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { writeFileSync, mkdirSync } from "fs";

/**
 * Migra las imágenes de los 38 productos de "Temporada 26/27" (importados
 * en Fase 4 con URLs enlazadas directo a photo.yupoo.com) al bucket propio
 * `products` de Supabase Storage — resuelve la limitación documentada en
 * docs/IMPORT_2627_REPORT.md (hotlinking a Yupoo confirmado inestable en
 * QA de Fase 5).
 *
 * Barandillas (autorizadas explícitamente por el dueño):
 * - Backup previo a /backups con id+slug+URLs actuales de los 38 productos.
 * - Solo UPDATE sobre esos 38 productos (where: league = "Temporada 26/27"),
 *   nunca INSERT/DELETE.
 * - Reintentos por imagen; si una imagen falla persistentemente, se deja su
 *   URL de Yupoo original en el array (no se borra el producto ni se rompe
 *   la galería) y queda documentada en el reporte.
 * - No se usa el endpoint /render/image/ en ningún momento — se sube el
 *   binario tal cual al bucket público, servido luego por
 *   supabase-image-loader.js igual que el resto del catálogo.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SUPABASE_PROJECT_HOST = "chljxifjjzaffvwixtfm.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "products";
const LEAGUE = "Temporada 26/27";
const LEAGUE_PATH_SEGMENT = "Temporada 26-27"; // "/" en el nombre de liga rompería la ruta del bucket
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const MIN_VALID_BYTES = 8000; // por debajo de esto, muy probable que sea un marcador de "acceso restringido", no la foto real
const MAX_ATTEMPTS = 3;

if (!SERVICE_ROLE_KEY) {
  console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY no está en .env");
  process.exit(1);
}

interface ImageResult {
  productSlug: string;
  index: number;
  originalUrl: string;
  status: "migrated" | "failed_kept_original";
  newUrl?: string;
  attempts: number;
  detail?: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function publicUrlFor(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `https://${SUPABASE_PROJECT_HOST}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

async function downloadFromYupoo(url: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://maiyuyan.x.yupoo.com/",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.byteLength < MIN_VALID_BYTES) {
    throw new Error(`Respuesta sospechosamente pequeña (${bytes.byteLength} bytes) — probable bloqueo de Yupoo`);
  }
  return { bytes, contentType };
}

async function uploadToSupabase(path: string, bytes: Buffer, contentType: string): Promise<void> {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`https://${SUPABASE_PROJECT_HOST}/storage/v1/object/${BUCKET}/${encoded}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(bytes),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase upload HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
}

async function migrateOneImage(
  slug: string,
  index: number,
  originalUrl: string
): Promise<ImageResult> {
  const ext = originalUrl.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase().replace("jpeg", "jpg") || "jpg";
  const path = `${LEAGUE_PATH_SEGMENT}/${slug}/${index}.${ext}`;

  let lastError = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await sleep(400); // mismo ritmo que el import original, evita rate-limit
      const downloaded = await downloadFromYupoo(originalUrl);
      if (!downloaded) throw new Error("Descarga vacía");
      await uploadToSupabase(path, downloaded.bytes, downloaded.contentType);
      return {
        productSlug: slug,
        index,
        originalUrl,
        status: "migrated",
        newUrl: publicUrlFor(path),
        attempts: attempt,
      };
    } catch (e) {
      lastError = (e as Error).message;
      if (attempt < MAX_ATTEMPTS) await sleep(1000 * attempt);
    }
  }

  return {
    productSlug: slug,
    index,
    originalUrl,
    status: "failed_kept_original",
    attempts: MAX_ATTEMPTS,
    detail: lastError,
  };
}

async function main() {
  mkdirSync("backups", { recursive: true });

  const products = await prisma.product.findMany({
    where: { league: LEAGUE },
    select: { id: true, slug: true, images: true },
    orderBy: { createdAt: "asc" },
  });

  if (products.length === 0) {
    console.log("Sin productos de Temporada 26/27 — nada que migrar.");
    await pool.end();
    return;
  }

  // Backup previo — barandilla obligatoria antes de cualquier UPDATE masivo.
  const backupPath = `backups/pre-image-migration-2627-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(
    backupPath,
    JSON.stringify(
      products.map((p) => ({ id: p.id, slug: p.slug, images: JSON.parse(p.images) })),
      null,
      2
    )
  );
  console.log(`BACKUP ${backupPath} (${products.length} productos)`);

  const allResults: ImageResult[] = [];
  let productsFullyMigrated = 0;
  let productsPartiallyMigrated = 0;
  let productsUnchanged = 0;

  for (const product of products) {
    const originalImages: string[] = JSON.parse(product.images);
    const results: ImageResult[] = [];

    for (let i = 0; i < originalImages.length; i++) {
      const result = await migrateOneImage(product.slug, i + 1, originalImages[i]);
      results.push(result);
      allResults.push(result);
      console.log(`${result.status === "migrated" ? "OK" : "FAIL"} ${product.slug} [${i + 1}/${originalImages.length}] (intentos: ${result.attempts})`);
    }

    const newImages = results.map((r) => (r.status === "migrated" ? r.newUrl! : r.originalUrl));
    const migratedCount = results.filter((r) => r.status === "migrated").length;

    if (migratedCount === 0) {
      productsUnchanged++;
      continue; // ninguna imagen migró — no se toca el producto, se queda con Yupoo
    }

    // UPDATE restringido: solo el campo images, solo de este producto (id
    // dentro del conjunto de los 38 de Temporada 26/27), nunca otro campo.
    await prisma.product.update({
      where: { id: product.id },
      data: { images: JSON.stringify(newImages) },
    });

    if (migratedCount === originalImages.length) productsFullyMigrated++;
    else productsPartiallyMigrated++;
  }

  const resultPath = "backups/migrate-2627-images-result.json";
  writeFileSync(
    resultPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalProducts: products.length,
        productsFullyMigrated,
        productsPartiallyMigrated,
        productsUnchanged,
        totalImages: allResults.length,
        imagesMigrated: allResults.filter((r) => r.status === "migrated").length,
        imagesFailed: allResults.filter((r) => r.status === "failed_kept_original").length,
        results: allResults,
      },
      null,
      2
    )
  );

  console.log("---");
  console.log(`PRODUCTOS: ${productsFullyMigrated} totalmente migrados, ${productsPartiallyMigrated} parciales, ${productsUnchanged} sin cambios`);
  console.log(`IMÁGENES: ${allResults.filter((r) => r.status === "migrated").length}/${allResults.length} migradas`);
  console.log(`Reporte: ${resultPath}`);

  await pool.end();
}

main().catch(async (e) => {
  console.error("FATAL", e);
  await pool.end();
  process.exit(1);
});
