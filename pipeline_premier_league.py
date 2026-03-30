#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline completo Premier League:
1. Descarga fotos de Yupoo → public/products/Premier League/
2. Importa productos a la BD con league='Premier League'
3. Sube fotos a Supabase Storage
4. Actualiza URLs en la BD
5. Actualiza frontend (CatalogoFilters, page.tsx, catalogo/page.tsx)
6. Git push
"""
import sys, os, re, time, json, mimetypes, urllib.parse, subprocess
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── Auto-instalar dependencias ───────────────────────────────────────────────
def instalar(pkg):
    subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])

for mod, pkg in [("requests","requests"),("bs4","beautifulsoup4"),
                  ("psycopg2","psycopg2-binary"),("dotenv","python-dotenv")]:
    try:
        __import__(mod)
    except ImportError:
        instalar(pkg)

import requests
from bs4 import BeautifulSoup
import psycopg2, psycopg2.extras
from dotenv import load_dotenv
from urllib.parse import urljoin

# ─── Config ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
load_dotenv(dotenv_path=SCRIPT_DIR / ".env")

SUPABASE_URL   = os.environ["SUPABASE_URL"]
SERVICE_KEY    = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL   = os.environ["DATABASE_URL"]
BUCKET         = "products"
BASE_URL       = "https://home-jersey.x.yupoo.com"
CATEGORY_URL   = "https://home-jersey.x.yupoo.com/categories/779985"
LEAGUE_NAME    = "Premier League"
LEAGUE_FOLDER  = "Premier League"
LOCAL_ROOT     = Path(r"C:\Users\raer7\public\products")
LOCAL_DEST     = LOCAL_ROOT / LEAGUE_FOLDER
DELAY          = 1
STORAGE_BASE   = f"{SUPABASE_URL}/storage/v1"
PUBLIC_BASE    = f"{STORAGE_BASE}/object/public/{BUCKET}"
SUP_HEADERS    = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}
session = requests.Session()
session.headers.update(HEADERS)

def log(msg): print(msg, flush=True)

# ─── PASO 1: DESCARGA ─────────────────────────────────────────────────────────
def limpiar_nombre(n):
    n = re.sub(r'[\\/:*?"<>|]', "_", n).strip(". ")
    return n[:80] if n else "sin_nombre"

def get_pagina(url, intentos=3):
    for i in range(intentos):
        try:
            r = session.get(url, timeout=20)
            r.raise_for_status()
            r.encoding = r.apparent_encoding or "utf-8"
            return BeautifulSoup(r.text, "html.parser")
        except Exception as e:
            if i < intentos - 1:
                time.sleep(3)
            else:
                log(f"    [ERROR] {url}: {e}")
                return None

def hay_siguiente(soup, pag):
    for a in soup.find_all("a", href=True):
        cls = " ".join(a.get("class", []))
        if "pagination-button-next" in cls and "disabled" not in cls:
            return True
    for a in soup.find_all("a", href=True):
        if f"page={pag+1}" in a.get("href", ""):
            return True
    return False

def obtener_albumes(url_base):
    albumes, vistos, pag = [], set(), 1
    while True:
        url_pag = f"{url_base}?page={pag}" if pag > 1 else url_base
        log(f"  [descarga] Cargando álbumes página {pag}...")
        soup = get_pagina(url_pag)
        if not soup: break
        nuevos = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if not re.search(r"/albums/\d+", href): continue
            nombre = a.get("title","").strip() or a.get_text(strip=True)
            url_limpia = urljoin(BASE_URL, re.sub(r"\?.*","",href))
            url_full   = urljoin(BASE_URL, href)
            if nombre and url_limpia not in vistos:
                vistos.add(url_limpia)
                nuevos.append({"nombre": nombre, "url": url_full})
        if not nuevos: break
        albumes.extend(nuevos)
        log(f"  [descarga] {len(albumes)} álbumes hasta ahora")
        if not hay_siguiente(soup, pag): break
        pag += 1
    return albumes

def normalizar_foto(src):
    return re.sub(r"/(small|medium|square|thumb|tiny)\.jpg$", "/big.jpg", src, flags=re.I)

def obtener_fotos(url_album):
    fotos, hashes, pag = [], set(), 1
    if "?" in url_album:
        base_alb, params_str = url_album.split("?", 1)
        params_extra = f"&{params_str}"
    else:
        base_alb, params_extra = url_album, ""
    while True:
        url_pag = url_album if pag == 1 else f"{base_alb}?page={pag}{params_extra}"
        soup = get_pagina(url_pag)
        if not soup: break
        nuevas = []
        for img in soup.find_all("img"):
            for attr in ("src","data-src","data-original"):
                src = img.get(attr,"").strip()
                if not src or src.startswith("data:"): continue
                if "photo.yupoo.com" not in src: continue
                if any(x in src for x in ("logo","icon","policeIcon")): continue
                m = re.search(r"photo\.yupoo\.com/[^/]+/([a-f0-9]+)/", src)
                if not m: continue
                h = m.group(1)
                if h in hashes: continue
                hashes.add(h)
                nuevas.append(normalizar_foto(src))
                break
        if not nuevas: break
        fotos.extend(nuevas)
        if not hay_siguiente(soup, pag): break
        pag += 1
    return fotos

def descargar_imagen(url, dest, num, total):
    try:
        img_headers = {**HEADERS, "Referer": BASE_URL, "Accept": "image/webp,image/*,*/*;q=0.8"}
        r = session.get(url, headers=img_headers, timeout=30, stream=True)
        r.raise_for_status()
        ct = r.headers.get("Content-Type","image/jpeg")
        ext_map = {"image/jpeg":".jpg","image/png":".png","image/webp":".webp"}
        ext = ext_map.get(ct.split(";")[0].strip(), ".jpg")
        url_path = urllib.parse.urlparse(url).path
        if "." in url_path.split("/")[-1]:
            e = "." + url_path.split("/")[-1].split(".")[-1].lower()
            if e in (".jpg",".jpeg",".png",".webp"): ext = e
        archivo = dest / f"{num:03d}{ext}"
        with open(archivo, "wb") as f:
            for chunk in r.iter_content(8192):
                if chunk: f.write(chunk)
        return True
    except Exception as e:
        log(f"\n      [FALLO] foto {num}: {e}")
        return False

def paso1_descargar():
    log("\n" + "="*60)
    log("  PASO 1: DESCARGA DE FOTOS (Premier League)")
    log("="*60)
    LOCAL_DEST.mkdir(parents=True, exist_ok=True)

    albumes = obtener_albumes(CATEGORY_URL)
    log(f"\n  Total álbumes encontrados: {len(albumes)}")

    # Álbumes ya descargados (carpeta existe y tiene fotos)
    ya_descargados = {
        d.name for d in LOCAL_DEST.iterdir()
        if d.is_dir() and any(f.suffix.lower() in (".jpg",".jpeg",".png",".webp")
                              for f in d.iterdir())
    } if LOCAL_DEST.exists() else set()
    log(f"  Álbumes ya descargados: {len(ya_descargados)}")

    total_fotos = 0
    for i, album in enumerate(albumes, 1):
        nombre_carpeta = limpiar_nombre(album["nombre"])
        carpeta = LOCAL_DEST / nombre_carpeta
        if nombre_carpeta in ya_descargados:
            log(f"  [{i}/{len(albumes)}] SKIP (ya existe): {album['nombre']}")
            continue
        log(f"  [{i}/{len(albumes)}] Descargando: {album['nombre']}")
        fotos = obtener_fotos(album["url"])
        if not fotos:
            log(f"    [!] Sin fotos")
            continue
        carpeta.mkdir(parents=True, exist_ok=True)
        ok = 0
        for j, url_foto in enumerate(fotos, 1):
            if descargar_imagen(url_foto, carpeta, j, len(fotos)):
                ok += 1
            time.sleep(DELAY)
        log(f"    {ok}/{len(fotos)} fotos")
        total_fotos += ok

    log(f"\n  PASO 1 COMPLETO: {total_fotos} fotos descargadas")

# ─── PASO 2: IMPORTAR A BD ────────────────────────────────────────────────────
TYPE_KEYWORDS = [
    "Third Away","Third Home","Special Edition",
    "Goalkeeper Yellow","Goalkeeper White","Goalkeeper Green",
    "Goalkeeper Blue","Goalkeeper Red","Goalkeeper Orange","Goalkeeper",
    "Third","Away","Home",
    "Yellow","White","Red","Black","Blue","Green","Pink",
    "Purple","Orange","Gold","Grey","Navy",
]

def normalize_season(raw):
    return raw.replace("_","/").replace(re.search(r"^0(\d{2})/","0"+raw.split("_")[-1]).group() if False else "", "")

def parse_season(raw):
    s = raw.replace("_","/")
    # "003/04" -> "03/04"
    s = re.sub(r"^0(\d{2})/", r"\1/", s)
    return s

def parse_folder(folder_name):
    text = folder_name.strip()
    m = re.match(r"^(\d{2,3}[_/]\d{2})\s+", text)
    season = ""
    if m:
        season = parse_season(m.group(1))
        text = text[len(m.group(0)):].strip()
    is_retro = bool(re.search(r"\bretro\b", text, re.I))
    text = re.sub(r"\bretro\b", "", text, flags=re.I)
    text = re.sub(r"\blong\s+sleeve\b", "", text, flags=re.I)
    text = re.sub(r"\s{2,}", " ", text).strip()
    detected_type, team_text = "", text
    for kw in TYPE_KEYWORDS:
        pat = re.compile(r"\b" + kw.replace(" ", r"\s+") + r"\b\s*$", re.I)
        if pat.search(text):
            detected_type = kw
            team_text = pat.sub("", text).strip()
            break
    team = re.sub(r"^[-_\s]+|[-_\s]+$", "", re.sub(r"\s{2,}", " ", team_text).strip())
    return {
        "season": season,
        "team": team or folder_name,
        "type": detected_type or "Home",
        "isRetro": is_retro,
    }

def to_slug(text):
    import unicodedata
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text

def paso2_importar():
    log("\n" + "="*60)
    log("  PASO 2: IMPORTAR PRODUCTOS A BD")
    log("="*60)

    if not LOCAL_DEST.exists():
        log("  ERROR: Carpeta Premier League no existe")
        return

    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Slugs existentes
    cur.execute('SELECT slug FROM "Product"')
    used_slugs = {r["slug"] for r in cur.fetchall()}
    log(f"  Productos en BD: {len(used_slugs)}")

    # Borrar productos Premier League existentes para re-importar limpio
    cur.execute('DELETE FROM "Product" WHERE league = %s', (LEAGUE_NAME,))
    deleted = cur.rowcount
    conn.commit()
    log(f"  Productos PL eliminados (re-import): {deleted}")

    album_folders = sorted([d for d in LOCAL_DEST.iterdir() if d.is_dir()])
    log(f"  Álbumes a importar: {len(album_folders)}")

    created = 0
    errors = 0
    for folder in album_folders:
        photos = sorted([f for f in folder.iterdir()
                         if f.suffix.lower() in (".jpg",".jpeg",".png",".webp")])
        if not photos:
            log(f"  [SKIP] {folder.name} — sin fotos")
            continue

        images = [f"/products/{LEAGUE_FOLDER}/{folder.name}/{f.name}" for f in photos]
        p = parse_folder(folder.name)
        is_retro = p["isRetro"]
        name_parts = [p["season"], p["team"], p["type"]]
        if is_retro: name_parts.append("Retro")
        name = re.sub(r"\s{2,}", " ", " ".join(x for x in name_parts if x)).strip()

        slug_base = to_slug(name)
        slug = slug_base
        i = 2
        while slug in used_slugs:
            slug = f"{slug_base}-{i}"; i += 1
        used_slugs.add(slug)

        prices = {"price_retro": 170000, "price_fan": None, "price_player": None} if is_retro \
            else {"price_retro": None, "price_fan": 150000, "price_player": 180000}

        try:
            cur.execute("""
                INSERT INTO "Product"
                  (name, slug, team, league, season, type, "isRetro", images,
                   "hasPlayer", "isNew", "isActive", stock,
                   "priceRetro", "priceFan", "pricePlayer",
                   "isFeatured", "isTrending", "createdAt", "updatedAt")
                VALUES
                  (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
            """, (
                name, slug, p["team"], LEAGUE_NAME, p["season"] or None, p["type"], is_retro,
                json.dumps(images), not is_retro, not is_retro, True, 99,
                prices["price_retro"], prices["price_fan"], prices["price_player"],
                False, False,
            ))
            created += 1
            if created % 20 == 0:
                log(f"  {created}/{len(album_folders)} importados...")
        except Exception as e:
            log(f"  [ERROR] {folder.name}: {e}")
            errors += 1

    conn.commit()
    cur.close()
    conn.close()
    log(f"\n  PASO 2 COMPLETO: {created} productos, {errors} errores")

# ─── PASO 3: SUBIR FOTOS A SUPABASE ──────────────────────────────────────────
def upload_file(local_path, storage_path):
    mime = mimetypes.guess_type(str(local_path))[0] or "image/jpeg"
    with open(local_path, "rb") as f:
        data = f.read()
    encoded = urllib.parse.quote(storage_path, safe="/")
    for attempt in range(4):
        try:
            r = requests.post(
                f"{STORAGE_BASE}/object/{BUCKET}/{encoded}",
                headers={**SUP_HEADERS, "Content-Type": mime, "x-upsert": "true"},
                data=data, timeout=60,
            )
            return r.status_code in (200, 201)
        except Exception as e:
            if attempt < 3: time.sleep(2**attempt)
            else:
                log(f"  ERROR upload {Path(storage_path).name}: {e}")
                return False
    return False

def paso3_subir():
    log("\n" + "="*60)
    log("  PASO 3: SUBIR FOTOS A SUPABASE STORAGE")
    log("="*60)

    all_photos = []
    for album in sorted(LOCAL_DEST.iterdir()):
        if not album.is_dir(): continue
        for f in sorted(album.iterdir()):
            if f.suffix.lower() in (".jpg",".jpeg",".png",".webp"):
                storage = f"{LEAGUE_FOLDER}/{album.name}/{f.name}"
                all_photos.append((f, storage))

    log(f"  {len(all_photos)} fotos a subir")
    uploaded = failed = 0
    for i, (local, storage) in enumerate(all_photos, 1):
        ok = upload_file(local, storage)
        if ok: uploaded += 1
        else:
            failed += 1
            log(f"  FAIL [{i}]: {storage}")
        if i % 100 == 0 or i == len(all_photos):
            log(f"  Progreso: {i}/{len(all_photos)} OK:{uploaded} FAIL:{failed}")

    log(f"\n  PASO 3 COMPLETO: {uploaded} subidas, {failed} fallidas")

# ─── PASO 4: ACTUALIZAR URLs EN BD ───────────────────────────────────────────
def public_url(storage_path):
    return f"{PUBLIC_BASE}/{urllib.parse.quote(storage_path, safe='/')}"

def paso4_actualizar_urls():
    log("\n" + "="*60)
    log("  PASO 4: ACTUALIZAR URLs EN BD")
    log("="*60)
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('SELECT id, images FROM "Product" WHERE league = %s', (LEAGUE_NAME,))
    products = cur.fetchall()
    log(f"  {len(products)} productos a actualizar")

    updated = 0
    for i in range(0, len(products), 50):
        batch = products[i:i+50]
        for p in batch:
            imgs = json.loads(p["images"])
            new_imgs = []
            for img in imgs:
                if img.startswith("/products/"):
                    new_imgs.append(public_url(img[len("/products/"):]))
                else:
                    new_imgs.append(img)
            cur.execute('UPDATE "Product" SET images = %s WHERE id = %s',
                        (json.dumps(new_imgs), p["id"]))
            updated += 1
        conn.commit()
        log(f"  {updated}/{len(products)} actualizados")

    # Verificar 3 URLs
    cur.execute('SELECT name, images FROM "Product" WHERE league = %s LIMIT 3', (LEAGUE_NAME,))
    log("\n  Verificando URLs:")
    for row in cur.fetchall():
        imgs = json.loads(row["images"])
        url = imgs[0]
        try:
            r = requests.head(url, timeout=10)
            status = r.status_code
        except:
            status = "ERR"
        log(f"  {status} | {row['name'][:50]}")
    cur.close()
    conn.close()
    log(f"\n  PASO 4 COMPLETO: {updated} productos actualizados")

# ─── PASO 5: ACTUALIZAR FRONTEND ─────────────────────────────────────────────
def paso5_frontend():
    log("\n" + "="*60)
    log("  PASO 5: ACTUALIZAR FRONTEND")
    log("="*60)

    # CatalogoFilters.tsx
    filters_path = SCRIPT_DIR / "components/product/CatalogoFilters.tsx"
    txt = filters_path.read_text(encoding="utf-8")
    old = '"La Liga": "la-liga",\n  "New Season": "new-season",\n  Retro: "retro",'
    new_ = '"La Liga": "la-liga",\n  "New Season": "new-season",\n  Retro: "retro",\n  "Premier League": "premier-league",'
    if '"Premier League"' not in txt:
        txt = txt.replace(old, new_)
        filters_path.write_text(txt, encoding="utf-8")
        log("  CatalogoFilters.tsx actualizado")
    else:
        log("  CatalogoFilters.tsx ya tiene Premier League")

    # app/catalogo/page.tsx — slugToLeague: cambiar "premier-league": "Retro" → "Premier League"
    catalogo_path = SCRIPT_DIR / "app/catalogo/page.tsx"
    txt = catalogo_path.read_text(encoding="utf-8")
    old_slug = '"premier-league": "Retro",'
    new_slug = '"premier-league": "Premier League",'
    if old_slug in txt:
        txt = txt.replace(old_slug, new_slug)
        catalogo_path.write_text(txt, encoding="utf-8")
        log("  app/catalogo/page.tsx actualizado (slugToLeague)")
    else:
        log("  app/catalogo/page.tsx ya tiene mapeo correcto")

    # app/page.tsx — agregar Premier League a categories
    home_path = SCRIPT_DIR / "app/page.tsx"
    txt = home_path.read_text(encoding="utf-8")
    old_cats = '{ name: "Retro", subtitle: "Clásicas", slug: "retro", emoji: "⭐" },'
    new_cats = (
        '{ name: "Premier League", subtitle: "Inglaterra", slug: "premier-league", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },\n'
        '  { name: "Retro", subtitle: "Clásicas", slug: "retro", emoji: "⭐" },'
    )
    if '"premier-league"' not in txt:
        txt = txt.replace(old_cats, new_cats)
        home_path.write_text(txt, encoding="utf-8")
        log("  app/page.tsx actualizado (categories)")
    else:
        log("  app/page.tsx ya tiene Premier League")

    log("  PASO 5 COMPLETO")

# ─── PASO 6: GIT PUSH ─────────────────────────────────────────────────────────
def paso6_git():
    log("\n" + "="*60)
    log("  PASO 6: GIT PUSH")
    log("="*60)
    os.chdir(SCRIPT_DIR)
    subprocess.run(["git", "add", "-A"], check=True)
    msg = "Premier League: descargar fotos, importar BD, subir Supabase, actualizar frontend"
    subprocess.run(["git", "commit", "-m", msg], check=True)
    result = subprocess.run(["git", "push"], capture_output=True, text=True)
    if result.returncode == 0:
        log("  Git push exitoso")
    else:
        log(f"  Git push output: {result.stdout} {result.stderr}")
    log("  PASO 6 COMPLETO")

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log("=" * 60)
    log("  PIPELINE PREMIER LEAGUE - INICIO")
    log("=" * 60)

    t0 = time.time()
    paso1_descargar()
    paso2_importar()
    paso3_subir()
    paso4_actualizar_urls()
    paso5_frontend()
    paso6_git()

    elapsed = int(time.time() - t0)
    log(f"\n{'='*60}")
    log(f"  PIPELINE COMPLETO en {elapsed//60}m {elapsed%60}s")
    log("=" * 60)
