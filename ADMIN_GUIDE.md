# GUÍA DE ADMINISTRACIÓN — LA 12 STORE

> Documento vivo. Se amplía en cada fase del rediseño (`docs/REDESIGN_PROGRESS.md`)
> a medida que existen features de administración nuevas (hero, colecciones, reseñas).
> Esta versión cubre lo que existe hoy: importación de catálogo y configuración central.

## Importar productos nuevos desde Yupoo (sin generar duplicados)

Los scripts de scraping/importación viven en `/scripts` (Python). **Ya no se debe
borrar una liga completa antes de reimportar** — todos los pipelines usan ahora
`scripts/import_common.py`, que:

1. Parsea el nombre de la carpeta de Yupoo (temporada, equipo, tipo, retro, **manga
   larga**).
2. Busca si ya existe un producto con esa misma identidad (equipo + temporada + tipo
   + retro + manga larga, comparación insensible a mayúsculas).
3. Si existe: **actualiza** esa fila (imágenes, precios) sin tocar su `id`/`slug`
   (no rompe URLs ya indexadas por buscadores).
4. Si no existe: la crea, con un slug único verificado contra la BD real.

Nunca hace `DELETE FROM "Product" WHERE league=...` — eso era la causa raíz de los
794 duplicados encontrados en la auditoría (2026-07-14, ver `docs/REDESIGN_AUDIT.md`).

### Antes de correr un pipeline de una liga nueva

- **Verifica manualmente el nombre de las carpetas** contra la categoría real de
  Yupoo antes de correr el pipeline. Hay un caso confirmado en la BD real de un
  producto que quedó con `team: "Barcelona home LS Champions League"` y
  `league: "Premier League"` porque el nombre de carpeta de origen no correspondía
  a la categoría que se estaba importando (`LEAGUE_NAME` se asigna fijo para toda
  la corrida, sin validar el equipo real extraído del texto).
- Los scripts requieren `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y
  `DATABASE_URL` en `scripts/.env` (no confundir con el `.env`/`.env.local` de
  Next.js).
- Corren en la máquina donde vive la carpeta local de fotos descargadas
  (`LOCAL_ROOT`, hardcodeado por script) — no en este repo directamente.

### Manga larga

Antes se perdía esa información al importar (el parser borraba "long sleeve" del
nombre sin guardarla). Ahora se captura como `isLongSleeve` en la BD y el producto
usa el precio `priceLongSleeve` (ver `lib/pricing.ts` en el lado web, `build_prices()`
en `scripts/import_common.py` del lado de importación) — por defecto $185.000 si no
se especifica otro valor.

**Limitación conocida**: los productos importados ANTES de este fix (2026-07-14) no
quedan marcados retroactivamente como manga larga — solo las importaciones nuevas.

## Configuración centralizada (un solo lugar por cada cosa)

| Qué | Archivo | Notas |
|---|---|---|
| Número de WhatsApp | `lib/whatsapp.ts` | `WHATSAPP_NUMBER`/`WHATSAPP_DISPLAY`. No hardcodear el número en ningún componente — importar de aquí. |
| Mensaje de pedido por WhatsApp | `lib/whatsapp.ts` | `buildOrderMessage()` — único builder usado por consulta rápida, carrito y checkout. |
| Precios (Fan/Retro/Player/Manga Larga) | `lib/pricing.ts` | `getProductPrice()`/`getStartingPrice()` — única fuente de cálculo, no reimplementar inline. |
| Cifras de envío | `lib/shipping.ts` | Tiene marcadores `TODO_OWNER` en cifras que la auditoría encontró contradictorias en el código real — ver sección siguiente. |
| Traducción tipo/color de camiseta | `lib/taxonomy.ts` | Capa derivada de solo lectura; no modifica la columna `type` en la BD. |

## Pendiente de confirmar por el dueño del negocio (`TODO_OWNER`)

Ver `lib/shipping.ts`. La auditoría de Fase 1 encontró cifras de envío
contradictorias entre distintas partes del código real (no solo en documentos de
negocio):

- Footer / ficha de producto / FAQ decían envío nacional $25.000–$30.000 +
  Santa Marta e internacional gratis.
- Las páginas de promoción (`campeones-barca`, `super-clasico`) decían "envío
  gratis a toda Colombia" — contradice lo anterior.

Mientras se confirma la cifra real, todo el código usa la versión de
`lib/shipping.ts` (nacional con costo, Santa Marta e internacional gratis). Avisar
al equipo de desarrollo cuál es la cifra correcta para quitar el marcador
`TODO_OWNER`.
