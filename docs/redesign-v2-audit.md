# FASE 0 — AUDITORÍA REAL — REDESIGN V2

> Formato: problema → ruta → componente → causa → solución → resultado.
> Verificado contra código real de `master` (producción) + `curl` contra
> `https://la12store.vercel.app/` + inspección de `node_modules` para confirmar
> disponibilidad real de APIs (React ViewTransition, next/font Archivo).

## Stack real (no asumido)
- Next.js `16.2.4` (App Router, Turbopack), React `19.2.4`, `framer-motion` `12.38.0`, TypeScript `^5`.
- **React 19.2.4 NO exporta el componente experimental `ViewTransition`** (verificado con `node -e` sobre el paquete real instalado — solo expone `startTransition`/`useTransition`, que es la API de Concurrent Mode, no de transiciones visuales). Ver `docs/DECISIONS_V2.md`.
- **`Archivo` SÍ está disponible en `next/font/google`** con variable font, eje `wght` 100-900 y eje `wdth` 62-125 (confirmado en `font-data.json` del paquete real) — permite Black (900) + Expanded (wdth 125) auténticos vía variación, no solo letter-spacing.

## Causa raíz del "tambaleo" — inventario de animación real

Framer-motion se usa en 9 componentes. Los patrones exactos que el brief pide eliminar están presentes:

| Componente | Patrón encontrado | Por qué causa inestabilidad percibida |
|---|---|---|
| `components/ui/ScrollAnimations.tsx` | `ScaleIn`: `scale: 0.9→1` por CADA tarjeta de producto (usado en grillas de 8-24+ productos) | Docenas de animaciones simultáneas/escalonadas al hacer scroll en catálogo/portada — el "banned pattern" exacto del brief (escalados 0.9/0.95 + animación por tarjeta) |
| `components/ui/ScrollAnimations.tsx` | `FadeInLeft`/`FadeInRight`: `x: ±40` | Translate 40px — dentro del rango explícitamente prohibido (40-100px) |
| `components/home/HeroSlider.tsx` | Carrusel automático cada 5s + `AnimatePresence` crossfade 2s | El brief prohíbe explícitamente carrusel automático en el nuevo hero |
| `components/home/HeroSlider.tsx` | Logo "LA 12 STORE" animado letra por letra (11 `motion.span`, stagger 0.06s) en CADA carga de portada | Motion gratuita y repetitiva, contribuye a sensación de inestabilidad en la primera impresión |
| `components/home/HeroSlider.tsx` | Scroll-bounce con `repeat: Infinity` | Animación infinita nunca se asienta — exactamente lo que el usuario percibe como "tambaleo" |
| `components/ui/LogoIntro.tsx` | Overlay de video a pantalla completa, bloqueante 3.5s, solo se activa en un `useEffect` post-hidratación | **Causa raíz más probable del "tambaleo" reportado**: el HTML servido por el servidor muestra la portada real; tras hidratar, JS cubre TODA la pantalla con negro+video; 3.5s después desaparece. Esa secuencia "flash de contenido real → tapado → destapado" es un patrón clásico de inestabilidad visual severa. Además: sin acceso por teclado (ya señalado en la auditoría anterior), sin duración configurable. |
| `components/home/NosotrosSection.tsx` | Parallax real con `useScroll`/`useTransform` (`y: -8%→8%` ligado al scroll) sobre imagen de fondo | El brief prohíbe explícitamente parallax en móvil — scroll-linked transforms vía JS son una causa común de jank en Safari/iOS |
| `components/home/NosotrosSection.tsx` | `style={{ fontFamily: "var(--font-dm-sans)" }}` | **Bug real encontrado**: `--font-dm-sans` no está definido en NINGÚN lugar del proyecto (verificado por grep) — ese párrafo cae silenciosamente a la fuente por defecto del navegador, rompiendo la consistencia tipográfica sin que se note a simple vista |
| `components/home/NosotrosSection.tsx` | `<Image fill unoptimized>` con `scale-110` vía className | `unoptimized` salta el loader custom por completo (funciona por coincidencia porque el src ya es una URL absoluta, pero es inconsistente con el resto del proyecto) |
| `components/promo/BarcaCountdown.tsx` | `scale: [1, 1.05, 1]` con `repeat: Infinity`; `opacity: [0,1,0]` con `repeat: Infinity` | Pulso infinito + parpadeo infinito — motion continua sin fin |
| `components/promo/ConfettiBlaugrana.tsx` | Partículas cayendo con `repeat: Infinity` | Animación continua de fondo, costo de rendimiento persistente mientras la promo esté activa |

