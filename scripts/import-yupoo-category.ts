/**
 * Importa una categoría completa de Yupoo al catálogo, clasificada por año.
 *
 * Uso:
 *   npx tsx scripts/import-yupoo-category.ts --category <url> --pages 1-4            # PLAN (no escribe)
 *   npx tsx scripts/import-yupoo-category.ts --category <url> --pages 1-4 --execute  # importa
 *
 * Clasificación por año (título del álbum):
 *   - "Retro …"                 → liga "Retro", isRetro, temporada histórica (9697 → 1996/97)
 *   - 2627 / 2728 / 2027        → liga "Temporada 26/27"
 *   - 2026 + selección nacional → liga "Mundial FIFA 2026"
 *   - 2026 + club               → liga "Temporada 26/27"
 *   - 2526                      → liga "New Season"
 *   - sin año                   → "Selecciones Nacionales" u "Other Clubs"
 *
 * Nombres, equipo, tipo y versión salen de las mismas reglas de la
 * normalización (scripts/catalog-rules.ts), así que llegan ya en español y
 * limpios ("Real Madrid Entrenamiento 2026/27 · Verde").
 *
 * Duplicados: se salta un álbum si ya existe un producto ACTIVO con el mismo
 * nombre (o el mismo nombre + su detalle distintivo). Si el nombre choca pero
 * el álbum trae un detalle propio (color, "Players", "Crop top"…), se crea
 * con ese detalle en el nombre.
 *
 * Seguridad (igual que scripts/import-2627.ts):
 *   - Solo INSERT. Nunca actualiza ni borra productos existentes.
 *   - Fotos descargadas de Yupoo y subidas al bucket propio `products`
 *     (Pandasport/<slug>/<n>.jpg) — nada enlazado a Yupoo.
 *   - Reanudable: si se corta, al volver a correr salta lo ya creado (slug).
 *   - Se detiene si la tasa de error supera 30% tras 30 álbumes.
 *   - Resultado álbum por álbum en backups/import-yupoo-<fecha>.json.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { mkdirSync, writeFileSync } from "fs";
import { canonicalTeam, descriptor, proposeProduct, slugify, strip } from "./catalog-rules";

const arg = (f: string) => {
  const i = process.argv.indexOf(f);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const CATEGORY = arg("--category") ?? "https://pandasportjersey.x.yupoo.com/categories/545635";
const PAGES = (arg("--pages") ?? "1-4").split("-").map(Number);
const [P_FROM, P_TO] = [PAGES[0], PAGES[1] ?? PAGES[0]];
const EXECUTE = process.argv.includes("--execute");
/** Fuerza la liga de todo lo que no sea retro (p. ej. "Temporada 26/27"). */
const LEAGUE_OVERRIDE = arg("--league");
const MAX_PHOTOS = 6;
const BUCKET = "products";
const SUPABASE_HOST = "chljxifjjzaffvwixtfm.supabase.co";
const ORIGIN = new URL(CATEGORY).origin;
// Carpeta por proveedor: pandasportjersey → "Pandasport", todojerseys → "Todojerseys".
const FOLDER = (() => {
  const sub = new URL(CATEGORY).hostname.split(".")[0].replace(/jersey$/, "");
  return sub[0].toUpperCase() + sub.slice(1);
})();

/**
 * Títulos de proveedores como todojerseys traen texto de mayorista y
 * abreviaturas: "BAR PV special Soccer Jersey 26 27 todojerseys yupoo maglia
 * calcio/maillot football/camiseta futbol". Se normalizan antes de clasificar.
 */
