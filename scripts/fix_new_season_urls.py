"""Actualiza URLs de productos New Season en la BD (path local -> Supabase URL)."""
import sys, os, json, requests, psycopg2, psycopg2.extras, urllib.parse
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SUPABASE_URL = os.environ["SUPABASE_URL"]
DATABASE_URL = os.environ["DATABASE_URL"]
BUCKET = "products"
PUBLIC_BASE = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"


def public_url(storage_path):
    return f"{PUBLIC_BASE}/{urllib.parse.quote(storage_path, safe='/')}"


def main():
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT id, name, images FROM \"Product\" WHERE league = 'New Season'")
    products = cur.fetchall()
    print(f"[db] {len(products)} productos New Season", flush=True)

    updated = 0
    for p in products:
        imgs = json.loads(p["images"])
        new_imgs = []
        for img in imgs:
            if img.startswith("/products/"):
                storage_path = img[len("/products/"):]
                new_imgs.append(public_url(storage_path))
            else:
                new_imgs.append(img)
        cur.execute('UPDATE "Product" SET images = %s WHERE id = %s',
                    (json.dumps(new_imgs), p["id"]))
        updated += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"[db] {updated} productos actualizados", flush=True)

    # Verificar muestra
    print("\n[verify] Verificando 3 URLs...", flush=True)
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
            status = f"ERR"
        print(f"  {status} | {row['name'][:45]}", flush=True)
        print(f"       {url[:95]}", flush=True)
    cur2.close()
    conn2.close()
    print("\n[done]", flush=True)


if __name__ == "__main__":
    main()