**Diagnóstico**: el "tambaleo" no es un único bug sino la suma de (a) el intro de video bloqueante con su secuencia flash-tapa-destapa, (b) animación por-tarjeta en grillas grandes multiplicando el costo de scroll, (c) parallax JS-driven en móvil, y (d) varias animaciones `repeat: Infinity` que nunca dejan la interfaz "quieta". Ninguna de estas causa Cumulative Layout Shift en el sentido estricto de Lighthouth (todas animan `opacity`/`transform`, propiedades compositor-only que no afectan layout) — es inestabilidad **percibida**, no CLS técnico, aunque igual de real para quien lo experimenta.

## Imágenes
- Patrón dominante correcto: `fill` + `sizes` explícito (confirmado en `ProductCard`, `ProductDetail`, hero, etc.) — sin regresión aquí.
- Loader custom (`supabase-image-loader.js`) sigue sin usar `/render/image/`, confirmado de nuevo.
- Excepción encontrada: `NosotrosSection.tsx` usa `unoptimized` (ver tabla arriba) — inconsistente, a corregir en Fase 1.

## Estructura actual de portada, carrito, checkout (línea base para Fase 2/3/5)
- **Portada** (`app/page.tsx`): banners promo condicionales → Hero (carrusel) → Tendencias (grid con `ScaleIn` por card) → CounterBanner → LifestyleGallery → Categorías (grid) → **ShirtFinder** (ya existe, agregado en la sesión anterior) → "Por qué elegirnos" → Comunidad y confianza → NosotrosSection (parallax) → Footer. Son ~9-10 bloques con ritmo visual similar (mayoría fondo negro, grillas repetidas) — coincide con la crítica del brief de "la misma grilla diez veces".
- **Carrito**: hoy es una **página completa** (`/carrito`), no un drawer. El brief pide un drawer para Fase 3 — es un cambio de arquitectura, no solo de estilo.
- **Checkout**: hoy es un flujo de 3 pantallas simples (formulario → método de pago con detalle → confirmación), sin pasos numerados, sin código de pedido determinístico documentado como tal, sin subida de comprobante, sin Web Share API, sin estados explícitos más allá de local `step` en memoria. El brief pide un rediseño completo a 5 pasos con persistencia, estados honestos y manejo de archivo — reconstrucción, no ajuste.
- **WhatsApp**: ya centralizado en `lib/whatsapp.ts` desde la sesión anterior, número confirmado `573008443885` en todo el proyecto (grep no encontró el número incorrecto `573167548107` en ningún lado — ya estaba limpio).
- **Cuentas de pago**: hoy viven hardcodeadas dentro de `app/checkout/page.tsx` (array `paymentMethods`), no en un archivo de configuración central — a mover en Fase 5.
- **Envío**: `lib/shipping.ts` ya existe (sesión anterior) con marcador `TODO_OWNER` para la cifra nacional contradictoria. El brief v2 ya trae la decisión tomada ("Santa Marta gratis, nacional se confirma por WhatsApp") — se actualiza `lib/shipping.ts` para reflejar esto en Fase 5, sin bloquear ni inventar tarifa.

## Consola / hidratación (producción real)
- `curl` contra `https://la12store.vercel.app/` responde 200, HTML de 166KB, sin poder ejecutar JS desde la terminal (limitación ya conocida — la verificación real de consola/hidratación en navegador la hace el dueño, documentado en `docs/REDESIGN_QA_CHECKLIST.md` de la v1).
- Local (`npm run dev`, sesión anterior): sin errores de hidratación en `/`, `/catalogo`, `/faq`. Advertencia de imagen `next-image-missing-loader-width` ya evaluada y aceptada como cosmética de dev.

## Decisión de alcance para "conservar lo que sí funciona"
Se conservan: paginación server-side real del catálogo, `lib/{whatsapp,pricing,shipping,taxonomy}.ts`, estructura de datos y scripts de importación (`import_common.py`), SEO (`sitemap.ts`/`robots.ts`/JSON-LD/`og:image`), estados vacíos/error, accesibilidad ya agregada (FAQ, header, ficha). Se reconstruye: sistema de motion completo, tipografía (Playfair→Archivo), paleta (dorado brillante→bronce sobrio), arquitectura de portada/carrito/checkout.
