"""Re-importa productos Premier League a la BD con ID generado."""
import sys, os, json, re, uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import psycopg2, psycopg2.extras

DATABASE_URL = os.environ["DATABASE_URL"]
LEAGUE_NAME  = "Premier League"
LEAGUE_FOLDER = "Premier League"
LOCAL_ROOT   = Path(r"C:\Users\raer7\public\products")
LOCAL_DEST   = LOCAL_ROOT / LEAGUE_FOLDER

TYPE_KEYWORDS = [
    "Third Away","Third Home","Special Edition",
    "Goalkeeper Yellow","Goalkeeper White","Goalkeeper Green",
    "Goalkeeper Blue","Goalkeeper Red","Goalkeeper Orange","Goalkeeper",
    "Third","Away","Home",
    "Yellow","White","Red","Black","Blue","Green","Pink",
    "Purple","Orange","Gold","Grey","Navy",
]

def parse_season(raw):
    s = raw.replace("_", "/")
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
    return {"season": season, "team": team or folder_name, "type": detected_type or "Home", "isRetro": is_retro}

def to_slug(text):
    import unicodedata
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-")

def main():
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Borrar PL existentes y cargar slugs
    cur.execute('DELETE FROM "Product" WHERE league = %s', (LEAGUE_NAME,))
    conn.commit()
    print(f"Productos PL eliminados", flush=True)

    cur.execute('SELECT slug FROM "Product"')
    used_slugs = {r["slug"] for r in cur.fetchall()}
    print(f"Slugs existentes: {len(used_slugs)}", flush=True)

    album_folders = sorted([d for d in LOCAL_DEST.iterdir() if d.is_dir()])
    print(f"Álbumes: {len(album_folders)}", flush=True)

    created = errors = 0
    for folder in album_folders:
        photos = sorted([f for f in folder.iterdir()
                         if f.suffix.lower() in (".jpg",".jpeg",".png",".webp")])
        if not photos:
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

        if is_retro:
            price_retro, price_fan, price_player = 170000, None, None
        else:
            price_retro, price_fan, price_player = None, 150000, 180000

        product_id = str(uuid.uuid4())

        try:
            cur.execute("""
                INSERT INTO "Product"
                  (id, name, slug, team, league, season, type, "isRetro", images,
                   "hasPlayer", "isNew", "isActive", stock,
                   "priceRetro", "priceFan", "pricePlayer",
                   "isFeatured", "isTrending", "createdAt", "updatedAt")
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
            """, (
                product_id, name, slug, p["team"], LEAGUE_NAME,
                p["season"] or None, p["type"], is_retro,
                json.dumps(images), not is_retro, not is_retro, True, 99,
                price_retro, price_fan, price_player, False, False,
            ))
            created += 1
            if created % 50 == 0:
                conn.commit()
                print(f"  {created}/{len(album_folders)} importados...", flush=True)
        except Exception as e:
            conn.rollback()
            print(f"  [ERROR] {folder.name}: {e}", flush=True)
            errors += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nRESULTADO: {created} creados, {errors} errores", flush=True)

if __name__ == "__main__":
    main()
