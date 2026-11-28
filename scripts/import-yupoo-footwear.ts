/**
 * Importa guayos y zapatillas de Yupoo a la sección Guayos (league "Guayos").
 *
 * Uso:
 *   npx tsx scripts/import-yupoo-footwear.ts --source https://football.x.yupoo.com/albums/ --pages 1-7 --price 280000
 *   … --execute   para importar (sin la bandera es PLAN: no escribe nada)
 *
 * - Nombre: "Marca Modelo · Superficie" (FG = Terreno firme, TF = Sintética,
 *   IC = Microfútbol…). Los colores de un mismo modelo vienen en álbumes
 *   separados con el mismo título: cada uno es un producto "· Diseño N".
 * - Tallas numéricas a partir del título ("SIZE:36-45", "TF36-45"); 28-35 = niño.
 * - Precio único (--price) en priceFan; sin versión Jugador ni dorsal.
 * - Se saltan bolsos y balones (no son calzado).
 * - Solo INSERT, fotos al bucket propio (Football/<slug>/n.jpg), reanudable,
 *   4 álbumes en paralelo, reintentos ante cortes de la BD.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { mkdirSync, writeFileSync } from "fs";
import { slugify } from "./catalog-rules";

const arg = (f: string) => {
  const i = process.argv.indexOf(f);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const SOURCE = arg("--source") ?? "https://football.x.yupoo.com/albums/";
const [P_FROM, P_TO] = (() => {
  const p = (arg("--pages") ?? "1-7").split("-").map(Number);
  return [p[0], p[1] ?? p[0]];
})();
const PRICE = Number(arg("--price") ?? "280000");
const EXECUTE = process.argv.includes("--execute");
/** Crea los productos ocultos (isActive=false): para cargarlos antes de publicar el candado. */
const INACTIVE = process.argv.includes("--inactive");
const LEAGUE = "Guayos";
const ORIGIN = new URL(SOURCE).origin;
const SUPABASE_HOST = "chljxifjjzaffvwixtfm.supabase.co";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const msg = String((e as Error).message);
      if (!/reach database|P1001|ECONNRESET|ETIMEDOUT|DatabaseNotReachable|Connection terminated/i.test(msg) || attempt >= 6) throw e;
      await sleep(10000 * attempt);
    }
  }
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Referer: `${ORIGIN}/` }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

interface Album { id: string; title: string }

async function listAlbums(): Promise<Album[]> {
  const out: Album[] = [];
  const seen = new Set<string>();
  for (let p = P_FROM; p <= P_TO; p++) {
    const html = await fetchText(`${SOURCE}?page=${p}`);
    const re = /<a[^>]*?(?:title="([^"]*)"[^>]*?href="\/albums\/(\d+)[^"]*"|href="\/albums\/(\d+)[^"]*"[^>]*?title="([^"]*)")/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const id = m[2] || m[3];
      const title = (m[1] || m[4] || "").replace(/&amp;/g, "&").trim();
      if (!id || !title || /^\d+$/.test(title) || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, title });
    }
    await sleep(500);
  }
  return out;
}

// ── Clasificación ───────────────────────────────────────────────────────────

const SURFACES: [RegExp, string, string][] = [
  [/\bFG\b/, "FG", "Terreno firme (FG)"],
  [/\bAG\b/, "AG", "Césped artificial (AG)"],
  [/\bSG\b/, "SG", "Terreno blando (SG)"],
  [/\bMG\b/, "MG", "Multiterreno (MG)"],
  [/\bTF\b/, "TF", "Sintética (TF)"],
  [/\bIC\b|\bindoor\b|室内/i, "IC", "Microfútbol (IC)"],
];

const BRANDS: [RegExp, string][] = [
  [/\bnew balance\b/i, "New Balance"], [/adidas|\badizero\b|\bsupernova\b/i, "Adidas"], [/nike/i, "Nike"], [/\bpuma\b/i, "Puma"],
  [/\bon\s+cloud/i, "On"],
  [/\bmizuno\b/i, "Mizuno"], [/\bjoma\b/i, "Joma"], [/\basics\b/i, "ASICS"], [/\bumbro\b/i, "Umbro"],
  [/\bkelme\b|卡尔美/i, "Kelme"], [/\blotto\b/i, "Lotto"], [/\bdiadora\b/i, "Diadora"],
  [/\bunder armou?r\b/i, "Under Armour"],
  // Modelos que identifican la marca aunque el título no la diga.
  [/\b(mercurial|phantom|tiempo|vapor|superfly|streetgato|gato|zoom)\b/i, "Nike"],
  [/\b(predator|copa|f50|x crazyfast|top sala|samba)\b/i, "Adidas"],
  [/\b(future|ultra|king)\b/i, "Puma"],
  [/\b(morelia|alpha|neo)\b/i, "Mizuno"],
];

