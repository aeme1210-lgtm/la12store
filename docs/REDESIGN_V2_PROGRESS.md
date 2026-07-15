# REDESIGN V2 — PROGRESS

> Checklist vivo. Rama `redesign-v2`. Modo autónomo — ver `docs/DECISIONS_V2.md` para cada
> decisión tomada sin preguntar. Prohibido push/merge a `master`.

## Fase 0: Auditoría real (producción) — COMPLETA (ver `docs/redesign-v2-audit.md`)
- [x] package.json y versiones (Next 16.2.4, React 19.2.4, framer-motion 12.38.0)
- [x] Librería de animación en uso — framer-motion en 9 componentes, inventario completo de patrones prohibidos encontrados
- [x] Componentes de portada — ~9-10 bloques, ritmo repetitivo confirmado
- [x] Layouts/loading — ya existen de la sesión anterior (catalogo, [slug])
- [x] Carrito — hoy es página completa, no drawer (cambio de arquitectura para Fase 3)
- [x] Ficha de producto — ya ampliada en sesión anterior, línea base OK
- [x] Nav móvil — ya accesible (focus trap/Escape) de la sesión anterior
- [x] Checkout existente — 3 pantallas simples, reconstrucción completa necesaria para Fase 5
- [x] Config de WhatsApp — ya centralizada, número correcto confirmado (no aparece el número incorrecto en ningún lado)
- [x] Dónde viven las cuentas de pago — hardcodeadas en `checkout/page.tsx`, a centralizar
- [x] Cálculo de total y envío — `lib/shipping.ts` ya existe, se actualiza con la decisión ya tomada del brief v2
- [x] Comportamiento en la URL publicada (curl real) — 200 OK, verificado
- [x] Consola e hidratación — sin errores conocidos (verificado en sesión anterior + confirmado de nuevo)
- [x] CLS — causas: ninguna animación causa CLS técnico (todas son opacity/transform), pero sí "tambaleo" percibido
- [x] Animaciones de viewport — inventario completo: springs, scale 0.9, translate 40px, parallax real, 3 animaciones `repeat: Infinity`, intro bloqueante post-hidratación
- [x] Dimensiones de imágenes — patrón correcto en general, 1 excepción encontrada (`NosotrosSection.tsx` usa `unoptimized`)
- [x] Documento `docs/redesign-v2-audit.md`

## Fase 1: Estabilidad — COMPLETA
- [x] `lib/motion.ts` — tokens centralizados de duración/curva (micro/drawer/checkoutStep/editorial/shared)
- [x] `components/ui/ScrollAnimations.tsx` reescrito: una sola implementación (`Reveal` parametrizado por dirección) en vez de 2 archivos duplicados; sin `scale` (eliminado `ScaleIn`); translate reducido de 40px a ≤16px; respeta `prefers-reduced-motion` explícitamente vía `useReducedMotion()` en JS, no solo CSS
- [x] `components/home/AnimateOnView.tsx` eliminado — código muerto, nunca se importaba en ningún lado real
- [x] `components/ui/LogoIntro.tsx` eliminado por completo — causa raíz más probable del "tambaleo" (ver `docs/DECISIONS_V2.md`)
- [x] Animación por tarjeta de producto eliminada en los 3 lugares donde existía: `app/catalogo/page.tsx`, `app/catalogo/[slug]/page.tsx` (relacionados), `app/page.tsx` (tendencias) — ahora renderizan directo, sin wrapper de motion
- [x] Grillas decorativas (categorías, Instagram) migradas a `GroupReveal` — una sola revelación del grupo, no por ítem
- [x] `components/home/NosotrosSection.tsx`: parallax real (`useScroll`/`useTransform`) eliminado (prohibido para móvil); bug real corregido (`var(--font-dm-sans)` nunca estaba definida, la sesión anterior no lo detectó); `unoptimized` quitado (inconsistente con el resto del proyecto)
- [x] `app/page.tsx`: mismo fix de `unoptimized` en la grilla de Instagram
- [x] `components/promo/BarcaCountdown.tsx` / `ConfettiBlaugrana.tsx`: 3 animaciones `repeat: Infinity` puramente decorativas (pulso de título, pulso de box-shadow, confeti) removidas o acotadas a un número finito de repeticiones — se conserva el efecto festivo sin motion perpetua
- [x] Build + lint verificados — 13 problemas de lint, 2 menos que antes (se fueron con `LogoIntro.tsx`), ninguno nuevo

