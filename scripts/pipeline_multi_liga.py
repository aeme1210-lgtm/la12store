#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline multi-liga:
1. Verifica/completa Premier League (320 álbumes)
2. Descarga Serie A, Bundesliga, Selecciones, Brasileirao
3. Para cada liga: importa BD → sube Supabase → actualiza URLs
4. Actualiza frontend (CatalogoFilters + catalogo/page.tsx)
5. Git push
"""
import sys, os, re, time, json, mimetypes, urllib.parse, subprocess, uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from import_common import upsert_product  # noqa: E402

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

# ─── Config global ────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
load_dotenv(dotenv_path=SCRIPT_DIR / ".env")

SUPABASE_URL  = os.environ["SUPABASE_URL"]
SERVICE_KEY   = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL  = os.environ["DATABASE_URL"]
BUCKET        = "products"
BASE_URL      = "https://home-jersey.x.yupoo.com"
LOCAL_ROOT    = Path(r"C:\Users\raer7\public\products")
STORAGE_BASE  = f"{SUPABASE_URL}/storage/v1"
PUBLIC_BASE   = f"{STORAGE_BASE}/object/public/{BUCKET}"
SUP_HEADERS   = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}
DELAY         = 1

# Liga config: (category_url, league_name_in_db, local_folder)
LIGAS = [
    ("https://home-jersey.x.yupoo.com/categories/779985",  "Premier League",  "Premier League"),
    ("https://home-jersey.x.yupoo.com/categories/779989",  "Serie A",         "Serie A"),
    ("https://home-jersey.x.yupoo.com/categories/779999",  "Bundesliga",      "Bundesliga"),
    ("https://home-jersey.x.yupoo.com/categories/4770173", "Selecciones",     "Selecciones"),
    ("https://home-jersey.x.yupoo.com/categories/779994",  "Brasileirao",     "Brasileirao"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}
session = requests.Session()
session.headers.update(HEADERS)

def log(msg): print(msg, flush=True)

# ─── SCRAPING ─────────────────────────────────────────────────────────────────
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
        log(f"    Cargando álbumes página {pag}...")
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
        log(f"    {len(albumes)} álbumes hasta ahora")
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

def descargar_imagen(url, dest, num):
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
        log(f"      [FALLO] foto {num}: {e}")
        return False

def descargar_liga(category_url, league_folder):
    local_dest = LOCAL_ROOT / league_folder
    local_dest.mkdir(parents=True, exist_ok=True)

    albumes = obtener_albumes(category_url)
    log(f"    Total álbumes encontrados: {len(albumes)}")

    ya_descargados = {
        d.name for d in local_dest.iterdir()
        if d.is_dir() and any(f.suffix.lower() in (".jpg",".jpeg",".png",".webp")
                              for f in d.iterdir())
    } if local_dest.exists() else set()
    log(f"    Álbumes ya descargados: {len(ya_descargados)}")

    total_fotos = nuevos_albumes = 0
    for i, album in enumerate(albumes, 1):
        nombre_carpeta = limpiar_nombre(album["nombre"])
        carpeta = local_dest / nombre_carpeta
        if nombre_carpeta in ya_descargados:
            continue
        log(f"    [{i}/{len(albumes)}] Descargando: {album['nombre']}")
        fotos = obtener_fotos(album["url"])
        if not fotos:
            log(f"      [!] Sin fotos")
            continue
        carpeta.mkdir(parents=True, exist_ok=True)
        ok = 0
        for j, url_foto in enumerate(fotos, 1):
            if descargar_imagen(url_foto, carpeta, j):
                ok += 1
            time.sleep(DELAY)
        log(f"      {ok}/{len(fotos)} fotos")
        total_fotos += ok
        nuevos_albumes += 1

    log(f"    Descarga completa: {nuevos_albumes} álbumes nuevos, {total_fotos} fotos nuevas")
    return len(albumes)

# ─── IMPORTAR A BD ────────────────────────────────────────────────────────────
# parse_folder/to_slug/upsert_product ahora viven en import_common.py (compartido
# entre los 5 pipelines). Ya NO se borra la liga completa antes de reimportar.

def importar_liga(league_name, league_folder):
    local_dest = LOCAL_ROOT / league_folder
    if not local_dest.exists():
        log(f"    ERROR: Carpeta {league_folder} no existe, saltando importación")
        return 0

    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    album_folders = sorted([d for d in local_dest.iterdir() if d.is_dir()])
    log(f"    Álbumes a importar: {len(album_folders)}")

    created = updated = errors = 0
    for folder in album_folders:
        photos = sorted([f for f in folder.iterdir()
                         if f.suffix.lower() in (".jpg",".jpeg",".png",".webp")])
        if not photos:
            continue

        images = [f"/products/{league_folder}/{folder.name}/{f.name}" for f in photos]
        try:
            result = upsert_product(cur, league_name, folder.name, images)
            if result == "created":
                created += 1
            else:
                updated += 1
            if (created + updated) % 50 == 0:
                conn.commit()
                log(f"    {created} creados, {updated} actualizados / {len(album_folders)}...")
        except Exception as e:
            conn.rollback()
            log(f"    [ERROR] {folder.name}: {e}")
            errors += 1

    conn.commit()
    cur.close()
    conn.close()
    log(f"    Importación completa: {created} creados, {updated} actualizados, {errors} errores")
    return created + updated

# ─── SUBIR A SUPABASE ─────────────────────────────────────────────────────────
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
                log(f"    ERROR upload {Path(storage_path).name}: {e}")
                return False
    return False

def subir_liga(league_folder):
    local_dest = LOCAL_ROOT / league_folder
    if not local_dest.exists():
        log(f"    ERROR: Carpeta {league_folder} no existe")
        return

    all_photos = []
    for album in sorted(local_dest.iterdir()):
        if not album.is_dir(): continue
        for f in sorted(album.iterdir()):
            if f.suffix.lower() in (".jpg",".jpeg",".png",".webp"):
                storage = f"{league_folder}/{album.name}/{f.name}"
                all_photos.append((f, storage))

    log(f"    {len(all_photos)} fotos a subir")
    uploaded = failed = 0
    for i, (local, storage) in enumerate(all_photos, 1):
        ok = upload_file(local, storage)
        if ok: uploaded += 1
        else:
            failed += 1
            log(f"    FAIL [{i}]: {storage}")
        if i % 100 == 0 or i == len(all_photos):
            log(f"    Progreso: {i}/{len(all_photos)} OK:{uploaded} FAIL:{failed}")

    log(f"    Subida completa: {uploaded} OK, {failed} fallidas")

# ─── ACTUALIZAR URLs EN BD ────────────────────────────────────────────────────
def public_url(storage_path):
    return f"{PUBLIC_BASE}/{urllib.parse.quote(storage_path, safe='/')}"

def actualizar_urls_liga(league_name):
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('SELECT id, images FROM "Product" WHERE league = %s', (league_name,))
    products = cur.fetchall()
    log(f"    {len(products)} productos a actualizar URLs")

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
        log(f"    URLs: {updated}/{len(products)} actualizados")

    # Verificar 3 URLs de muestra
    cur.execute('SELECT name, images FROM "Product" WHERE league = %s LIMIT 3', (league_name,))
    log("    Verificando URLs de muestra:")
    for row in cur.fetchall():
        imgs = json.loads(row["images"])
        url = imgs[0]
        try:
            r = requests.head(url, timeout=10)
            status = r.status_code
        except:
            status = "ERR"
        log(f"      {status} | {row['name'][:50]}")

    cur.close()
    conn.close()
    log(f"    URLs actualizadas: {updated} productos")

# ─── ACTUALIZAR FRONTEND ──────────────────────────────────────────────────────
def actualizar_frontend():
    log("\n" + "="*60)
    log("  PASO: ACTUALIZAR FRONTEND")
    log("="*60)

    # ── CatalogoFilters.tsx ──────────────────────────────────────────────────
    filters_path = SCRIPT_DIR / "components/product/CatalogoFilters.tsx"
    txt = filters_path.read_text(encoding="utf-8")

    # Asegurar que todos los slugs nuevos están en leagueToSlug
    nuevos_slugs = {
        '"Serie A": "serie-a"',
        '"Bundesliga": "bundesliga"',
        '"Selecciones": "selecciones"',
        '"Brasileirao": "brasileirao"',
    }
    changed = False
    for entrada in nuevos_slugs:
        key = entrada.split(":")[0].strip().strip('"')
        if key not in txt:
            # Insertar antes del cierre del objeto leagueToSlug
            # Buscar el último mapeo existente y añadir después
            if '"Premier League": "premier-league",' in txt:
                txt = txt.replace(
                    '"Premier League": "premier-league",',
                    '"Premier League": "premier-league",\n  ' + entrada + ","
                )
            changed = True

    if changed:
        filters_path.write_text(txt, encoding="utf-8")
        log("  CatalogoFilters.tsx actualizado")
    else:
        log("  CatalogoFilters.tsx ya tiene todas las ligas")

    # ── app/catalogo/page.tsx — slugToLeague ─────────────────────────────────
    catalogo_path = SCRIPT_DIR / "app/catalogo/page.tsx"
    txt = catalogo_path.read_text(encoding="utf-8")

    mapeos_nuevos = [
        ('"serie-a": "Retro"',       '"serie-a": "Serie A"'),
        ('"bundesliga": "Retro"',     '"bundesliga": "Bundesliga"'),
        ('"selecciones": "New Season"', '"selecciones": "Selecciones"'),
        # brasileirao puede no existir aún, añadirlo si falta
    ]

    catalogo_changed = False
    for old, new in mapeos_nuevos:
        if old in txt:
            txt = txt.replace(old, new)
            catalogo_changed = True
        elif new not in txt:
            # No existía ni viejo ni nuevo
            catalogo_changed = True

    # Añadir mapeos que no existen en absoluto
    nuevos_mapeos_catalogo = [
        '"serie-a": "Serie A"',
        '"bundesliga": "Bundesliga"',
        '"selecciones": "Selecciones"',
        '"brasileirao": "Brasileirao"',
    ]
    for mapeo in nuevos_mapeos_catalogo:
        key = mapeo.split(":")[0].strip().strip('"')
        if f'"{key}"' not in txt:
            txt = txt.replace(
                '"premier-league": "Premier League",',
                '"premier-league": "Premier League",\n      ' + mapeo + ","
            )
            catalogo_changed = True

    if catalogo_changed:
        catalogo_path.write_text(txt, encoding="utf-8")
        log("  app/catalogo/page.tsx actualizado (slugToLeague)")
    else:
        log("  app/catalogo/page.tsx ya tiene todos los mapeos")

    log("  FRONTEND COMPLETO")

# ─── GIT PUSH ─────────────────────────────────────────────────────────────────
def git_push():
    log("\n" + "="*60)
    log("  GIT PUSH")
    log("="*60)
    os.chdir(SCRIPT_DIR)
    subprocess.run(["git", "add", "-A"], check=True)
    msg = "Multi-liga: Serie A, Bundesliga, Selecciones, Brasileirao — importar BD, subir Supabase, frontend"
    result = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
    if result.returncode != 0:
        log(f"  Commit output: {result.stdout} {result.stderr}")
    else:
        log("  Commit creado")
    result = subprocess.run(["git", "push"], capture_output=True, text=True)
    if result.returncode == 0:
        log("  Git push exitoso")
    else:
        log(f"  Git push: {result.stdout} {result.stderr}")

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    t_total = time.time()
    log("=" * 60)
    log("  PIPELINE MULTI-LIGA - INICIO")
    log("=" * 60)

    for category_url, league_name, league_folder in LIGAS:
        t_liga = time.time()
        log(f"\n{'='*60}")
        log(f"  LIGA: {league_name}")
        log("="*60)

        log(f"\n  [1/4] Descargando fotos...")
        descargar_liga(category_url, league_folder)

        log(f"\n  [2/4] Importando a BD...")
        importar_liga(league_name, league_folder)

        log(f"\n  [3/4] Subiendo a Supabase...")
        subir_liga(league_folder)

        log(f"\n  [4/4] Actualizando URLs en BD...")
        actualizar_urls_liga(league_name)

        elapsed = int(time.time() - t_liga)
        log(f"\n  {league_name} COMPLETO en {elapsed//60}m {elapsed%60}s")

    actualizar_frontend()
    git_push()

    elapsed_total = int(time.time() - t_total)
    log(f"\n{'='*60}")
    log(f"  PIPELINE MULTI-LIGA COMPLETO en {elapsed_total//60}m {elapsed_total%60}s")
    log("="*60)