function preprocessTitle(t: string): string {
  return t
    .replace(/\btodojerseys\b.*$/i, "")
    // Caracteres chinos y la talla duplicada que los acompaña ("休达 主场 S--4XL").
    .replace(/[　-鿿＀-￯]+[^A-Za-z]*/g, " ")
    // Código de fábrica pegado a la temporada: "26 27-hongpin", "26 -678".
    .replace(/(\d)\s*-\s*[a-z0-9]+\b(?!\s*\d)/gi, (m, d) => (/^\d+\s*-\s*\d{2}$/.test(m) ? m : `${d} `))
    .replace(/\badd\+\$\d+/gi, "")
    .replace(/\bAT\s*Madrid\b/gi, "Atletico Madrid")
    .replace(/\bLamine Yamal x Barcelona\b/gi, "Barcelona Lamine Yamal")
    .replace(/\bMiami x Argentina\b/gi, "Inter Miami Argentina")
    .replace(/\bParis x AJ\b/gi, "PSG Jordan")
    .replace(/\b(?:Bar|Barcelona)\s+x\s+/gi, "Barcelona ")
    .replace(/\b(maglia calcio|maillot football|camiseta futbol)\b/gi, "")
    .replace(/\bPV\b/g, "Player Version")
    .replace(/\bLS\b/g, "Long Sleeve")
    .replace(/\bBAR\b|\bBar\b(?= (GK|PV|Player|special|home|away|third))/g, "Barcelona")
    .replace(/\bLe Coruna\b/gi, "Deportivo La Coruna")
    .replace(/\bel classico\b/gi, "")
    .replace(/\bsoccer\b|\bjerseys?\b|\bfanpack\b|\bfanwear\b/gi, " ")
    .replace(/-S-?(\d?XL)\b/gi, " S-$1")
    .replace(/\bS\s*[-—–]{1,2}\s*\d?X+L\b/gi, " ")
    // "BOCHUM", "STUTTGART" → "Bochum"; siglas cortas (PSG, AC) se respetan.
    .replace(/\b[A-Z]{4,}\b/g, (w) => w[0] + w.slice(1).toLowerCase())
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Reintenta operaciones de BD ante cortes de red (P1001 / "Can't reach database"). */
async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const msg = String((e as Error).message);
      const transient = /reach database|P1001|ECONNRESET|ETIMEDOUT|DatabaseNotReachable|Connection terminated/i.test(msg);
      if (!transient || attempt >= 6) throw e;
      console.log(`  (BD no responde, reintento ${attempt}/5 en ${10 * attempt}s)`);
      await sleep(10000 * attempt);
    }
  }
}
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Selecciones nacionales (nombres canónicos de lib/team-aliases.ts y otros). */
const NATIONAL = new Set([
  "Argentina", "Brasil", "Colombia", "México", "Alemania", "Italia", "Francia", "España", "Inglaterra",
  "Portugal", "Países Bajos", "Japón", "Bélgica", "Suiza", "Perú", "Camerún", "Turquía", "Estados Unidos",
  "Canadá", "Uruguay", "Chile", "Ecuador", "Croacia", "Dinamarca", "Escocia", "Nigeria", "Marruecos",
  "Corea del Sur", "Suecia", "Noruega", "Gales", "Irlanda", "Túnez", "Argelia", "Haití", "Senegal",
  "Jamaica", "Guatemala", "Sudáfrica", "Paraguay", "Venezuela", "Bolivia", "Costa Rica", "Panamá",
  "Honduras", "Egipto", "Ghana", "Costa de Marfil", "Australia", "Arabia Saudita", "Irán", "Qatar",
  "Austria", "Polonia", "Serbia", "Ucrania", "Grecia", "Rusia", "República Checa", "Albania", "Curazao",
  "Uzbekistán", "Jordania", "Cabo Verde", "Nueva Zelanda", "Islandia", "Hungría", "Rumania", "Eslovaquia",
]);

interface Album {
  id: string;
  title: string;
}

// ── 1. Listado de álbumes (la categoría se sirve renderizada en el servidor) ──

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Referer: `${ORIGIN}/` }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').trim();

async function listAlbums(): Promise<Album[]> {
  const out: Album[] = [];
  const seen = new Set<string>();
  for (let p = P_FROM; p <= P_TO; p++) {
    const html = await fetchText(`${CATEGORY}?page=${p}`);
    const re = /<a[^>]*?(?:title="([^"]*)"[^>]*?href="\/albums\/(\d+)[^"]*"|href="\/albums\/(\d+)[^"]*"[^>]*?title="([^"]*)")/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const id = m[2] || m[3];
      const title = decode(m[1] || m[4] || "");
      if (!id || !title || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, title });
    }
    await sleep(500);
  }
  return out;
}

// ── 2. Clasificación por año ────────────────────────────────────────────────

