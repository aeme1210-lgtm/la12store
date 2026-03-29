"""
Sube todas las fotos de La Liga a Supabase Storage y actualiza la BD.
"""
import sys, os, json, time, mimetypes, urllib.parse, requests, psycopg2, psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def log(msg):
    print(msg, flush=True)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
BUCKET = "products"
LOCAL_ROOT = r"C:\Users\raer7\public\products"
LEAGUE_FOLDER = "La Liga"
LEAGUE_LOCAL = os.path.join(LOCAL_ROOT, LEAGUE_FOLDER)

HEADERS = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1"
PUBLIC_BASE = f"{STORAGE_BASE}/object/public/{BUCKET}"


def create_bucket():
    resp = requests.post(
        f"{STORAGE_BASE}/bucket",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"id": BUCKET, "name": BUCKET, "public": True},
        timeout=30,
    )
    msg = (resp.json().get("message") or resp.json().get("error") or "")
    if resp.status_code in (200, 201):
        log(f"[bucket] Creado: {BUCKET}")
    elif "already" in msg.lower() or "exists" in msg.lower() or "duplicate" in msg.lower():
        log(f"[bucket] Ya existe: {BUCKET}")
    else:
        log(f"[bucket] Respuesta {resp.status_code}: {resp.text[:200]}")


def upload_file(local_path, storage_path):
    mime = mimetypes.guess_type(local_path)[0] or "image/jpeg"
    with open(local_path, "rb") as f:
        data = f.read()
    encoded = urllib.parse.quote(storage_path, safe="/")
    for attempt in range(4):
        try:
            resp = requests.post(
                f"{STORAGE_BASE}/object/{BUCKET}/{encoded}",
                headers={**HEADERS, "Content-Type": mime, "x-upsert": "true"},
                data=data,
                timeout=60,
            )
            return resp.status_code in (200, 201)
        except Exception as e:
            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                log(f"  ERROR {os.path.basename(storage_path)}: {e}")
                return False
    return False


def public_url(storage_path):
    return f"{PUBLIC_BASE}/{urllib.parse.quote(storage_path, safe='/')}"


def main():
    create_bucket()

    albums = sorted(os.listdir(LEAGUE_LOCAL))
    log(f"\n[info] {len(albums)} albums en '{LEAGUE_FOLDER}'")

    all_photos = []
    for album in albums:
        album_path = os.path.join(LEAGUE_LOCAL, album)
        if not os.path.isdir(album_path):
            continue
        for fname in sorted(os.listdir(album_path)):
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                local = os.path.join(album_path, fname)
                storage = f"{LEAGUE_FOLDER}/{album}/{fname}"
                all_photos.append((local, storage))

    log(f"[info] {len(all_photos)} fotos totales a subir\n")

    uploaded = 0
    failed = 0
    for i, (local, storage) in enumerate(all_photos, 1):
        ok = upload_file(local, storage)
        if ok:
            uploaded += 1
        else:
            failed += 1
            log(f"  FAIL [{i}]: {storage}")
        if i % 50 == 0 or i == len(all_photos):
            log(f"  Progreso: {i}/{len(all_photos)} - OK:{uploaded} FAIL:{failed}")

    log(f"\n[upload] {uploaded} subidas, {failed} fallidas\n")

    # Actualizar BD
    log("[db] Conectando a PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT id, name, images FROM \"Product\" WHERE league = 'La Liga'")
    products = cur.fetchall()
    log(f"[db] {len(products)} productos con league='La Liga'")

    updated = 0
    for product in products:
        old_images = json.loads(product["images"]) if product["images"] else []
        new_images = []
        for img_path in old_images:
            if img_path.startswith("/products/"):
                storage_path = img_path[len("/products/"):]
            else:
                storage_path = img_path.lstrip("/")
            new_images.append(public_url(storage_path))
        if new_images:
            cur.execute(
                'UPDATE "Product" SET images = %s WHERE id = %s',
                (json.dumps(new_images), product["id"]),
            )
            updated += 1

    conn.commit()
    cur.close()
    conn.close()
    log(f"[db] {updated} productos actualizados")
    log("\n[done] Todo listo.")


if __name__ == "__main__":
    main()
