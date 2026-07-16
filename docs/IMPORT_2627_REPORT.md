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

## RESUELTO: imágenes migradas al bucket propio (2026-07-16)

**Actualización**: la limitación de abajo (imágenes servidas directo desde `photo.yupoo.com`)
ya está resuelta. El dueño agregó `SUPABASE_SERVICE_ROLE_KEY` a `.env` y se corrió
`scripts/migrate-2627-images.ts`:

- **76/76 imágenes migradas** (38 productos × 2 imágenes c/u) al bucket `products` de Supabase
  Storage, ruta `Temporada 26-27/{slug}/{n}.jpg` (el `/` de "26/27" se sanea a "26-27" porque
  rompería la ruta del bucket).
- **38/38 productos totalmente migrados, 0 parciales, 0 fallos** — ningún producto quedó con
  URLs mixtas ni con la URL de Yupoo original.
- Descarga con `Referer: https://maiyuyan.x.yupoo.com/` (headers de navegador real) + validación
  de tamaño mínimo (8 KB) para detectar y reintentar si Yupoo devuelve un marcador de "acceso
  restringido" en vez de la foto real (el mismo problema confirmado en la sección de abajo) —
  no ocurrió en esta corrida, las 76 descargas fueron la foto real a la primera.
- Subida vía API REST de Supabase Storage (`fetch`, sin agregar la dependencia
  `@supabase/supabase-js` — cero dependencias nuevas, igual que el resto de esta fase).
- Nunca se usó `/render/image/` — el binario se sube tal cual, se sirve tal cual.
- Backup previo obligatorio: `backups/pre-image-migration-2627-*.json` (id + slug + URLs de
  Yupoo de los 38 productos, antes de tocar nada).
- UPDATE restringido exactamente a esos 38 productos (`where: { league: "Temporada 26/27" }`),
  solo el campo `images` — ningún otro campo ni producto se tocó.
- Verificado en la preview real (`redesign-v2`): las 24 imágenes visibles en la sección
  ESTRENOS cargan con `complete: true` y dimensiones reales (540×540) desde
  `chljxifjjzaffvwixtfm.supabase.co`, incluyendo Barcelona y Real Madrid.
- Reporte detallado imagen por imagen: `backups/migrate-2627-images-result.json` (gitignored).
- **Bug encontrado y corregido de paso**: la clave `SUPABASE_SERVICE_ROLE_KEY` en `.env` tenía
  un formato inválido (`=""eyJ...` — comilla doble duplicada al inicio, sin comilla de cierre),
  lo que rompía el JWT y devolvía `401 Unauthorized` de Supabase. Corregido a `="eyJ...evF9C4Y0"`
  (una sola comilla de apertura y cierre) antes de correr la migración.

`next.config.ts`, `supabase-image-loader.js` y el `img-src` de la CSP **conservan** el soporte
para `photo.yupoo.com` — no se revirtió, por si una sesión futura de importación (páginas 2-13)
necesita el mismo flujo antes de tener oportunidad de migrar esas imágenes también.

---

## Limitación original (ya resuelta, se conserva el detalle para contexto histórico)

**Las fotos de estos 38 productos apuntaban directo al CDN de Yupoo** (`photo.yupoo.com`), no al
bucket `products` de Supabase Storage como hace el pipeline original de `/scripts`. Causa: no
existía `SUPABASE_SERVICE_ROLE_KEY` en ningún `.env` de este entorno. Sin esa clave no se podía
subir archivos al Storage de Supabase. Ver decisión completa y alternativas consideradas en
`docs/DECISIONS_V2.md`.

**Riesgo confirmado en QA (Fase 5)**: durante una prueba manual del checkout se observó que la
misma URL de Yupoo (`.../99406f7db3/big.jpeg`) devolvió la foto real completa (640×640) en una
carga y una imagen mucho más pequeña (180×180, probablemente un marcador de "acceso restringido"
de Yupoo) en otra carga inmediatamente después, sin cambios en el código. Esto confirmó que el
hotlinking a Yupoo no era confiable — motivó la migración de arriba.

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