/** "2627" → "2026/27", "9697" → "1996/97", "2026" → "2026" (año calendario). */
function seasonFromToken(tok: string): string | null {
  if (!/^\d{4}$/.test(tok)) return null;
  const a = tok.slice(0, 2), b = tok.slice(2);
  if (a === "19" || a === "20") return tok;
  if ((Number(a) + 1) % 100 === Number(b)) return `${Number(a) >= 50 ? "19" : "20"}${a}/${b}`;
  return null;
}

function sizesFor(title: string): string[] {
  if (/kids?\s*kit|size\s*16|\bkids?\b/i.test(title)) return ["16", "18", "20", "22", "24", "26", "28"];
  if (/baby/i.test(title)) return ["6-9M", "9-12M", "12-18M", "18-24M"];
  const m = title.match(/\bS-?(\d?)XL\b|\bS-(XXL)\b/i);
  const top = m?.[2] ? "2XL" : m?.[1] ? `${Math.min(Number(m[1]), 4)}XL` : "2XL";
  const order = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const idx = order.indexOf(top === "1XL" ? "XL" : top);
  return order.slice(0, idx === -1 ? 5 : idx + 1);
}

function classify(album: Album) {
  const raw = preprocessTitle(album.title);
  const isRetro = /\bretro\b/i.test(raw);
  // Colaboraciones "Venezia FC x NOCTA", "Travis Scott Cactus Jack x NK Norway":
  // el equipo es la parte que es club/selección; el resto queda como detalle.
  const forTeam = raw
    .replace(/^retro\s+/i, "")
    .replace(/^travis scott cactus jack x (nk )?/i, "")
    .replace(/\s+x\s+(nocta|adidas|nike|puma|kappa|nk)\b/i, "")
    // "Messi commemorative" sin otro equipo → Argentina; "Miami Messi" → Inter Miami (alias).
    .replace(/^messi\b/i, "Argentina");
  const team = canonicalTeam(forTeam, forTeam).team;

  // "2627", "26 27", "26-27", "2026" → temporada.
  const pair = raw.match(/\b(\d{2})[\s-](\d{2})\b/);
  const pairTok = pair && (Number(pair[1]) + 1) % 100 === Number(pair[2]) ? `${pair[1]}${pair[2]}` : null;
  const tok = pairTok ?? (raw.match(/\b(\d{4})\b/) ?? [])[1];
  const season = tok ? seasonFromToken(tok) : null;
  const isNational = NATIONAL.has(team);

  let league: string;
  if (isRetro) league = "Retro";
  else if (LEAGUE_OVERRIDE) league = LEAGUE_OVERRIDE;
  else if (season && /^(2026\/27|2027\/28|2027)$/.test(season)) league = "Temporada 26/27";
  else if (season === "2026") league = isNational ? "Mundial FIFA 2026" : "Temporada 26/27";
  else if (season === "2025/26") league = "New Season";
  else league = isNational ? "Selecciones Nacionales" : "Other Clubs";

  const isLongSleeve = /long[\s-]?sleeves?/i.test(raw);
  const input = {
    name: raw,
    team,
    type: "",
    // Liga forzada a 26/27 sin año en el título → temporada 2026/27.
    season: season ?? (LEAGUE_OVERRIDE === "Temporada 26/27" && !isRetro ? "2026/27" : null),
    isRetro,
    isLongSleeve,
    priceFan: null,
    priceRetro: null,
    priceLongSleeve: null,
  };
  const pr = proposeProduct(input);
  const finalSeason = input.season;
  // "crop top" y "Crop Jersey" son la misma prenda: top corto de mujer.
  const crop = /\bcrop\b/i.test(raw);
  const baseName = crop ? `Crop top ${pr.name.replace(/\s+Mujer$/, "")}` : pr.name;
  const isNew = !!finalSeason && /^(2026\/27|2026|2027|2027\/28)$/.test(finalSeason) && pr.audience === "Adulto" && pr.kind === "Camiseta" && !crop;

  return {
    album,
    team,
    league,
    season: finalSeason,
    type: pr.shirtType === "Edición especial" ? "Edición Especial" : pr.shirtType,
    isRetro,
    isLongSleeve,
    isNew,
    hasPlayer: !isRetro && pr.kind === "Camiseta" && pr.audience === "Adulto" && !crop,
    sizes: sizesFor(raw),
    baseName,
    detail: descriptor(raw.replace(/\b(crop|top|kit|jersey|polo|vest)\b/gi, " "), team),
  };
}
type Item = ReturnType<typeof classify> & { name: string; slug: string };

