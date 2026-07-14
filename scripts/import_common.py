#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Módulo compartido de parseo e importación de productos para los pipelines de
Yupoo (pipeline_premier_league.py, pipeline_multi_liga.py,
pipeline_liga_argentina.py, fix_import_pl.py, pipeline_continue.py).

Corrige dos bugs de causa raíz confirmados en la auditoría del rediseño
(2026-07-14, ver docs/REDESIGN_AUDIT.md):

1. Cada pipeline tenía su propia copia de parse_folder()/to_slug() y, al
   importar, borraba TODA la liga (`DELETE FROM "Product" WHERE league=...`)
   y reinsertaba todo desde cero. Cuando el nombre calculado coincidía con
   uno ya usado, el script generaba un slug sufijado (-2, -3) e insertaba una
   fila NUEVA con el mismo `name` en vez de detectar el producto real y
   actualizarlo. Confirmado contra la BD real: 623 grupos de nombre
   duplicado = 794 filas sobrantes.
2. El modificador "long sleeve" del nombre de carpeta se eliminaba con un
   regex sin guardarse en ningún campo. Una carpeta "24_25 Real Madrid Home"
   y otra "24_25 Real Madrid Home Long Sleeve" producían el MISMO `name`
   tras el parseo — alimentando directamente el bug #1 con variantes que en
   realidad son productos legítimamente distintos.

