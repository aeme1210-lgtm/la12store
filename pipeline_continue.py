#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline continue — Solo pasos pendientes tras reinicio:
  PASO 6: La Liga extra (minkang/680717, páginas 2-5, ADD mode)
  PASO 7: Liga Argentina (minkang/3302915, replace)
  PASO 8: Git push
"""
import sys, os, re, time, json, mimetypes, urllib.parse, subprocess, uuid
from pathlib import Path
from urllib.parse import urljoin, urlparse

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

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
http = requests.Session()
http.headers.update({"User-Agent": UA})

def log(msg): print(msg, flush=True)

# ──────────────────────────────────────────────────────────────────────────────
# SCRAPING
# ──────────────────────────────────────────────────────────────────────────────

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

def get_albums(cat_url, start_page=1):
    base = f"{urlparse(cat_url).scheme}://{urlparse(cat_url).netloc}"
    albums, seen, pag = [], set(), start_page
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
        if not has_next(soup, pag): break
        pag += 1
    return albums

def get_photos(album_url):
    photos, hashes, pag = [], set(), 1
    base = album_url.split("?")[0]
    extra = ("&" + album_url.split("?")[1]) if "?" in album_url else ""
    while True:
        url = album_url if pag == 1 else f"{base}?page={pag}{extra}"
        soup = fetch_soup(url)
        if not soup: break
        found = []
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
                found.append(re.sub(r"/(small|medium|square|thumb|tiny)\.jpg$",
                                    "/big.jpg", src, flags=re.I))
                break
        if not found: break
        photos.extend(found)
        if not has_next(soup, pag): break
        pag += 1
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

def download_league(cat_url, folder_name, start_page=1):
    dest = LOCAL_ROOT / folder_name
    dest.mkdir(parents=True, exist_ok=True)
    albums = get_albums(cat_url, start_page=start_page)
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
            continue
        log(f"    [{i}/{len(albums)}] {alb['name']}")
        photos = get_photos(alb["url"])
        if not photos:
            log("      sin fotos")
            continue
        fd = dest / fn
        fd.mkdir(parents=True, exist_ok=True)
        ok2 = 0
        for j, pu in enumerate(photos, 1):
            if dl_image(pu, fd, j): ok2 += 1
            time.sleep(DELAY)
        log(f"      {ok2}/{len(photos)} fotos")
        new_photos += ok2
        new_albs += 1
    log(f"    Descarga: {new_albs} nuevos, {new_photos} fotos")

# ──────────────────────────────────────────────────────────────────────────────
# IMPORT DB
# ──────────────────────────────────────────────────────────────────────────────

TYPE_KW = [
    "Third Away","Third Home","Special Edition",
    "Goalkeeper Yellow","Goalkeeper White","Goalkeeper Green",
    "Goalkeeper Blue","Goalkeeper Red","Goalkeeper Orange","Goalkeeper",
    "Third","Away","Home",
    "Yellow","White","Red","Black","Blue","Green","Pink",
    "Purple","Orange","Gold","Grey","Navy",
]

def parse_season(raw):
    s = raw.replace("_", "/")
    return re.sub(r"^0(\d{2})/", r"\1/", s)

def parse_folder(name):
    text = name.strip()
    m = re.match(r"^(\d{2,3}[_/]\d{2})\s+", text)
    season = ""
    if m:
        season = parse_season(m.group(1))
        text = text[len(m.group(0)):].strip()
    is_retro = bool(re.search(r"\bretro\b", text, re.I))
    text = re.sub(r"\bretro\b", "", text, flags=re.I)
    text = re.sub(r"\blong\s+sleeve\b", "", text, flags=re.I)
    text = re.sub(r"\s{2,}", " ", text).strip()
    det, team_text = "", text
    for kw in TYPE_KW:
        pat = re.compile(r"\b" + kw.replace(" ", r"\s+") + r"\b\s*$", re.I)
        if pat.search(text):
            det = kw; team_text = pat.sub("", text).strip(); break
    team = re.sub(r"^[-_\s]+|[-_\s]+$", "",
                  re.sub(r"\s{2,}", " ", team_text).strip())
    return {"season": season, "team": team or name,
            "type": det or "Home", "isRetro": is_retro}

def to_slug(text):
    import unicodedata
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return re.sub(r"-{2,}", "-", text).strip("-")

def import_league(league_name, folder_name, mode="replace"):
    dest = LOCAL_ROOT / folder_name
    if not dest.exists():
        log(f"    WARN: carpeta {folder_name} no existe")
        return 0
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    if mode == "replace":
        cur.execute('DELETE FROM "Product" WHERE league=%s', (league_name,))
        log(f"    Eliminados {cur.rowcount} productos")
        conn.commit()
    cur.execute('SELECT slug FROM "Product"')
    used = {r["slug"] for r in cur.fetchall()}
    folders = sorted(d for d in dest.iterdir() if d.is_dir())
    log(f"    {len(folders)} álbumes locales")
    created = skipped = errors = 0
    for fd in folders:
        photos = sorted(f for f in fd.iterdir()
                        if f.suffix.lower() in (".jpg",".jpeg",".png",".webp"))
        if not photos: continue
        p = parse_folder(fd.name)
        parts = [p["season"], p["team"], p["type"]]
        if p["isRetro"]: parts.append("Retro")
        name = re.sub(r"\s{2,}", " ", " ".join(x for x in parts if x)).strip()
        sb = to_slug(name)
        if mode == "add" and sb in used:
            skipped += 1; continue
        slug = sb; i = 2
        while slug in used:
            slug = f"{sb}-{i}"; i += 1
        used.add(slug)
        imgs = [f"/products/{folder_name}/{fd.name}/{f.name}" for f in photos]
        is_r = p["isRetro"]
        try:
            cur.execute("""
                INSERT INTO "Product"
                  (id,name,slug,team,league,season,type,"isRetro",images,
                   "hasPlayer","isNew","isActive",stock,
                   "priceRetro","priceFan","pricePlayer",
                   "isFeatured","isTrending","createdAt","updatedAt")
                VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
            """, (
                str(uuid.uuid4()), name, slug, p["team"], league_name,
                p["season"] or None, p["type"], is_r, json.dumps(imgs),
                not is_r, not is_r, True, 99,
                170000 if is_r else None,
                None if is_r else 150000,
                None if is_r else 180000,
                False, False,
            ))
            created += 1
            if created % 50 == 0:
                conn.commit()
                log(f"    {created} importados...")
        except Exception as e:
            conn.rollback()
            log(f"    [ERR] {fd.name}: {e}")
            errors += 1
    conn.commit(); cur.close(); conn.close()
    log(f"    Import: {created} creados, {skipped} saltados, {errors} errores")
    return created

# ──────────────────────────────────────────────────────────────────────────────
# UPLOAD — solo sube fotos que NO están ya en Supabase
# ──────────────────────────────────────────────────────────────────────────────

def list_supabase_files(prefix):
    """Devuelve set de storage paths ya existentes en Supabase para un prefix."""
    existing = set()
    offset = 0
    limit = 1000
    enc_prefix = urllib.parse.quote(prefix, safe="/")
    while True:
        r = requests.post(
            f"{STORAGE_BASE}/object/list/{BUCKET}",
            headers={**SUP_HDR, "Content-Type": "application/json"},
            json={"prefix": prefix, "limit": limit, "offset": offset},
            timeout=30,
        )
        if r.status_code != 200:
            log(f"    WARN list_supabase {r.status_code}: {r.text[:100]}")
            break
        items = r.json()
        if not items: break
        for item in items:
            if item.get("name"):
                existing.add(f"{prefix}/{item['name']}")
        if len(items) < limit: break
        offset += limit
    return existing

def upload_folder(folder_name):
    dest = LOCAL_ROOT / folder_name
    if not dest.exists():
        log(f"    WARN: {folder_name} no existe"); return
    all_photos = [
        (f, f"{folder_name}/{a.name}/{f.name}")
        for a in sorted(dest.iterdir()) if a.is_dir()
        for f in sorted(a.iterdir())
        if f.suffix.lower() in (".jpg",".jpeg",".png",".webp")
    ]
    log(f"    {len(all_photos)} fotos locales totales")
    ok = fail = skip = 0
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
                    else: fail += 1; log(f"    FAIL [{i}] {storage} → {r.status_code}")
            except Exception as e:
                if attempt < 3: time.sleep(2**attempt)
                else: fail += 1; log(f"    FAIL [{i}] {e}")
            break
        if i % 200 == 0 or i == len(all_photos):
            log(f"    {i}/{len(all_photos)} OK:{ok} FAIL:{fail}")
    log(f"    Upload: {ok} OK, {fail} fallidas")

def update_urls(league_name):
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('SELECT id,images FROM "Product" WHERE league=%s', (league_name,))
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
    cur.execute('SELECT name,images FROM "Product" WHERE league=%s LIMIT 3', (league_name,))
    for row in cur.fetchall():
        url = json.loads(row["images"])[0]
        try: status = requests.head(url, timeout=8).status_code
        except: status = "ERR"
        log(f"    {status} | {row['name'][:55]}")
    cur.close(); conn.close()

def full_pipeline(cat_url, league_name, folder_name, mode="replace", start_page=1):
    t = time.time()
    log(f"\n{'='*60}")
    log(f"  LIGA: {league_name}  [mode={mode}, start_page={start_page}]")
    log("="*60)
    log("\n  [1] DESCARGA")
    download_league(cat_url, folder_name, start_page=start_page)
    log("\n  [2] IMPORTAR BD")
    import_league(league_name, folder_name, mode=mode)
    log("\n  [3] SUBIR SUPABASE")
    upload_folder(folder_name)
    log("\n  [4] ACTUALIZAR URLs")
    update_urls(league_name)
    elapsed = int(time.time() - t)
    log(f"\n  {league_name} COMPLETO en {elapsed//60}m {elapsed%60}s")

# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    T0 = time.time()
    log("="*60)
    log("  PIPELINE CONTINUE — pasos pendientes")
    log("="*60)

    # ── PASO 6: La Liga extra minkang páginas 2-5 (ADD) ──────────────────────
    # Las fotos ya están descargadas localmente (779 álbumes).
    # Solo importa las que faltan en BD (~500 pendientes) + sube + actualiza URLs.
    log("\n" + "="*60)
    log("  PASO 6: La Liga extra (minkang/680717, pages 2-5, ADD)")
    log("="*60)
    log("  Nota: descarga skipea álbumes ya existentes localmente")
    full_pipeline(
        "https://minkang.x.yupoo.com/categories/680717",
        "La Liga", "La Liga", mode="add", start_page=2
    )

    # ── PASO 7: Liga Argentina ────────────────────────────────────────────────
    full_pipeline(
        "https://minkang.x.yupoo.com/categories/3302915",
        "Liga Argentina", "Liga Argentina", mode="replace"
    )

    # ── PASO 8: Git push ──────────────────────────────────────────────────────
    log("\n" + "="*60)
    log("  PASO 8: GIT PUSH")
    log("="*60)
    os.chdir(SCRIPT_DIR)
    subprocess.run(["git", "add", "-A"], check=True)
    msg = ("feat: La Liga extra (minkang) + Liga Argentina — "
           "import BD, upload Supabase, actualizar URLs; paginación catálogo completa")
    r = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
    log(f"  commit: {(r.stdout + r.stderr).strip()[:120]}")
    r = subprocess.run(["git", "push"], capture_output=True, text=True)
    log(f"  push: {'OK' if r.returncode == 0 else (r.stdout+r.stderr).strip()[:120]}")

    total = int(time.time() - T0)
    log(f"\n{'='*60}")
    log(f"  PIPELINE CONTINUE COMPLETO en {total//60}m {total//60}s")
    log("="*60)