// ── 3. Plan: nombres finales y duplicados ──────────────────────────────────

/** Siglas o palabras sueltas que no permiten saber de qué equipo es la camiseta. */
const UNIDENTIFIED_TEAMS = new Set(["bf", "ca", "st island", "audi", "cropped", "victoria", "all", "james", "local", ""]);

async function buildPlan(albums: Album[]) {
  const existing = await withDbRetry(() => prisma.product.findMany({ where: { isActive: true }, select: { name: true, slug: true } }));
  // Comparación sin tildes ni mayúsculas: "SV Elversberg" = "sv Elversberg".
  const norm = (s: string) => strip(s).replace(/\s+/g, " ").trim();
  const existingNorm = existing.map((p) => norm(p.name));
  const existingNames = {
    has: (n: string) => existingNorm.includes(norm(n)),
    some: (pred: (n: string) => boolean) => existing.some((p) => pred(p.name)),
  };
  const taken = new Set((await withDbRetry(() => prisma.product.findMany({ select: { slug: true } }))).map((p) => p.slug));

  const items = albums.map(classify);
  const byBase = new Map<string, typeof items>();
  for (const it of items) byBase.set(it.baseName, [...(byBase.get(it.baseName) ?? []), it]);

  const create: Item[] = [];
  const skipped: { album: Album; reason: string }[] = [];
  const batchNames = new Set<string>();

  for (const it of items) {
    // No es fútbol, o no se puede identificar el equipo: no se crea (queda en el reporte).
    if (/\b(basketball|rugby|nba)\b/i.test(it.album.title)) {
      skipped.push({ album: it.album, reason: "no es camiseta de fútbol" });
      continue;
    }
    if (!it.team || /\d/.test(it.team) || UNIDENTIFIED_TEAMS.has(it.team.toLowerCase())) {
      skipped.push({ album: it.album, reason: `equipo no identificable ("${it.team}")` });
      continue;
    }
    const collidesInBatch = (byBase.get(it.baseName)?.length ?? 0) > 1;
    const collidesExisting =
      existingNames.has(it.baseName) || existingNames.some((n) => norm(n).startsWith(`${norm(it.baseName)} · `));
    let name = it.baseName;
    if (collidesInBatch || collidesExisting) {
      if (!it.detail) {
        if (collidesExisting) { skipped.push({ album: it.album, reason: `ya existe "${it.baseName}"` }); continue; }
      } else {
        name = `${it.baseName} · ${it.detail}`;
      }
    }
    if (existingNames.has(name)) { skipped.push({ album: it.album, reason: `ya existe "${name}"` }); continue; }
    if (batchNames.has(norm(name))) { skipped.push({ album: it.album, reason: `repetido en la categoría: "${name}"` }); continue; }
    batchNames.add(norm(name));

    const base = slugify(name) || `yupoo-${it.album.id}`;
    let slug = base;
    for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
    taken.add(slug);
    create.push({ ...it, name, slug });
  }
  return { create, skipped };
}

// ── 4. Fotos: Yupoo → bucket propio ─────────────────────────────────────────

async function albumPhotos(id: string): Promise<string[]> {
  const html = await fetchText(`${ORIGIN}/albums/${id}?uid=1`);
  const urls = [...html.matchAll(/data-src="(https:\/\/photo\.yupoo\.com\/[^"]+\/big\.(?:jpe?g|png|webp))"/g)].map((m) => m[1]);
  return [...new Set(urls)].slice(0, MAX_PHOTOS);
}