function classify(album: Album) {
  const raw = album.title.replace(/[：]/g, ":").replace(/&quot;/gi, '"').replace(/&amp;/gi, "&");
  if (/\b(bag|bags|backpack|ball|balls|socks|shin ?guards?)\b|football for/i.test(raw)) return { skip: "no es calzado" as const };

  const brand = BRANDS.find(([re]) => re.test(raw))?.[1];
  if (!brand) return { skip: "marca no identificable" as const };

  // Tallas "SIZE:36-45", "Size：36/45", "TF36-45", "FG39-45"
  const sm = raw.match(/(\d{2})\s*[-/~]+\s*(\d{2})(?!\d)/);
  let sizes: string[] = [];
  if (sm) {
    const a = Number(sm[1]), b = Number(sm[2]);
    if (a >= 20 && b <= 50 && a < b) sizes = Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
  }
  if (!sizes.length) sizes = Array.from({ length: 10 }, (_, i) => String(36 + i));
  const kids = Number(sizes[sizes.length - 1]) <= 35;

  const spaced = raw.replace(/([a-z])(TF|FG|AG|SG|MG|IC)\b/g, "$1 $2").replace(/\b(TF|FG|AG|SG|MG|IC)(\d)/g, "$1 $2");
  const surface = SURFACES.find(([re]) => re.test(spaced));

  // Modelo: el título sin marca, tallas, superficie ni ruido; palabras en minúscula con mayúscula inicial.
  let model = spaced
    .replace(/[　-鿿]+/g, " ")
    .replace(/\b(size|szie|sieze)\s*:?\s*\d{2}\s*[-/~]+\s*\d{2}\b/gi, " ")
    .replace(/\b\d{2}\s*[-/~]+\s*\d{2}\b/g, " ")
    // Errores de tipeo y ruido del proveedor: "Aadidas", "Adids", "SIEZE:", "BOOTS".
    .replace(/\b(aadidas|adids|size|szie|sieze|boots?|soccer|sneaker)\b:?/gi, " ")
    .replace(/\b(FG|AG|SG|MG|TF|IC)\b/g, " ")
    // Marca al inicio de palabra ("NikeTiempo" sí; "Cloudmonster" no pierde su "on").
    .replace(new RegExp(`\\b${brand.replace(" ", "\\s+")}`, "gi"), " ")
    .replace(/(^|\s)[/\\:-]+(?=\s|$)/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    // "PREDATOR LEAGUE" → "Predator League" (siglas cortas como GX, PD25, TRX se respetan).
    .replace(/\b[A-Z]{4,}\b/g, (w) => w[0] + w.slice(1).toLowerCase())
    .replace(/\b([a-z])([a-z]+)\b/g, (_, f: string, r: string) => f.toUpperCase() + r);
  if (!model) model = "Guayo";

  const base = [`${brand} ${model}`, surface?.[2], kids ? "Niño" : null].filter(Boolean).join(" · ");
  return { album, brand, base, type: surface?.[1] ?? "Zapatilla", sizes };
}

type Item = Exclude<ReturnType<typeof classify>, { skip: string }> & { name: string; slug: string };

async function buildPlan(albums: Album[]) {
  const existing = await withDbRetry(() => prisma.product.findMany({ select: { slug: true, name: true, league: true } }));
  const taken = new Set(existing.map((p) => p.slug));
  const existingNames = new Set(existing.filter((p) => p.league === LEAGUE).map((p) => p.name.toLowerCase()));

  const skipped: { title: string; reason: string }[] = [];
  const items: Exclude<ReturnType<typeof classify>, { skip: string }>[] = [];
  for (const a of albums) {
    const c = classify(a);
    if ("skip" in c) skipped.push({ title: a.title, reason: c.skip! });
    else items.push(c);
  }
  // Colores de un mismo modelo → "· Diseño N" (orden del catálogo del proveedor).
  const count = new Map<string, number>();
  for (const it of items) count.set(it.base, (count.get(it.base) ?? 0) + 1);
  const seq = new Map<string, number>();
  const create: Item[] = [];
  for (const it of items) {
    let name = it.base;
    if ((count.get(it.base) ?? 0) > 1) {
      const n = (seq.get(it.base) ?? 0) + 1;
      seq.set(it.base, n);
      name = `${it.base} · Diseño ${n}`;
    }
    if (existingNames.has(name.toLowerCase())) { skipped.push({ title: it.album.title, reason: `ya existe "${name}"` }); continue; }
    const baseSlug = slugify(name) || `guayo-${it.album.id}`;
    let slug = baseSlug;
    for (let i = 2; taken.has(slug); i++) slug = `${baseSlug}-${i}`;
    taken.add(slug);
    create.push({ ...it, name, slug });
  }
  return { create, skipped };
}

async function albumPhotos(id: string): Promise<string[]> {
  const html = await fetchText(`${ORIGIN}/albums/${id}?uid=1`);
  const urls = [...html.matchAll(/data-src="(https:\/\/photo\.yupoo\.com\/[^"]+\/big\.(?:jpe?g|png|webp))"/g)].map((m) => m[1]);
  return [...new Set(urls)].slice(0, 6);
}

async function copyPhoto(url: string, path: string): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Referer: `${ORIGIN}/` }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.byteLength < 8000) throw new Error(`imagen sospechosa (${bytes.byteLength} bytes)`);
      const encoded = path.split("/").map(encodeURIComponent).join("/");
      const up = await fetch(`https://${SUPABASE_HOST}/storage/v1/object/products/${encoded}`, {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": res.headers.get("content-type") || "image/jpeg",
          "x-upsert": "true",
        },
        body: new Uint8Array(bytes),
      });
      if (!up.ok) throw new Error(`Supabase ${up.status}: ${(await up.text()).slice(0, 200)}`);
      return `https://${SUPABASE_HOST}/storage/v1/object/public/products/${encoded}`;
    } catch (e) {
      if (attempt === 3) throw e;
      await sleep(1000 * attempt);
    }
  }
  throw new Error("inalcanzable");
}