## Fase 2: Portada con ritmo editorial — COMPLETA
- [x] Tipografía: Archivo (variable, ejes wght+wdth) reemplaza Playfair en 28 archivos (52 usos)
- [x] Paleta: tokens v2 en globals.css + 302 usos de dorado brillante migrados a bronce en 34 archivos
- [x] Barra informativa compacta — ya existía (UrgencyBar), contenido verdadero (verificado en Fase 0)
- [x] Header sticky estable, nav reducido a 5 ítems curados por colección (Catálogo/Selecciones/Retro/Jugador/26-27) — antes tenía Nosotros/Contacto/FAQ duplicando el footer
- [x] Hero editorial nuevo (`components/home/Hero.tsx`) — 1 foto, altura estable (`h-[90vh] min-h-[600px] max-h-[820px]`), titular breve, 2 CTA, sin carrusel, sin logo animado letra por letra, sin scroll-bounce infinito. `HeroSlider.tsx` eliminado.
- [x] ESTRENOS 26/27 (`components/home/EstrenosSection.tsx` + `lib/estrenos.ts`) — rotación determinista sembrada por fecha (sin cron), Barça/Real Madrid siempre presentes si existen, estado elegante si el catálogo 26/27 todavía está vacío (normal hasta que corra la Fase 4)
- [x] Mundos en composición asimétrica (`components/home/WorldsGrid.tsx`) — un mundo dominante (2x2) + secundarios, reemplaza la grilla uniforme de "Categorías"
- [x] Colección destacada con fondo marfil (`components/home/FeaturedCollection.tsx`) — productos reales `isFeatured`, rompe el negro permanente
- [x] Destacados (Tendencias) en grilla limpia sin animar cada producto — ya corregido en Fase 1
- [x] Encuentra tu camiseta — ya existía (`ShirtFinder`), sin cambios
- [x] Historia Andrés y Silvana full-bleed — `NosotrosSection.tsx` actualizado (altura aumentada, `.font-display`, parallax ya quitado en Fase 1)
- [x] Cómo comprar en 5 pasos (`components/home/ComoComprar.tsx`) — nuevo
- [x] Footer completo sin cuentas bancarias — ya cumplía desde la sesión anterior
- [x] Página recortada a los 8 bloques que le corresponden a `page.tsx` (Hero→Estrenos→Mundos→Destacada→Tendencias→ShirtFinder→Nosotros→ComoComprar); se eliminaron `CounterBanner.tsx`/`LifestyleGallery.tsx` (no forman parte de la estructura de 11 bloques del brief, generaban la repetición "misma grilla diez veces" señalada)
- [x] Build + lint + smoke test en dev verificados (home y catálogo responden 200 sin errores nuevos)

## Fase 3: Transiciones funcionales — COMPLETA (checkout se hace en Fase 5)
- [x] Producto → ficha: fallback sin animación (View Transitions de React no disponible en esta versión, ver Decisión en Fase 0/DECISIONS_V2.md) — navegación normal de Next.js, sin efectos frágiles
- [x] Buscador overlay: transición fade+slide (`drawerTransition`, 220-300ms) en vez de aparecer/desaparecer de golpe; ya tenía foco automático y cierre por botón/Escape desde la sesión anterior, sin mover el header (position:fixed independiente)
- [x] Carrito drawer (`components/cart/CartDrawer.tsx`) — antes /carrito era una página completa; ahora un panel deslizante (`lib/cart-store.ts` con estado `isDrawerOpen`, no persistido), con focus trap, cierre por Escape/backdrop/botón, scroll bloqueado. La página `/carrito` se conserva para enlaces directos. Cambiar cantidad anima solo el ítem (no todo el drawer); agregar al carrito NO fuerza la apertura del drawer (confirmación inline existente, contador estable)
- [x] Checkout con transición entre pasos + indicador de progreso — implementado en Fase 5 (`CheckoutProgress.tsx` + `StepTransition.tsx`, crossfade+slide ≤16px, `DURATION.checkoutStep`)
- [x] Menú móvil: mismo tratamiento de transición (`drawerTransition`) agregado — antes aparecía/desaparecía sin animación