async function copyPhoto(url: string, path: string): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Referer: `${ORIGIN}/` }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.byteLength < 8000) throw new Error(`imagen sospechosa (${bytes.byteLength} bytes)`);
      const encoded = path.split("/").map(encodeURIComponent).join("/");
      const up = await fetch(`https://${SUPABASE_HOST}/storage/v1/object/${BUCKET}/${encoded}`, {
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
      return `https://${SUPABASE_HOST}/storage/v1/object/public/${BUCKET}/${encoded}`;
    } catch (e) {
      if (attempt === 3) throw e;
      await sleep(1000 * attempt);
    }
  }
  throw new Error("inalcanzable");
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync("backups", { recursive: true });
  const albums = await listAlbums();
  const { create, skipped } = await buildPlan(albums);

  const byLeague = create.reduce<Record<string, number>>((a, i) => ((a[i.league] = (a[i.league] ?? 0) + 1), a), {});
  console.log(`\n${EXECUTE ? "IMPORTANDO" : "PLAN (no escribe)"} — ${albums.length} álbumes`);
  console.log(`  A crear:   ${create.length}`, byLeague);
  console.log(`  Saltados:  ${skipped.length} (ya están en el catálogo o repetidos)`);
  for (const i of create.filter((_, k) => k % Math.max(1, Math.floor(create.length / 10)) === 0).slice(0, 10))
    console.log(`    · ${i.album.title}  →  ${i.name}  [${i.league}]`);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const report: Record<string, unknown> = { category: CATEGORY, pages: `${P_FROM}-${P_TO}`, albums: albums.length, skipped };

  if (!EXECUTE) {
    writeFileSync(`backups/import-yupoo-plan-${stamp}.json`, JSON.stringify({ ...report, create }, null, 1));
    console.log(`\nPlan: backups/import-yupoo-plan-${stamp}.json — para importar: --execute`);
    return;
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env");

  const before = await withDbRetry(() => prisma.product.count());
  const results: { album: string; title: string; status: string; slug?: string; detail?: string }[] = [];
  let errors = 0;
  // 4 álbumes en paralelo (antes 1): mismo resultado, ~4x más rápido.
  let done = 0;
  let aborted = false;
  const processOne = async (it: Item) => {
    try {
      if (await withDbRetry(() => prisma.product.findUnique({ where: { slug: it.slug } }))) {
        results.push({ album: it.album.id, title: it.album.title, status: "ya_creado", slug: it.slug });
        return;
      }
      await sleep(400);
      const photos = await albumPhotos(it.album.id);
      if (!photos.length) throw new Error("álbum sin fotos");
      const images: string[] = [];
      for (const [i, url] of photos.entries()) {
        await sleep(250);
        images.push(await copyPhoto(url, `${FOLDER}/${it.slug}/${i}.${url.split(".").pop()!.replace("jpeg", "jpg")}`));
      }
      await withDbRetry(() => prisma.product.create({
        data: {
          name: it.name,
          slug: it.slug,
          team: it.team,
          league: it.league,
          season: it.season,
          type: it.type,
          isRetro: it.isRetro,
          isLongSleeve: it.isLongSleeve,
          isNew: it.isNew,
          hasPlayer: it.hasPlayer,
          images: JSON.stringify(images),
          sizes: JSON.stringify(it.sizes),
          priceFan: it.isLongSleeve ? null : 150000,
          pricePlayer: it.isLongSleeve ? null : 180000,
          priceRetro: it.isRetro && !it.isLongSleeve ? 170000 : null,
          priceLongSleeve: it.isLongSleeve ? 185000 : null,
          isActive: true,
          isFeatured: false,
          isTrending: false,
          stock: 99,
        },
      }));
      results.push({ album: it.album.id, title: it.album.title, status: "creado", slug: it.slug, detail: `${images.length} fotos` });
    } catch (e) {
      errors++;
      results.push({ album: it.album.id, title: it.album.title, status: "error", detail: (e as Error).message });
    }
    const n = done++;
    if ((n + 1) % 20 === 0) {
      console.log(`  … ${n + 1}/${create.length} (${errors} errores)`);
      // Progreso parcial: si el proceso se corta, queda registro de lo hecho.
      writeFileSync(`backups/import-yupoo-${stamp}.json`, JSON.stringify({ ...report, before, partial: true, results }, null, 1));
    }
    if (n + 1 >= 30 && errors / (n + 1) > 0.3) {
      if (!aborted) console.error(`ABORTADO: tasa de error ${(100 * errors / (n + 1)).toFixed(0)}% > 30%`);
      aborted = true;
    }
  };
  const queue = [...create];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length && !aborted) await processOne(queue.shift()!);
    })
  );
  const after = await withDbRetry(() => prisma.product.count());
  writeFileSync(`backups/import-yupoo-${stamp}.json`, JSON.stringify({ ...report, before, after, results }, null, 1));
  console.log(`\n✓ Catálogo: ${before} → ${after} (+${after - before}). Errores: ${errors}.`);
  console.log(`Detalle: backups/import-yupoo-${stamp}.json`);
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
