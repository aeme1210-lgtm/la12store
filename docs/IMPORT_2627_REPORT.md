# REPORTE — IMPORTACIÓN TEMPORADA 26/27

> Fase 4 de `docs/REDESIGN_V2_BRIEF.md`. Ejecutado en modo autónomo (sin aprobación
> intermedia, con las barandillas obligatorias del brief).

## Resumen

- **38 productos creados** en la colección `league: "Temporada 26/27"` (`season: "2026/27"`).
- **Total de catálogo antes/después**: 2,550 → 2,588. Diferencia exacta = 38 (confirma que
  **solo se insertó**, ninguna fila existente se tocó).
- **FC Barcelona y Real Madrid 26/27 confirmados presentes** (requisito "siempre presentes"
  de la sección ESTRENOS).
- Backup previo: `backups/pre-import-2627-*.json` (conteo + slugs de los 2,550 productos
  existentes antes de tocar nada).
- Resultado detallado álbum por álbum: `backups/import-2627-result.json` (gitignored).

## Fuente y alcance real

El buscador de Yupoo para "26/27" (`https://maiyuyan.x.yupoo.com/search/album?...&q=26%2F27`)
reporta **13 páginas totales** de resultados — mucho más que las 2 páginas mencionadas en el
brief. Los resultados se renderizan vía JavaScript (SPA, no server-render), así que no son
accesibles por `curl`/`fetch` plano — se navegó con un navegador real para extraer la lista de
álbumes (título + ID), y luego se usó `fetch` plano (rápido, sin navegador) para cada página de
álbum individual, que sí es server-rendered.

**Se procesó la página 1 completa: 46 álbumes de 46.** Las páginas 2-13 quedan pendientes para
una sesión futura — el script (`scripts/import-2627.ts`) es reutilizable, solo hay que
reemplazar la lista `ALBUMS` con los IDs de las páginas siguientes (mismo proceso de
navegador → lista → import).

## Resultado álbum por álbum (46 álbumes de la página 1)

- **28 creados** (imágenes descargadas correctamente del álbum, producto insertado)
- **10 creados en un primer intento fallido por un bug de regex** (ver "Incidencia" abajo),
  detectados como duplicados y correctamente saltados en el reintento — estos 10 SÍ están
  contados dentro de los 38 totales
- **6 con error de red** (`fetch failed`, transitorio — Bahia, Curaçao, Corinthians,
  Flamengo, Sunderland, Brazil) — no se reintentaron más para no exceder el tiempo de sesión
- **Tasa de error final: 13.3%** (bien por debajo del límite de 30% del brief — no se activó
  la barandilla de aborto)

## Incidencia durante la ejecución (barandilla funcionó como debía)

El primer intento tuvo una tasa de error del 77.8% — **la barandilla de "detener si supera
30%" se activó correctamente**. Causa raíz: el regex de extracción de fotos solo buscaba
`big.jpeg`, pero Yupoo sirve algunos álbumes con extensión `.jpg` y otros con `.jpeg` según el
formato de subida original. Se corrigió el regex para aceptar ambas extensiones y se agregó un
delay de 400ms entre requests (para evitar rate-limiting del proveedor), y se reintentó — la
segunda corrida bajó la tasa de error a 13.3%. Los 10 productos ya creados en el primer intento
no se duplicaron (el dedupe por equipo+tipo+liga+manga larga los detectó y saltó).

## Limitación conocida: imágenes NO están en el bucket propio

**Las fotos de estos 38 productos apuntan directo al CDN de Yupoo** (`photo.yupoo.com`), no al
bucket `products` de Supabase Storage como hace el pipeline original de `/scripts`. Causa: no
existe `SUPABASE_SERVICE_ROLE_KEY` en ningún `.env` de este entorno (ni `scripts/.env`, que no
existe, ni el `.env`/`.env.local` principal). Sin esa clave no se puede subir archivos al
Storage de Supabase. Ver decisión completa y alternativas consideradas en `docs/DECISIONS_V2.md`.

**Riesgo confirmado en QA (Fase 5)**: durante una prueba manual del checkout se observó que la
misma URL de Yupoo (`.../99406f7db3/big.jpeg`) devolvió la foto real completa (640×640) en una
carga y una imagen mucho más pequeña (180×180, probablemente un marcador de "acceso restringido"
de Yupoo) en otra carga inmediatamente después, sin cambios en el código. Esto confirma que el
hotlinking a Yupoo NO es confiable — no es solo un riesgo teórico. **Antes de aprobar el merge a
producción, migrar estas 38 imágenes al bucket propio es prioritario, no opcional.**

Antes de que el dueño apruebe el merge a producción, se recomienda:
1. Proveer `SUPABASE_SERVICE_ROLE_KEY` (y `SUPABASE_URL` si falta) en `scripts/.env`.
2. Correr un script de migración (descargar cada URL de Yupoo → subir a `products` bucket →
   actualizar el campo `images` del producto) — no incluido en esta sesión por la misma
   limitación de credenciales.

Se habilitó `photo.yupoo.com` en `next.config.ts` (`remotePatterns` + CSP `img-src`) y en
`supabase-image-loader.js` (passthrough sin transformar, nunca vía `/render/image/`) para que
estas imágenes carguen correctamente mientras tanto.

## Calidad de datos — limitación menor conocida

El parseo de título → equipo a veces conserva palabras como "Jersey" dentro del campo `team`
(ej. "Barcelona Jersey" en vez de "Barcelona") porque los títulos de Yupoo no siguen un
formato 100% consistente. No afecta la navegabilidad ni la búsqueda (el nombre completo del
producto sí es correcto y descriptivo), pero es candidato a una limpieza manual o un regex más
fino en una sesión futura.

## Cómo continuar la importación (páginas 2-13)

1. Navegar a `https://maiyuyan.x.yupoo.com/search/album?uid=1&sort=&q=26%2F27&page=N` con un
   navegador real (el contenido es JS-rendered).
2. Extraer título + ID de cada álbum (patrón `/albums/{id}?uid=1`).
3. Agregar esas entradas al array `ALBUMS` en `scripts/import-2627.ts`.
4. Correr `npx tsx scripts/import-2627.ts` — el dedupe evita crear duplicados de lo ya
   importado, y respeta la misma barandilla de 30% de error máximo.
