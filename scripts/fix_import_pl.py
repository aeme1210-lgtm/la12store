"""Reimporta/actualiza productos Premier League en la BD.

Usa import_common.upsert_product — ya NO borra la liga completa antes de
reimportar (evita duplicados y evita romper la FK OrderItem_productId_fkey
si algún producto ya tiene pedidos reales). Ver docs/REDESIGN_AUDIT.md §2.
"""
import sys, os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import psycopg2, psycopg2.extras

sys.path.insert(0, str(Path(__file__).parent))
from import_common import upsert_product  # noqa: E402

DATABASE_URL = os.environ["DATABASE_URL"]
LEAGUE_NAME = "Premier League"
LEAGUE_FOLDER = "Premier League"
LOCAL_ROOT = Path(r"C:\Users\raer7\public\products")
LOCAL_DEST = LOCAL_ROOT / LEAGUE_FOLDER


def main():
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    album_folders = sorted([d for d in LOCAL_DEST.iterdir() if d.is_dir()])
    print(f"Álbumes: {len(album_folders)}", flush=True)

    created = updated = errors = 0
    for folder in album_folders:
        photos = sorted([f for f in folder.iterdir()
                         if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")])
        if not photos:
            continue

        images = [f"/products/{LEAGUE_FOLDER}/{folder.name}/{f.name}" for f in photos]
        try:
            result = upsert_product(cur, LEAGUE_NAME, folder.name, images)
            if result == "created":
                created += 1
            else:
                updated += 1
            if (created + updated) % 50 == 0:
                conn.commit()
                print(f"  {created} creados, {updated} actualizados / {len(album_folders)}...", flush=True)
        except Exception as e:
            conn.rollback()
            print(f"  [ERROR] {folder.name}: {e}", flush=True)
            errors += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nRESULTADO: {created} creados, {updated} actualizados, {errors} errores", flush=True)


if __name__ == "__main__":
    main()