## Fase 4: Temporada 26/27 + Estrenos — COMPLETA (con limitaciones documentadas)
- [x] Backup previo (conteo + slugs) a /backups — `backups/pre-import-2627-2026-07-15T17-40-17-450Z.json` (2,550 productos)
- [x] Scraping Yupoo 26/27 — brief mencionaba 2 páginas, la real tiene 13; se procesó la página 1 completa (46 álbumes). Páginas 2-13 quedan documentadas como pendientes para otra sesión, script reutilizable
- [x] Importación solo-INSERT con dedupe — `scripts/import-2627.ts`. 38 creados, 0 updates/deletes sobre lo existente (2,550 → 2,588 confirmado por conteo exacto). Incidente y fix documentados: primer intento 77.8% error (bug de regex `.jpg`/`.jpeg`) activó correctamente la barandilla de 30%, se corrigió y el reintento bajó a 13.3% (6 `error_fetch` de red, aceptable)
- [x] docs/IMPORT_2627_REPORT.md — creado, con desglose completo
- [x] Colección "Temporada 26/27" navegable — `league: "Temporada 26/27"`, entrada en nav (`?liga=temporada-26-27`) y mapeo en `app/catalogo/page.tsx`
- [x] Sección/página ESTRENOS con rotación diaria determinista — `lib/estrenos.ts` + `components/home/EstrenosSection.tsx`, ya poblada con productos reales (antes mostraba el estado vacío por no existir aún el catálogo 26/27)
- [x] Barça y Real Madrid 26/27 siempre presentes — confirmado en DB (`barcelona-jersey-home-2627`, `real-madrid-jersey-home-2627`)
- [x] Limitación documentada: imágenes de estos 38 productos enlazan directo a `photo.yupoo.com` (CDN del proveedor), no al bucket propio de Supabase — falta `SUPABASE_SERVICE_ROLE_KEY` en este entorno. Ver decisión en `docs/DECISIONS_V2.md` y plan de migración en `docs/IMPORT_2627_REPORT.md`

## Fase 5: Checkout interno — COMPLETA
- [x] Config central de pagos — `lib/payment-methods.ts` (id, nombre, titular, número/llave, color, instrucciones, deepLink oficial opcional, qr opcional, a11y). Corrección de datos: "Nubank — @AME429" era un error de etiqueta en todo el sitio, la llave real es **Bre-B** — corregido en footer/contacto/faq/carrito/producto/checkout
- [x] Paso 1: Datos — nombre, WhatsApp, ciudad, departamento, dirección, barrio/referencia, notas; email opcional; validación real (teléfono/email) con mensajes inline; `components/checkout/Step1Datos.tsx`
- [x] Paso 2: Entrega — productos/tallas/personalizaciones/cantidades, subtotal, línea de envío honesta (`shippingLineFor()`), total; `components/checkout/Step2Entrega.tsx`
- [x] Paso 3: Revisión — todo editable (botones vuelven a paso 1/2), código `L12-YYYYMMDD-XXXX` generado sin colisión (`generateOrderCode()` + verificación contra la BD en `app/api/pedidos/route.ts`); `components/checkout/Step3Revision.tsx`
- [x] Paso 4: Pago — 4 métodos reales (Nequi/DaviPlata/Bancolombia/Bre-B) con titular/número/total, botones de copiar con confirmación visual, sin QR ni deep link inventado (slots `qrImageUrl`/`officialDeepLink` en `null` con `TODO_OWNER`); `components/checkout/Step4Pago.tsx`
- [x] Paso 5: Comprobante — archivo local (JPG/PNG/WEBP/PDF, máx. 8MB, preview/quitar/reemplazar), Web Share API con fallback a copiar+abrir WhatsApp; nunca se sube a ningún storage; `components/checkout/Step5Comprobante.tsx`
- [x] Estados honestos — `lib/order-status.ts` (DRAFT/READY_FOR_PAYMENT/PAYMENT_INSTRUCTIONS_VIEWED/RECEIPT_SELECTED/RECEIPT_SHARE_STARTED/PENDING_VERIFICATION/CONFIRMED_MANUALLY), endpoint público restringido `app/api/pedidos/[id]/status/route.ts`, nunca "pagado" automático — verificado en un pedido de prueba real (creado y confirmado en la BD, luego borrado)
- [x] Persistencia local (sin comprobante) — `lib/checkout-store.ts` (zustand persist), el `File` del comprobante vive solo en memoria de React, nunca se persiste; aviso "vuelve a seleccionarlo" si el estado indica que ya había uno
- [x] `ADMIN_GUIDE.md`: protocolo anti-comprobantes-falsos + cómo cambiar cuentas/QR/WhatsApp/envío — sección añadida al archivo existente (no se creó un duplicado en `docs/`)
- [x] Bug de hidratación real encontrado y corregido durante la prueba end-to-end (ver `docs/DECISIONS_V2.md`) — afectaba toda página con carrito no vacío, no solo el checkout
- [x] `/carrito`: quitado un segundo flujo de pago duplicado (leak de cuentas + sin código de pedido ni estados honestos) — ahora dirige a `/checkout`
- [x] Build + lint verificados tras todos los cambios de Fase 5. Lint pasó de 10 a 13 problemas: los 3 nuevos son la misma regla (`react-hooks/set-state-in-effect`) que ya aparecía 4 veces antes de esta fase en el proyecto (Navbar, BarcaCountdown, SuperClasicoCountdown, UrgencyBar) — es el patrón estándar "mounted guard" para evitar mismatches de hidratación, usado a propósito en `lib/use-hydrated.ts` y sus 2 nuevos consumidores (`app/carrito/page.tsx`, `Navbar.tsx`). No es deuda nueva, es el mismo patrón ya aceptado en el proyecto aplicado a más lugares que lo necesitaban