async function main() {
  mkdirSync("backups", { recursive: true });
  const albums = await listAlbums();
  const { create, skipped } = await buildPlan(albums);
  const byType = create.reduce<Record<string, number>>((a, i) => ((a[i.type] = (a[i.type] ?? 0) + 1), a), {});
  console.log(`\n${EXECUTE ? "IMPORTANDO" : "PLAN (no escribe)"} — ${albums.length} álbumes, precio $${PRICE.toLocaleString("es-CO")}`);
  console.log(`  A crear: ${create.length}`, byType);
  console.log(`  Saltados: ${skipped.length}`, skipped.reduce<Record<string, number>>((a, s) => ((a[s.reason.replace(/".*"/, "…")] = (a[s.reason.replace(/".*"/, "…")] ?? 0) + 1), a), {}));
  for (const i of create.filter((_, k) => k % Math.max(1, Math.floor(create.length / 12)) === 0).slice(0, 12))
    console.log(`    · ${i.album.title.slice(0, 60).padEnd(60)} →  ${i.name}  [${i.sizes[0]}-${i.sizes[i.sizes.length - 1]}]`);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  if (!EXECUTE) {
    writeFileSync(`backups/import-footwear-plan-${stamp}.json`, JSON.stringify({ create, skipped }, null, 1));
    console.log(`\nPlan: backups/import-footwear-plan-${stamp}.json — para importar: --execute`);
    return;
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env");

  const results: { title: string; status: string; slug?: string; detail?: string }[] = [];
  let errors = 0;
  let done = 0;
  const processOne = async (it: Item) => {
    try {
      if (await withDbRetry(() => prisma.product.findUnique({ where: { slug: it.slug } }))) {
        results.push({ title: it.album.title, status: "ya_creado", slug: it.slug });
        return;
      }
      await sleep(400);
      const photos = await albumPhotos(it.album.id);
      if (!photos.length) throw new Error("álbum sin fotos");
      const images: string[] = [];
      for (const [i, url] of photos.entries()) {
        await sleep(250);
        images.push(await copyPhoto(url, `Football/${it.slug}/${i}.${url.split(".").pop()!.replace("jpeg", "jpg")}`));
      }
      await withDbRetry(() =>
        prisma.product.create({
          data: {
            name: it.name, slug: it.slug, team: it.brand, league: LEAGUE, season: null, type: it.type,
            isRetro: false, isLongSleeve: false, isNew: true, hasPlayer: false,
            images: JSON.stringify(images), sizes: JSON.stringify(it.sizes),
            priceFan: PRICE, pricePlayer: null, priceRetro: null, priceLongSleeve: null,
            isActive: !INACTIVE, isFeatured: false, isTrending: false, stock: 99,
          },
        })
      );
      results.push({ title: it.album.title, status: "creado", slug: it.slug });
    } catch (e) {
      errors++;
      results.push({ title: it.album.title, status: "error", detail: (e as Error).message });
    }
    const n = ++done;
    if (n % 25 === 0) {
      console.log(`  … ${n}/${create.length} (${errors} errores)`);
      writeFileSync(`backups/import-footwear-${stamp}.json`, JSON.stringify({ partial: true, results }, null, 1));
    }
  };
  const queue = [...create];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await processOne(queue.shift()!); }));
  writeFileSync(`backups/import-footwear-${stamp}.json`, JSON.stringify({ results, skipped }, null, 1));
  const created = results.filter((r) => r.status === "creado").length;
  console.log(`\n✓ Creados ${created}. Errores: ${errors}. Detalle: backups/import-footwear-${stamp}.json`);
}

main()
  .catch((e) => { console.error("✗", e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
