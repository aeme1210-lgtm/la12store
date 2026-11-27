# Propuesta de normalización del catálogo — 2026-11-27

> Generado por `scripts/normalize-catalog.ts`. **Solo lectura: la base de datos no fue modificada.**
> Detalle por producto en `propuesta-2026-11-27.csv` (ábrelo con Excel o Google Sheets).

## Resumen

| Métrica | Actual | Propuesto |
|---|---|---|
| Productos | 2588 | 2588 |
| Equipos distintos | 286 | 284 |
| Marcados "nuevo" (isNew) | 357 | 356 (solo camisetas adulto 2026 y 26/27) |
| Manga larga sin marcar | 33 | 0 |
| Productos con alguna alerta (precio, retro, texto de mayorista) | 282 | — |
| Prendas que no son camiseta | 213 | separadas por tipo |
| Nombres con tallas dentro | 380 | 0 |

## Por tipo de prenda

| Prenda | Productos |
|---|---|
| Camiseta | 2375 |
| Conjunto niño | 91 |
| Pantaloneta | 40 |
| Chaqueta | 33 |
| Conjunto de entrenamiento | 22 |
| Esqueleto | 17 |
| Polo | 6 |
| Buzo | 4 |

## Por público

| Público | Productos |
|---|---|
| Adulto | 2357 |
| Niño | 193 |
| Mujer | 34 |
| Bebé | 4 |

## Equipos que el script no pudo resolver (top 60)

Estos nombres quedaron "limpios" pero sin equivalencia canónica. Agrega los
correctos a `TEAM_ALIASES` en el script y vuelve a correrlo.

| Equipo limpio | Productos |
|---|---|
| 13ac Milan | 1 |
| -10ac Milan | 1 |
| 96ac Milan | 1 |
| Flamengo2 | 1 |
| 26sao Paulo | 1 |

**Equipos sin resolver en total:** 5 (5 productos)