## Fase 6: Rendimiento y cierre — COMPLETA
- [x] Build/typecheck/lint — build limpio, lint estable (13 problemas, todos pre-existentes o el mismo patrón `mounted`-guard ya aceptado en el proyecto, ver Fase 5)
- [x] Revisión de consola — sin errores ni mismatches de hidratación en Home, Catálogo, ficha de producto, Nosotros, Checkout, `/admin/login` (verificado con navegador real en esta sesión)
- [x] Lista de verificación manual para el dueño — `docs/REDESIGN_V2_QA_CHECKLIST.md` (Lighthouse, multi-viewport y accesibilidad no se pueden medir desde este entorno, se documentó qué revisar en la preview)
- [x] Entrega final — ver sección "Notas de sesión" abajo
- [x] Push de `redesign-v2` + URL de preview

---

## ENTREGA FINAL

### Causas reales del "tambaleo" (Fase 0 audit → Fase 1 fix)
`LogoIntro.tsx` (video intro a pantalla completa, bloqueante, activado en un
`useEffect` post-hidratación — el usuario veía la portada real, luego JS la
tapaba entera, luego la destapaba 3.5s después) era la causa raíz más
probable — eliminado por completo. Causas secundarias: animación por
tarjeta de producto en 3 grillas, parallax real (`useScroll`/`useTransform`)
en la sección Nosotros, 3 animaciones `repeat: Infinity` decorativas
(BarcaCountdown/Confetti), carrusel automático + logo animado letra por
letra en el hero viejo, `scale: 0.9` y `translate: 40-100px` en las
revelaciones de scroll. Ver detalle completo en `docs/redesign-v2-audit.md`.

### Animaciones eliminadas / nuevas transiciones
Eliminadas: springs de sección completa, `scale` en reveals, parallax
móvil, animación por tarjeta, scroll reveals repetibles, 3 `repeat:
Infinity`. Sistema nuevo centralizado en `lib/motion.ts` (micro 160ms,
drawer 260ms, checkoutStep 280ms, editorial 420ms, curvas
`cubic-bezier(0.22,1,0.36,1)`/`(0.4,0,1,1)`, `prefers-reduced-motion`
respetado vía `useReducedMotion()`). Nuevas transiciones funcionales:
carrito como drawer con backdrop y foco atrapado, buscador como overlay
estable, menú móvil con `drawerTransition`, checkout con crossfade+slide
≤16px entre los 5 pasos + indicador de progreso.

### Sistema cromático/tipográfico
Paleta bronce (`#A47C42`) reemplaza dorado brillante en 34 archivos (302
usos). Tipografía Archivo (variable, ejes `wght`+`wdth`) reemplaza
Playfair en 28 archivos (52 usos), + Inter para UI/cuerpo — ambas vía
`next/font/google`.

### Estructura de portada
Hero editorial estático (1 foto, sin carrusel) → Estrenos 26/27 (rotación
diaria determinista) → Mundos (composición asimétrica) → Colección
destacada (fondo marfil) → Tendencias (grilla limpia) → Encuentra tu
camiseta → Historia Andrés y Silvana → Cómo comprar → footer. Nav reducido
a 5 ítems curados por colección.

