"""Sube fotos de productos New Season a Supabase Storage y actualiza la BD."""
import sys, os, json, time, mimetypes, urllib.parse, requests, psycopg2, psycopg2.extras
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
BUCKET = "products"
LOCAL_ROOT = r"C:\Users\raer7\public\products"
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1"
PUBLIC_BASE = f"{STORAGE_BASE}/object/public/{BUCKET}"
HEADERS = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}


def public_url(storage_path):
    return f"{PUBLIC_BASE}/{urllib.parse.quote(storage_path, safe='/')}"


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
                data=data, timeout=60,
            )
            return resp.status_code in (200, 201)
        except Exception as e:
            if attempt < 3:
                time.sleep(2 ** attempt)
            else:
                print(f"  ERROR {os.path.basename(storage_path)}: {e}", flush=True)
                return False
    return False


def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, images FROM \"Product\" WHERE league = 'New Season'")
    products = cur.fetchall()
    print(f"[info] {len(products)} productos New Season", flush=True)

    # Encontrar qué álbumes necesitan upload (los que no son ya URLs de Supabase)
    albums_to_upload = set()
    for p in products:
        imgs = json.loads(p["images"])
        for img in imgs:
            if img.startswith("/products/"):
                # Extraer carpeta/album: /products/{folder}/{album}/file
                parts = img.split("/")
                # parts = ['', 'products', 'folder', 'album', 'file']
                if len(parts) >= 4:
                    folder = parts[2]
                    album = parts[3]
                    albums_to_upload.add(f"{folder}/{album}")

    print(f"[info] {len(albums_to_upload)} albumes a verificar/subir", flush=True)

    # Recopilar fotos de álbumes que no están en Supabase aún
    all_photos = []
    for album_path in sorted(albums_to_upload):
        local_album = os.path.join(LOCAL_ROOT, album_path)
        if not os.path.isdir(local_album):
            print(f"  SKIP (no existe localmente): {album_path}", flush=True)
            continue
        for fname in sorted(os.listdir(local_album)):
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                all_photos.append((os.path.join(local_album, fname), f"{album_path}/{fname}"))

    print(f"[info] {len(all_photos)} fotos a subir\n", flush=True)

    uploaded = 0
    failed = 0
    for i, (local, storage) in enumerate(all_photos, 1):
        ok = upload_file(local, storage)
        if ok:
            uploaded += 1
        else:
            failed += 1
            print(f"  FAIL [{i}]: {storage}", flush=True)
        if i % 50 == 0 or i == len(all_photos):
            print(f"  Progreso: {i}/{len(all_photos)} OK:{uploaded} FAIL:{failed}", flush=True)

    print(f"\n[upload] {uploaded} subidas, {failed} fallidas\n", flush=True)

    # Actualizar BD: convertir /products/... paths a URLs de Supabase
    print("[db] Actualizando URLs en la BD...", flush=True)
    updated = 0
    for p in products:
        imgs = json.loads(p["images"])
        new_imgs = []
        for img in imgs:
            if img.startswith("/products/"):
                storage_path = img[len("/products/"):]
                new_imgs.append(public_url(storage_path))
            elif img.startswith(PUBLIC_BASE):
                new_imgs.append(img)  # ya es URL correcta
            else:
                new_imgs.append(img)
        cur.execute('UPDATE "Product" SET images = %s WHERE id = %s',
                    (json.dumps(new_imgs), p["id"]))
        updated += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"[db] {updated} productos actualizados", flush=True)

    # Verificar muestra de 3 URLs
    print("\n[verify] Verificando muestra de URLs...", flush=True)
    conn2 = psycopg2.connect(DATABASE_URL)
    cur2 = conn2.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur2.execute("SELECT name, images FROM \"Product\" WHERE league='New Season' LIMIT 3")
    for row in cur2.fetchall():
        imgs = json.loads(row["images"])
        url = imgs[0]
        try:
            r = requests.head(url, timeout=10)
            status = r.status_code
        except Exception as e:
            status = f"ERROR: {e}"
        print(f"  {status} | {row['name'][:40]}", flush=True)
        print(f"       {url[:90]}", flush=True)
    cur2.close()
    conn2.close()

    print("\n[done] Todo listo.", flush=True)


if __name__ == "__main__":
    main()
