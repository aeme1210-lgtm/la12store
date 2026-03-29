"""Sube álbumes faltantes (Retro/New Season) que pertenecen a productos La Liga."""
import sys, os, json, time, mimetypes, urllib.parse, requests, psycopg2, psycopg2.extras, re
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
BUCKET = "products"
LOCAL_ROOT = r"C:\Users\raer7\public\products"
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1"
HEADERS = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}


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
    cur.execute("SELECT images FROM \"Product\" WHERE league = 'La Liga'")
    products = cur.fetchall()
    cur.close()
    conn.close()

    album_set = set()
    for p in products:
        imgs = json.loads(p["images"])
        for url in imgs:
            m = re.search(r'/object/public/products/(.+)/\d+\.(jpg|jpeg|png)', url, re.IGNORECASE)
            if m:
                album_path = urllib.parse.unquote(m.group(1))
                if not album_path.startswith("La Liga/"):
                    album_set.add(album_path)

    print(f"[info] {len(album_set)} albumes faltantes a subir", flush=True)

    all_photos = []
    for album in sorted(album_set):
        local_album = os.path.join(LOCAL_ROOT, album)
        if not os.path.isdir(local_album):
            print(f"  SKIP (no existe): {album}", flush=True)
            continue
        for fname in sorted(os.listdir(local_album)):
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                all_photos.append((os.path.join(local_album, fname), f"{album}/{fname}"))

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
        if i % 30 == 0 or i == len(all_photos):
            print(f"  Progreso: {i}/{len(all_photos)} OK:{uploaded} FAIL:{failed}", flush=True)

    print(f"\n[done] {uploaded} subidas, {failed} fallidas", flush=True)


if __name__ == "__main__":
    main()
