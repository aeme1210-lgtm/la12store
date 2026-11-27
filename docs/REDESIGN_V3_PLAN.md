# Redesign v3 — "Que parezca una marca, no un catálogo"

Rama: `redesign-v3-marca` · Fecha: 2026-11-26
Origen: auditoría de la propuesta de Gemini contra la BD real (Supabase) y el sitio en vivo.

---

## 1. ¿Cambiar de plataforma? — Alternativas evaluadas

| Opción | Costo aprox. | A favor | En contra | Veredicto |
|---|---|---|---|---|
| **Seguir con Next.js + Supabase + Vercel (actual)** | USD 0–20/mes | Ya tiene checkout de 5 pasos, admin, 2.588 productos, búsqueda con trigramas, imágenes en Storage propio. Control total del diseño. | Depende de que alguien mantenga el código. | ✅ **Recomendado** |
| Shopify | ≥ USD 29/mes + comisión extra por usar pasarela externa (Shopify Payments no opera en Colombia) | Temas "de marca" listos, apps. | Migrar 2.588 productos y ~19.000 fotos, pagar mensualidad + comisión, perder el checkout Bre-B ya hecho. | ❌ |
| Tiendanube | Plan de entrada con comisión por venta (verificar condiciones vigentes en CO) | Fácil, integra Bold/ePayco/PayU/Mercado Pago. | Mismo costo de migración; diseño limitado a plantillas. | ❌ por ahora |
| WooCommerce | Hosting ~USD 10/mes + plugins | Muy conocido. | Más lento, mantenimiento de plugins, seguridad. | ❌ |
| Medusa.js (headless open source) | USD 0 + servidor | Potente. | Sobre-ingeniería para 15–20 pedidos/mes. | ❌ |

**Conclusión:** que el sitio "parezca una web" es un problema de **diseño y de datos**, no de
plataforma. Cambiar de stack costaría semanas y dinero sin resolver lo que hoy hace ver la web
como catálogo (nombres de proveedor, etiquetas apiladas, fotos heterogéneas, falta de relato).

⚠️ **Vercel Hobby es solo para uso no comercial.** Una tienda que vende debería estar en Vercel Pro
(USD 20/mes) o en un proveedor cuyo plan gratuito permita uso comercial. Revisar el plan actual
del proyecto en el panel de Vercel.

---

## 2. Pasarela de pagos "sin pagar" — opciones reales en Colombia

No existe una pasarela con **confirmación automática** que sea gratis. La opción más cercana a
costo cero es construir sobre **Bre-B** (pagos inmediatos del Banco de la República), que ya usa
el checkout actual.

| # | Opción | Costo por venta | Confirmación | Esfuerzo |
|---|---|---|---|---|
| 1 | **Pasarela propia sobre Bre-B** (llave de negocio + QR del banco + checkout actual) | **$0 hoy** (registrar la llave no tiene costo) | Manual en el admin | Bajo — el checkout ya existe |
| 2 | **#1 + conciliación automática con correos del banco** (Gmail API, `googleapis` ya está en el proyecto) | **$0** | Semi-automática: el sistema detecta el pago por monto + hora y el admin confirma con 1 clic | Medio |
| 3 | Wompi (Bancolombia) | QR: 1% + IVA (anunciado sept. 2026). Plan estándar: 2,65% + $700 + IVA | Automática (webhook) | Medio |
| 4 | Bold / ePayco / PayU / Mercado Pago | ~2,5%–3,3% + fijo (PayU estándar CO: 3,29% + $300) | Automática | Medio |

**Recomendación:** #1 ya, #2 como siguiente paso. Dejar #3 solo para quien quiera pagar con
tarjeta. Antes de activar cualquier pasarela de terceros, leer su reglamento de comercios
(productos permitidos), porque una pasarela puede retener fondos si el producto incumple su
política.

**Riesgos de Bre-B:**
- Límite de 1.000 UVB por transacción (~$12,1 M en 2026), sin impacto en este ticket.
- Portafolio reporta que el Gobierno evalúa cobrar a comercios por transacciones Bre-B; hoy no
  está en vigor, así que hay que vigilarlo.
- 4 de los 12 pedidos web se quedaron en "vio instrucciones de pago" y ninguno figura confirmado: el paso de pago es
  donde se pierde la venta.

**Qué falta en el checkout para que funcione como "pasarela propia":**
1. Subir las imágenes QR oficiales (`qrImageUrl` en `lib/payment-methods.ts` está en `null`).
2. Referencia única visible (`L12-…`) que el cliente pone en el concepto de la transferencia.
3. Carga del comprobante a un bucket **privado** de Supabase (hoy no se guarda por una decisión de
   privacidad documentada; requiere decisión del dueño).
4. Estados post-pago: `EN_PREPARACION → EN_TRANSITO → ENVIADO` + página `/rastrear`.
5. #2: conciliación con correos del banco.

---

## 3. Qué se hizo en esta rama

**Fugas y bugs (auditoría)**
- 110 productos "Player Version" se vendían como Fan a $150.000. Ahora la ficha fuerza Jugador
  ($180.000) y oculta Fan (`lib/product-rules.ts`, `lib/pricing.ts`).
- 🔒 La API `POST /api/pedidos` aceptaba el precio enviado por el navegador. Ahora recalcula precio,
  subtotal y total desde la BD y rechaza con 409 si no coinciden.
- Bebé/niño fuera de Estrenos. Sin duplicados Barça/Madrid entre Estrenos y la sección de clásicos.
- Filtro de presupuesto con opción $185.000 (manga larga).
- "Lo más pedido" se renombró a "Clásicos de la casa", porque no hay datos de ventas detrás.
- La ficha decía "✓ En stock" en todo el catálogo. Ahora muestra el plazo real: bajo encargo,
  4–5 semanas.
- Analítica: Vercel Web Analytics (hay que activarla en el panel de Vercel).

**Remodelado de marca**
- Nuevas secciones en el Home: barra de promesas, **colecciones editoriales**, manifiesto, lookbook
  con fotos reales de la marca y guía Fan/Jugador/Retro.
- `/colecciones` y `/coleccion/[slug]`: 6 landings (Mundial 2026, Los 90, Albiceleste y
  Xeneize, Selecciones de leyenda, Noches de Europa, La Tricolor). Son el destino de cada Reel:
  `?utm_source=instagram&utm_campaign=<reel>`.
- La tarjeta de producto tiene ahora fondo neutro uniforme (iguala las fotos de proveedor), una
  sola etiqueta, nombre limpio y tipo en español.

## 4. Siguiente sprint (datos)

Script de normalización con salida a CSV para revisar **antes** de escribir en la BD:
- 1.329 "equipos" → ~150 canónicos.
- Títulos en español.
- `isNew` solo para 26/27.
- Marcar `isLongSleeve`.
- Sacar las 351 tallas que hoy aparecen dentro de los nombres.
- Separar los 240 productos que no son camisetas.