### Arquitectura del checkout
5 pasos con estado en `lib/checkout-store.ts` (persistido, sin el archivo
del comprobante) — Datos → Entrega → Revisión (crea el pedido real vía
`POST /api/pedidos`, código `L12-YYYYMMDD-XXXX` sin colisión) → Pago →
Comprobante. Estados honestos en `lib/order-status.ts`, reportados por el
cliente vía `PATCH /api/pedidos/[id]/status` (endpoint público restringido
a un subconjunto de estados que nunca puede auto-confirmar ni sobrescribir
una confirmación manual). Nunca existe un estado "pagado" automático.

### Métodos de pago configurados
`lib/payment-methods.ts` — Nequi, DaviPlata, Bancolombia, Bre-B (dato
corregido: aparecía mal etiquetado como "Nubank" en 6 archivos). Fuera del
checkout solo se exponen nombres, nunca cuentas/llaves (antes aparecían en
footer, `/contacto`, `/faq` y `/carrito` — corregido).

### Deep links oficiales
No se encontró documentación oficial de esquemas `nequi://`/equivalentes
para Bancolombia/DaviPlata/Bre-B con monto prellenado — campo
`officialDeepLink` queda en `null` con `TODO_OWNER` en vez de inventar uno.
QR: slot `qrImageUrl` vacío hasta que el dueño suba la imagen real.

### Comprobante / Web Share / fallback
Paso 5: archivo local en memoria (nunca en localStorage ni subido a ningún
storage), botón "Compartir por WhatsApp" usa `navigator.share`+`canShare`
con el archivo cuando el navegador lo soporta; fallback sin soporte copia
el resumen y abre `wa.me` con el texto precargado. Verificado en un
navegador real hasta crear un pedido de prueba (ver `docs/DECISIONS_V2.md`).

### Resultado de import 26/27
38 productos creados (0 updates/deletes), página 1 de Yupoo (46 álbumes,
de 13 páginas totales — 2-13 pendientes para otra sesión). Detalle
completo, incidencias y limitación de imágenes (hotlinking a Yupoo,
confirmado inestable en esta sesión) en `docs/IMPORT_2627_REPORT.md`.

### Dependencias agregadas
**Ninguna.** Todo el trabajo de v2 usó las dependencias ya presentes en
`package.json` (framer-motion, zustand, zod, lucide-react, next/font) —
cero gasto, cumpliendo la regla de negocio de "cero gasto adicional".

### Resultados de build/typecheck/lint
`npm run build` limpio en cada cierre de fase (incluida la Fase 6 final).
Lint: 13 problemas — 10 pre-existentes documentados desde la Fase 0/4, y 3
del mismo patrón `mounted`-guard (`react-hooks/set-state-in-effect`) ya
aceptado 4 veces en el proyecto antes de esta fase, aplicado a 2 lugares
más que lo necesitaban para corregir un bug real de hidratación (ver
abajo). Cero errores de TypeScript.

### Decisiones tomadas
Registro completo con justificación en `docs/DECISIONS_V2.md` — incluye
la decisión de imágenes 26/27 vía CDN de Yupoo (sin `SUPABASE_SERVICE_ROLE_KEY`
en este entorno), el alcance parcial del import (página 1 de 13), la
migración de paleta en dos pasos, el fallback de View Transitions, la
corrección de datos de pago (Bre-B, cuentas fuera del checkout), y el bug
de hidratación encontrado y corregido en QA de Fase 5.

### Hallazgo importante para antes del merge a producción
Durante la prueba real del checkout se confirmó que las imágenes de los 38
productos de la Temporada 26/27 (alojadas directo en `photo.yupoo.com`)
son inestables: la misma URL sirvió la foto real en una carga y una
versión reducida (posible marcador de acceso restringido) en otra, sin
cambios de código. **Se recomienda migrar estas imágenes al bucket propio
de Supabase Storage antes de aprobar el merge** — requiere que el dueño
provea `SUPABASE_SERVICE_ROLE_KEY`. Ver `docs/IMPORT_2627_REPORT.md`.

### Push y preview
Rama `redesign-v2` pusheada a `origin`. `master` no fue tocado en ningún
momento de esta sesión. URL de preview: ver mensaje de cierre de la
conversación (se obtiene después de pushear, vía Vercel).

## Notas de sesión