Uso: importar `parse_folder`, `to_slug` y `upsert_product` desde este módulo
en vez de redefinirlos. Llamar a `upsert_product()` por cada carpeta — NUNCA
borrar la liga completa antes de reimportar (evita además romper la FK
OrderItem_productId_fkey si algún producto ya tiene pedidos reales).
"""
import json
import re
import unicodedata
import uuid

TYPE_KEYWORDS = [
    "Third Away", "Third Home", "Special Edition",
    "Goalkeeper Yellow", "Goalkeeper White", "Goalkeeper Green",
    "Goalkeeper Blue", "Goalkeeper Red", "Goalkeeper Orange", "Goalkeeper",
    "Third", "Away", "Home",
    "Yellow", "White", "Red", "Black", "Blue", "Green", "Pink",
    "Purple", "Orange", "Gold", "Grey", "Navy",
]


def parse_season(raw: str) -> str:
    s = raw.replace("_", "/")
    return re.sub(r"^0(\d{2})/", r"\1/", s)


def parse_folder(folder_name: str) -> dict:
    """Parsea el nombre de una carpeta de Yupoo a los atributos del producto.

    A diferencia de las versiones anteriores (duplicadas en cada pipeline),
    esta SÍ captura is_long_sleeve en vez de descartarlo silenciosamente.
    """
    text = folder_name.strip()

    m = re.match(r"^(\d{2,3}[_/]\d{2})\s+", text)
    season = ""
    if m:
        season = parse_season(m.group(1))
        text = text[len(m.group(0)):].strip()

    is_retro = bool(re.search(r"\bretro\b", text, re.I))
    text = re.sub(r"\bretro\b", "", text, flags=re.I)

    is_long_sleeve = bool(re.search(r"\blong\s+sleeve\b", text, re.I))
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

    return {
        "season": season,
        "team": team or folder_name,
        "type": detected_type or "Home",
        "isRetro": is_retro,
        "isLongSleeve": is_long_sleeve,
    }


def to_slug(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return re.sub(r"-{2,}", "-", text).strip("-")


def build_name(parsed: dict) -> str:
    """Arma el nombre final del producto, incluyendo 'Manga Larga' si aplica
    (antes esa información se perdía por completo — ver bug #2 arriba)."""
    parts = [parsed["season"], parsed["team"], parsed["type"]]
    if parsed["isRetro"]:
        parts.append("Retro")
    if parsed["isLongSleeve"]:
        parts.append("Manga Larga")
    return re.sub(r"\s{2,}", " ", " ".join(x for x in parts if x)).strip()


def build_prices(parsed: dict) -> dict:
    """Precios por tier según versión del producto — misma prioridad que
    getProductPrice() en lib/pricing.ts (manga larga > retro > fan/player)."""
    if parsed["isLongSleeve"]:
        return {"priceRetro": None, "priceFan": None, "pricePlayer": None, "priceLongSleeve": 185000}
    if parsed["isRetro"]:
        return {"priceRetro": 170000, "priceFan": None, "pricePlayer": None, "priceLongSleeve": None}
    return {"priceRetro": None, "priceFan": 150000, "pricePlayer": 180000, "priceLongSleeve": None}


def find_existing_product(cur, team: str, season: str, type_: str, is_retro: bool, is_long_sleeve: bool):
    """Busca un producto existente por identidad normalizada (equipo + temporada
    + tipo + retro + manga larga), NO por nombre/slug generado. Esto es lo que
    evita crear una fila duplicada cuando el producto ya existe."""
    cur.execute(
        """
        SELECT id, slug, images FROM "Product"
        WHERE lower(team) = lower(%s)
          AND lower(type) = lower(%s)
          AND COALESCE(season, '') = COALESCE(%s, '')
          AND "isRetro" = %s
          AND "isLongSleeve" = %s
        LIMIT 1
        """,
        (team, type_, season or None, is_retro, is_long_sleeve),
    )
    return cur.fetchone()


def unique_slug(cur, slug_base: str) -> str:
    """Genera un slug único verificando contra la BD real en cada intento
    (no un set en memoria que puede quedar desactualizado entre llamadas)."""
    cur.execute('SELECT 1 FROM "Product" WHERE slug = %s', (slug_base,))
    if not cur.fetchone():
        return slug_base
    i = 2
    while True:
        candidate = f"{slug_base}-{i}"
        cur.execute('SELECT 1 FROM "Product" WHERE slug = %s', (candidate,))
        if not cur.fetchone():
            return candidate
        i += 1


def upsert_product(cur, league_name: str, folder_name: str, images: list) -> str:
    """Crea o actualiza un producto a partir de una carpeta de Yupoo ya
    descargada localmente. Reemplaza el patrón anterior de
    DELETE-liga-completa + INSERT-con-slug-sufijado.

    Retorna "created" o "updated".
    """
    parsed = parse_folder(folder_name)
    name = build_name(parsed)
    prices = build_prices(parsed)

    existing = find_existing_product(
        cur, parsed["team"], parsed["season"], parsed["type"],
        parsed["isRetro"], parsed["isLongSleeve"],
    )

    if existing:
        cur.execute(
            """
            UPDATE "Product"
            SET name = %s, images = %s, "priceRetro" = %s, "priceFan" = %s,
                "pricePlayer" = %s, "priceLongSleeve" = %s, "updatedAt" = NOW()
            WHERE id = %s
            """,
            (
                name, json.dumps(images), prices["priceRetro"], prices["priceFan"],
                prices["pricePlayer"], prices["priceLongSleeve"], existing["id"],
            ),
        )
        return "updated"

    slug = unique_slug(cur, to_slug(name))
    cur.execute(
        """
        INSERT INTO "Product"
          (id, name, slug, team, league, season, type, "isRetro", "isLongSleeve", images,
           "hasPlayer", "isNew", "isActive", stock,
           "priceRetro", "priceFan", "pricePlayer", "priceLongSleeve",
           "isFeatured", "isTrending", "createdAt", "updatedAt")
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
        """,
        (
            str(uuid.uuid4()), name, slug, parsed["team"], league_name, parsed["season"] or None,
            parsed["type"], parsed["isRetro"], parsed["isLongSleeve"], json.dumps(images),
            not parsed["isRetro"], not parsed["isRetro"], True, 99,
            prices["priceRetro"], prices["priceFan"], prices["pricePlayer"], prices["priceLongSleeve"],
            False, False,
        ),
    )
    return "created"


def import_folders(cur, league_name: str, folder_root, league_subfolder: str, log=print) -> dict:
    """Itera todas las carpetas de álbum bajo folder_root/league_subfolder y
    hace upsert de cada una. Retorna un resumen {"created": n, "updated": n,
    "skipped": n} (skipped = carpeta sin fotos)."""
    from pathlib import Path

    dest = Path(folder_root) / league_subfolder
    if not dest.exists():
        log(f"    ERROR: carpeta {league_subfolder} no existe")
        return {"created": 0, "updated": 0, "skipped": 0}

    album_folders = sorted(d for d in dest.iterdir() if d.is_dir())
    log(f"    Álbumes locales: {len(album_folders)}")

    counts = {"created": 0, "updated": 0, "skipped": 0}
    for folder in album_folders:
        photos = sorted(
            f for f in folder.iterdir()
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")
        )
        if not photos:
            counts["skipped"] += 1
            continue

        images = [f"/products/{league_subfolder}/{folder.name}/{f.name}" for f in photos]
        result = upsert_product(cur, league_name, folder.name, images)
        counts[result] += 1
        if sum(counts.values()) % 50 == 0:
            cur.connection.commit()
            log(f"    {counts['created']} creados, {counts['updated']} actualizados...")

    cur.connection.commit()
    log(f"    Import {league_name}: {counts['created']} creados, "
        f"{counts['updated']} actualizados, {counts['skipped']} sin fotos")
    return counts
