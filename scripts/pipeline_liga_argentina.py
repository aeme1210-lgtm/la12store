#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Liga Argentina — pipeline completo
- Descarga 2 primeras fotos por álbum de minkang/3302915 (2 páginas)
- Importa en BD con league='Liga Argentina'
- Sube a Supabase Storage
- Actualiza URLs en BD
"""
import sys, os, re, time, json, mimetypes, urllib.parse, subprocess, uuid
from pathlib import Path
from urllib.parse import urljoin, urlparse

sys.path.insert(0, str(Path(__file__).parent))
from import_common import upsert_product  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def _pip(pkg):
    subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])

for mod, pkg in [("requests","requests"),("bs4","beautifulsoup4"),
                  ("psycopg2","psycopg2-binary"),("dotenv","python-dotenv")]:
    try: __import__(mod)
    except ImportError: _pip(pkg)

import requests
from bs4 import BeautifulSoup
import psycopg2, psycopg2.extras
from dotenv import load_dotenv

SCRIPT_DIR   = Path(__file__).parent
load_dotenv(dotenv_path=SCRIPT_DIR / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
BUCKET       = "products"
LOCAL_ROOT   = Path(r"C:\Users\raer7\public\products")
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1"
PUBLIC_BASE  = f"{STORAGE_BASE}/object/public/{BUCKET}"
SUP_HDR      = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}
DELAY        = 1
MAX_PHOTOS   = 2   # solo las 2 primeras fotos por álbum

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
http = requests.Session()
http.headers.update({"User-Agent": UA})

def log(msg): print(msg, flush=True)

# ── SCRAPING ──────────────────────────────────────────────────────────────────

def fetch_soup(url, retries=3):
    for i in range(retries):
        try:
            r = http.get(url, timeout=25)
            r.raise_for_status()
            r.encoding = r.apparent_encoding or "utf-8"
            return BeautifulSoup(r.text, "html.parser")
        except Exception as e:
            if i < retries - 1: time.sleep(3)
            else: log(f"  [ERR] {url}: {e}")
    return None

def has_next(soup, pag):
    for a in soup.find_all("a", href=True):
        if "pagination-button-next" in " ".join(a.get("class", [])) \
                and "disabled" not in " ".join(a.get("class", [])):
            return True
    for a in soup.find_all("a", href=True):
        if f"page={pag+1}" in a.get("href", ""):
            return True
    return False

def get_albums(cat_url, max_pages=None):
    base = f"{urlparse(cat_url).scheme}://{urlparse(cat_url).netloc}"
    albums, seen, pag = [], set(), 1
    while True:
        url = f"{cat_url}?page={pag}" if pag > 1 else cat_url
        log(f"    Página {pag}: scraping...")
        soup = fetch_soup(url)
        if not soup: break
        found = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if not re.search(r"/albums/\d+", href): continue
            name = a.get("title", "").strip() or a.get_text(strip=True)
            key  = urljoin(base, re.sub(r"\?.*", "", href))
            full = urljoin(base, href)
            if name and key not in seen:
                seen.add(key)
                found.append({"name": name, "url": full})
        if not found: break
        albums.extend(found)
        log(f"    {len(albums)} álbumes acumulados")
        if max_pages and pag >= max_pages: break
        if not has_next(soup, pag): break
        pag += 1
    return albums

def get_photos(album_url, limit=None):
    """Devuelve hasta `limit` fotos del álbum (solo página 1)."""
    photos, hashes = [], set()
    soup = fetch_soup(album_url)
    if not soup: return []
    for img in soup.find_all("img"):
        for attr in ("src", "data-src", "data-original"):
            src = img.get(attr, "").strip()
            if not src or src.startswith("data:"): continue
            if "photo.yupoo.com" not in src: continue
            if any(x in src for x in ("logo", "icon", "policeIcon")): continue
            m = re.search(r"photo\.yupoo\.com/[^/]+/([a-f0-9]+)/", src)
            if not m: continue
            h = m.group(1)
            if h in hashes: continue
            hashes.add(h)
            url = re.sub(r"/(small|medium|square|thumb|tiny)\.jpg$",
                         "/big.jpg", src, flags=re.I)
            photos.append(url)
            break
        if limit and len(photos) >= limit:
            break
    return photos

def clean_name(n):
    return (re.sub(r'[\\/:*?"<>|]', "_", n).strip(". ") or "sin_nombre")[:80]

def dl_image(url, dest, num):
    try:
        r = http.get(url, headers={"Referer": "https://www.yupoo.com/",
                                    "Accept": "image/*"},
                     timeout=30, stream=True)
        r.raise_for_status()
        ct = r.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
        ext = {"image/jpeg": ".jpg", "image/png": ".png",
               "image/webp": ".webp"}.get(ct, ".jpg")
        ue = "." + urlparse(url).path.split(".")[-1].lower()
        if ue in (".jpg", ".jpeg", ".png", ".webp"): ext = ue
        fp = dest / f"{num:03d}{ext}"
        with open(fp, "wb") as f:
            for chunk in r.iter_content(8192):
                if chunk: f.write(chunk)
        return True
    except Exception as e:
        log(f"    [FAIL foto {num}] {e}")
        return False

# ── DOWNLOAD ──────────────────────────────────────────────────────────────────

def paso_download():
    FOLDER = "Liga Argentina"
    dest = LOCAL_ROOT / FOLDER
    dest.mkdir(parents=True, exist_ok=True)
    CAT_URL = "https://minkang.x.yupoo.com/categories/3302915"
    albums = get_albums(CAT_URL, max_pages=2)
    log(f"    {len(albums)} álbumes encontrados")
    existing = {
        d.name for d in dest.iterdir()
        if d.is_dir() and any(f.suffix.lower() in (".jpg",".jpeg",".png",".webp")
                               for f in d.iterdir())
    }
    log(f"    {len(existing)} álbumes ya descargados")
    new_albs = new_photos = 0
    for i, alb in enumerate(albums, 1):
        fn = clean_name(alb["name"])
        if fn in existing:
            log(f"    [{i}/{len(albums)}] SKIP {alb['name']}")
            continue
        log(f"    [{i}/{len(albums)}] {alb['name']}")
        photos = get_photos(alb["url"], limit=MAX_PHOTOS)
        if not photos:
            log("      sin fotos")
            continue
        fd = dest / fn
        fd.mkdir(parents=True, exist_ok=True)
        ok2 = 0
        for j, pu in enumerate(photos[:MAX_PHOTOS], 1):
            if dl_image(pu, fd, j): ok2 += 1
            time.sleep(DELAY)
        log(f"      {ok2}/{len(photos[:MAX_PHOTOS])} fotos")
        new_photos += ok2
        new_albs += 1
    log(f"    Descarga: {new_albs} nuevos, {new_photos} fotos")

# ── IMPORT DB ─────────────────────────────────────────────────────────────────
# parse_folder/to_slug/upsert_product ahora viven en import_common.py (compartido
# entre los 5 pipelines). Ya NO se borra la liga completa antes de reimportar.

def paso_import():
    LEAGUE = "Liga Argentina"
    FOLDER = "Liga Argentina"
    dest = LOCAL_ROOT / FOLDER
    if not dest.exists():
        log(f"    ERROR: carpeta {FOLDER} no existe"); return 0
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    folders = sorted(d for d in dest.iterdir() if d.is_dir())
    log(f"    {len(folders)} álbumes locales")
    created = updated = errors = 0
    for fd in folders:
        photos = sorted(f for f in fd.iterdir()
                        if f.suffix.lower() in (".jpg",".jpeg",".png",".webp"))
        if not photos: continue
        imgs = [f"/products/{FOLDER}/{fd.name}/{f.name}" for f in photos]
        try:
            result = upsert_product(cur, LEAGUE, fd.name, imgs)
            if result == "created":
                created += 1
            else:
                updated += 1
            if (created + updated) % 50 == 0:
                conn.commit()
                log(f"    {created} creados, {updated} actualizados...")
        except Exception as e:
            conn.rollback()
            log(f"    [ERR] {fd.name}: {e}")
            errors += 1
    conn.commit(); cur.close(); conn.close()
    log(f"    Import: {created} creados, {updated} actualizados, {errors} errores")
    return created + updated

# ── UPLOAD ────────────────────────────────────────────────────────────────────

def paso_upload():
    FOLDER = "Liga Argentina"
    dest = LOCAL_ROOT / FOLDER
    if not dest.exists():
        log(f"    WARN: {FOLDER} no existe"); return
    all_photos = [
        (f, f"{FOLDER}/{a.name}/{f.name}")
        for a in sorted(dest.iterdir()) if a.is_dir()
        for f in sorted(a.iterdir())
        if f.suffix.lower() in (".jpg",".jpeg",".png",".webp")
    ]
    log(f"    {len(all_photos)} fotos a subir")
    ok = fail = 0
    for i, (local, storage) in enumerate(all_photos, 1):
        mime = mimetypes.guess_type(str(local))[0] or "image/jpeg"
        enc  = urllib.parse.quote(storage, safe="/")
        for attempt in range(4):
            try:
                r = requests.post(
                    f"{STORAGE_BASE}/object/{BUCKET}/{enc}",
                    headers={**SUP_HDR, "Content-Type": mime, "x-upsert": "true"},
                    data=local.read_bytes(), timeout=60,
                )
                if r.status_code in (200, 201): ok += 1; break
                else:
                    if attempt < 3: time.sleep(2**attempt)
                    else: fail += 1; log(f"    FAIL [{i}] {r.status_code}")
            except Exception as e:
                if attempt < 3: time.sleep(2**attempt)
                else: fail += 1; log(f"    FAIL [{i}] {e}")
            break
        if i % 100 == 0 or i == len(all_photos):
            log(f"    {i}/{len(all_photos)} OK:{ok} FAIL:{fail}")
    log(f"    Upload: {ok} OK, {fail} fallidas")

# ── UPDATE URLS ───────────────────────────────────────────────────────────────

def paso_update_urls():
    LEAGUE = "Liga Argentina"
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('SELECT id,images FROM "Product" WHERE league=%s', (LEAGUE,))
    products = cur.fetchall()
    log(f"    {len(products)} productos")
    updated = 0
    for i in range(0, len(products), 50):
        for p in products[i:i+50]:
            imgs = json.loads(p["images"])
            new  = [
                f"{PUBLIC_BASE}/{urllib.parse.quote(img[len('/products/'):], safe='/')}"
                if img.startswith("/products/") else img
                for img in imgs
            ]
            cur.execute('UPDATE "Product" SET images=%s WHERE id=%s',
                        (json.dumps(new), p["id"]))
            updated += 1
        conn.commit()
        log(f"    URLs: {updated}/{len(products)}")
    # spot check
    cur.execute('SELECT name,images FROM "Product" WHERE league=%s LIMIT 3', (LEAGUE,))
    for row in cur.fetchall():
        url = json.loads(row["images"])[0]
        try: status = requests.head(url, timeout=8).status_code
        except: status = "ERR"
        log(f"    {status} | {row['name'][:55]}")
    cur.close(); conn.close()

# ── MAIN ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    T0 = time.time()
    log("="*60)
    log("  LIGA ARGENTINA — pipeline completo")
    log("="*60)

    log("\n  [1/4] DESCARGA (max 2 fotos por álbum)")
    paso_download()

    log("\n  [2/4] IMPORTAR BD")
    paso_import()

    log("\n  [3/4] SUBIR SUPABASE")
    paso_upload()

    log("\n  [4/4] ACTUALIZAR URLs")
    paso_update_urls()

    total = int(time.time() - T0)
    log(f"\n  LIGA ARGENTINA COMPLETO en {total//60}m {total%60}s")
    log("="*60)
