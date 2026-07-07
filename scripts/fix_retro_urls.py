"""Actualiza URLs de productos Retro en la BD (path local -> Supabase URL)."""
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
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT id, images FROM \"Product\" WHERE league = 'Retro'")
    products = cur.fetchall()
    print(f"[db] {len(products)} productos Retro", flush=True)

    batch_size = 50
    updated = 0
    for i in range(0, len(products), batch_size):
        batch = products[i:i+batch_size]
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
        print(f"  {updated}/{len(products)} actualizados", flush=True)

    cur.close()
    conn.close()
    print(f"[db] {updated} productos actualizados\n", flush=True)

    # Verificar 5 URLs aleatorias
    print("[verify] Verificando 5 URLs...", flush=True)
    conn2 = psycopg2.connect(DATABASE_URL)
    cur2 = conn2.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur2.execute("SELECT name, images FROM \"Product\" WHERE league='Retro' ORDER BY RANDOM() LIMIT 5")
    all_ok = True
    for row in cur2.fetchall():
        imgs = json.loads(row["images"])
        url = imgs[0]
        try:
            r = requests.head(url, timeout=10)
            status = r.status_code
        except Exception:
            status = "ERR"
            all_ok = False
        if status != 200:
            all_ok = False
        print(f"  {status} | {row['name'][:50]}", flush=True)
    cur2.close()
    conn2.close()
    print(f"\n[done] URLs {'todas OK' if all_ok else 'ALGUNAS FALLARON'}", flush=True)


if __name__ == "__main__":
    main()
