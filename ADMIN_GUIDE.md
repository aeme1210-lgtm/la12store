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
| Cifras de envío | `lib/shipping.ts` | Política decidida (ver abajo) — sin marcadores `TODO_OWNER` pendientes. |
| Métodos de pago (cuentas, llaves, QR) | `lib/payment-methods.ts` | Única fuente. Fuera del checkout solo se muestran NOMBRES (`paymentMethodNames()`) — nunca números/llaves. |
| Estados del pedido | `lib/order-status.ts` | Vocabulario honesto — ver "Protocolo anti-comprobantes-falsos" abajo. |
| Traducción tipo/color de camiseta | `lib/taxonomy.ts` | Capa derivada de solo lectura; no modifica la columna `type` en la BD. |

## Envíos (política decidida — REDESIGN_V2)

`lib/shipping.ts` ya no tiene cifras pendientes de confirmar:

- **Santa Marta: gratis.**
- **Envío nacional: se confirma por WhatsApp según el destino, antes de pagar.**
  El checkout nunca muestra ni cobra un monto de envío inventado — solo esta
  frase honesta. Coordina el costo real con el cliente por WhatsApp una vez
  tengas su ciudad exacta.

Las cifras viejas ($25.000–$30.000 nacional, envío internacional "gratis") que
la auditoría de Fase 1 encontró contradictorias en el código real fueron
retiradas de todo el sitio (footer, FAQ, ficha de producto) — ya no aparecen en
ningún lado.

## Cómo cambiar las cuentas de pago, el QR o el número de WhatsApp

1. **Cuentas de pago**: edita el array `PAYMENT_METHODS` en `lib/payment-methods.ts`
   (`titular`, `number` — número o llave según el tipo, `instructions`). Es la
   única fuente: el checkout, y los nombres que aparecen en footer/FAQ/contacto,
   se actualizan solos.
2. **Imagen QR**: sube la imagen a donde prefieras (por ejemplo el bucket
   `brand` de Supabase Storage que ya usan los videos de liga) y pega la URL en
   el campo `qrImageUrl` del método correspondiente. Mientras esté en `null` el
   checkout muestra "QR disponible próximamente" en vez de un QR inventado —
   **nunca generes un QR financiero a mano**, tiene que ser la imagen real del
   banco/app.
3. **Desactivar un método temporalmente** (por ejemplo si una cuenta se
   bloquea): pon `active: false` en ese método — desaparece del checkout sin
   borrar sus datos.
4. **Deep link oficial** ("abrir app" con monto prellenado): solo si Nequi,
   DaviPlata, Bancolombia o el sistema Bre-B publican un esquema de enlace
   oficial y documentado. Pégalo en `officialDeepLink`. Mientras esté en
   `null`, el checkout no promete un enlace que no existe — no inventes un
   esquema como `nequi://` sin confirmarlo con la documentación oficial del
   banco.
5. **Número de WhatsApp**: `WHATSAPP_NUMBER` en `lib/whatsapp.ts` — un solo
   lugar, se usa en todo el sitio (nav, WhatsApp flotante, checkout, mensajes
   de pedido).
6. **Envío**: `SHIPPING` en `lib/shipping.ts` — cambia el texto de la política,
   no un número fijo (ver sección de arriba sobre por qué).

Después de cualquier cambio en estos archivos: `npm run build` para confirmar
que compila, y probar un pedido de prueba en el checkout antes de considerar el
cambio terminado.

## Protocolo anti-comprobantes-falsos (pedidos "pendientes de verificación")

Este negocio no tiene pasarela de pago automática — **nunca existe un estado
"pagado" puesto por el sistema**. Todo pedido que un cliente completa en el
checkout queda en `PENDING_VERIFICATION` ("Pendiente de verificación") hasta
que alguien del equipo lo revisa a mano. El pedido llega por dos caminos
posibles, según el navegador del cliente:

- **Compartir directo** (`RECEIPT_SHARE_STARTED` → `PENDING_VERIFICATION`): el
  celular del cliente abre su propio WhatsApp con el comprobante y el resumen
  del pedido ya adjuntos (Web Share API) — llega como cualquier archivo
  compartido normal en la conversación de WhatsApp del negocio.
- **Fallback sin compartir archivos** (navegadores que no soportan compartir
  adjuntos, ej. algunos de escritorio): el checkout copia el resumen del
  pedido y abre `wa.me` con el texto precargado, pidiéndole al cliente que
  adjunte el comprobante manualmente desde su galería antes de enviar.

**Antes de marcar un pedido como `CONFIRMED_MANUALLY` en `/admin/pedidos`,
verifica siempre:**

1. Abre la app bancaria/billetera real (Nequi, Bancolombia, DaviPlata) y busca
   el movimiento — no te bases solo en mirar la imagen del comprobante que
   envió el cliente. Los comprobantes se pueden editar con cualquier editor de
   fotos.
2. Compara **monto exacto, fecha/hora reciente y titular/origen** del
   movimiento real contra el pedido (`orderNumber`, `total` en `/admin/pedidos`).
3. Si el monto no coincide exactamente, o no encuentras el movimiento, **no
   confirmes** — contacta al cliente por WhatsApp (botón "Contactar por
   WhatsApp" en la fila del pedido) antes de despachar cualquier cosa.
4. Solo después de verificar el movimiento real, cambia el estado a
   "Confirmado manualmente" en el selector de la fila del pedido.

El campo "Comprobante" que se ve en cada pedido en `/admin/pedidos` es
únicamente el **nombre del archivo** que el cliente seleccionó (para que
sepas qué buscar en la conversación de WhatsApp) — el archivo en sí nunca se
sube a ningún servidor ni bucket nuestro, así que no existe una copia interna
para revisar sin ir a la conversación real de WhatsApp.
