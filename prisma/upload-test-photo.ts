/**
 * upload-test-photo.ts
 * Sube UNA foto a Supabase Storage y actualiza el producto en BD.
 * Uso: npx tsx prisma/upload-test-photo.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const SUPABASE_URL = "https://chljxifjjzaffvwixtfm.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const BUCKET = "products";

// Foto a subir
const PHOTO_PATH = path.resolve(
  __dirname,
  "../../public/products/New Season/25_26 Colo Colo Home/001.jpg"
);
// Ruta dentro del bucket
const STORAGE_PATH = "New Season/25_26 Colo Colo Home/001.jpg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function supabaseRequest(
  method: string,
  endpoint: string,
  body?: Buffer | string,
  contentType = "application/json"
) {
  const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      apikey: SUPABASE_SERVICE_KEY,
      ...(body ? { "Content-Type": contentType } : {}),
    },
    ...(body ? { body } : {}),
  });
  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, ok: res.ok, data: json };
}

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error("ERROR: Falta SUPABASE_SERVICE_KEY en .env");
    console.error("Agrégala así en .env:");
    console.error('  SUPABASE_SERVICE_KEY=eyJ...');
    process.exit(1);
  }

  // 1. Crear bucket público 'products' (ignorar si ya existe)
  console.log(`\n1. Creando bucket '${BUCKET}'...`);
  const createBucket = await supabaseRequest(
    "POST",
    "/storage/v1/bucket",
    JSON.stringify({ id: BUCKET, name: BUCKET, public: true })
  );
  const bucketMsg = JSON.stringify(createBucket.data);
  if (createBucket.ok) {
    console.log("   ✓ Bucket creado");
  } else if (bucketMsg.includes("already") || bucketMsg.includes("Duplicate") || bucketMsg.includes("exists")) {
    console.log("   ✓ Bucket ya existía");
  } else {
    console.error("   ERROR al crear bucket:", createBucket.data);
    process.exit(1);
  }

  // 2. Subir la foto
  console.log(`\n2. Subiendo foto: ${PHOTO_PATH}`);
  if (!fs.existsSync(PHOTO_PATH)) {
    console.error("   ERROR: No existe el archivo", PHOTO_PATH);
    process.exit(1);
  }
  const fileBuffer = fs.readFileSync(PHOTO_PATH);
  const upload = await supabaseRequest(
    "POST",
    `/storage/v1/object/${BUCKET}/${STORAGE_PATH}`,
    fileBuffer,
    "image/jpeg"
  );
  if (!upload.ok && !(upload.data as { error?: string })?.error?.includes("already exists")) {
    console.error("   ERROR al subir:", upload.data);
    process.exit(1);
  }
  console.log("   ✓ Foto subida");

  // 3. URL pública
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${STORAGE_PATH}`;
  console.log(`\n3. URL pública: ${publicUrl}`);

  // 4. Actualizar el producto en BD
  console.log("\n4. Buscando producto '25/26 Colo Colo Home' en BD...");
  const product = await prisma.product.findFirst({
    where: { name: { contains: "Colo Colo Home", mode: "insensitive" }, season: "25/26" },
  });

  if (!product) {
    console.error("   ERROR: Producto no encontrado en BD");
    process.exit(1);
  }

  console.log(`   Encontrado: ${product.name} (slug: ${product.slug})`);
  await prisma.product.update({
    where: { id: product.id },
    data: { images: JSON.stringify([publicUrl]) },
  });
  console.log("   ✓ Producto actualizado con URL de Supabase Storage");

  console.log("\n" + "=".repeat(60));
  console.log("  LISTO. Verifica esta URL en el navegador:");
  console.log(`  ${publicUrl}`);
  console.log("=".repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
