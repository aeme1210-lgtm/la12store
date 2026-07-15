# FASE 6 — CONTROL DE CALIDAD — LA 12 STORE

> Reparto de QA (adenda §6): Claude Code implementa, razona el responsive por código y corre
> build/typecheck/lint/consola en dev. La verificación visual multi-viewport y Lighthouse/PageSpeed
> las hace el dueño sobre la URL de preview — esta es la lista exacta de qué medir y dónde.

## Lo que ya verifiqué (código + herramientas)

- [x] **Build**: `npm run build` pasa limpio en cada commit de la rama `redesign` (última verificación: sin errores).
- [x] **Typecheck**: `npx tsc --noEmit` sin errores (además de la verificación de TypeScript integrada en `next build`).
- [x] **Lint**: `npm run lint` — 15 problemas, **todos preexistentes** a esta sesión (patrones `setState` en `useEffect` en `LogoIntro.tsx`/`UrgencyBar.tsx`/`BarcaCountdown.tsx`/`SuperClasicoCountdown.tsx`, y `require()` en `scripts/check-admin-passwords.js`). Ninguno introducido por el rediseño; los que sí introduje (o encontré de paso) se corrigieron.
- [x] **Revisión de consola (dev)**: corrí `npm run dev` y revisé el log del servidor. Encontré y evalué:
  - Advertencia `next-image-missing-loader-width` en todas las imágenes de producto — **es solo de modo desarrollo** (Next no la emite en producción) y refleja la decisión intencional de no redimensionar imágenes en caliente (evita reintroducir costos de Supabase Image Transformations). Documentada como esperada, no se "arregló" con un cambio a la URL que no pude verificar visualmente en un navegador real.
  - Sin errores de hidratación ni excepciones no capturadas en las rutas probadas (`/`, `/catalogo`, `/faq`).
- [x] **Revisión de enlaces**: los links internos ahora usan `<Link>` de Next (se corrigieron los `<a>` sueltos encontrados en `nosotros`/`checkout`); breadcrumb dinámico en ficha de producto verificado contra BD real.
- [x] **Revisión del pedido por WhatsApp**: mensaje único (`lib/whatsapp.ts`) usado por ficha, carrito y checkout — incluye producto, URL real, talla, versión, dorsal, parches, cantidad, precio unitario, subtotal, ciudad y notas cuando aplican. Verificado por lectura de código en los tres flujos.
- [x] **Revisión de precios**: catálogo, ficha y carrito usan la misma fuente (`lib/pricing.ts`) — se eliminaron las 3 implementaciones distintas que causaban la inconsistencia original. Se encontraron y corrigieron instancias adicionales del bug en `ProductCard.tsx`, `SuperClasicoCard.tsx` y `generateMetadata` de la ficha (se me habían escapado en un primer paso).

## Lo que necesitas verificar tú, con la extensión de Chrome / Lighthouse, sobre la preview

**URL de preview**: `https://la12store-git-redesign-aeme1210-lgtms-projects.vercel.app/`

### 1. Lighthouse / PageSpeed Insights (ejecutar sobre esa URL, no localhost)
- Pestaña Mobile y Desktop por separado.
- Anotar: LCP, INP (o TBT como proxy), CLS, puntaje de Accesibilidad, puntaje de SEO.
- Objetivo del brief: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Páginas a medir como mínimo: `/`, `/catalogo`, un producto (`/catalogo/[slug]`).

### 2. Multi-viewport (DevTools → Toggle device toolbar, o la extensión de Chrome)
Anchos exactos que pide el brief: **320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px**.

Por cada ancho, revisar en `/`, `/catalogo`, un producto, `/carrito`:
- Header (logo, buscador, carrito, menú) — nada se corta ni se superpone.
- Menú móvil (< 768px): abre con foco correcto, se cierra con Escape, el trap de Tab no deja escapar el foco.
- Buscador guiado "Encuentra tu camiseta" (`/`) — los 5 selects son usables sin scroll horizontal.
- Grilla del catálogo — 2 columnas en móvil, sin overflow horizontal.
- Ficha de producto — galería, selector de talla, acordeón, todo legible y sin desbordes.
- Botones de WhatsApp/Agregar al carrito — accesibles con el pulgar, no tapan contenido.

### 3. Compartir en WhatsApp/Instagram (criterio de aceptación #27 de la adenda)
- Pega un link de un producto real (`/catalogo/<slug>`) en un chat de WhatsApp (a ti mismo o un grupo de prueba) y confirma que se ve foto + título + descripción reales, no genéricos.
- Repite con el link de la portada (`/`) — debe mostrar la foto de marca configurada en `lib/brand-urls.ts` (`BRAND_URLS.hero[0]`).
- Nota técnica: como es una URL de preview de Vercel (no el dominio final), algunos crawlers de redes sociales cachean agresivamente — si no se ve bien a la primera, probar con el [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) para forzar un re-scrape, o probar directo en el dominio de producción una vez aprobado el merge.

### 4. Navegación con teclado (sin mouse)
- Tab a través del header: logo → buscador → carrito → hamburguesa (móvil) → contenido.
- En la ficha de producto: Tab hasta el selector de talla (ahora es un `radiogroup`, las flechas deberían moverse entre tallas) y hasta el acordeón (Enter/Space debe abrir/cerrar cada sección).
- En el menú móvil abierto: Tab no debe salir del menú (trap), Escape debe cerrarlo.

### 5. Lector de pantalla (VoiceOver en Mac, Narrator en Windows, o NVDA)
- FAQ y acordeón de ficha de producto: confirmar que anuncia "expandido/contraído".
- Carrito: cambiar cantidad y confirmar que el lector anuncia el nuevo total (`aria-live`).

## TODO_OWNER pendientes (no bloquean el merge, pero hay que resolverlos)

Ver también `lib/shipping.ts` y `docs/REDESIGN_AUDIT.md`.

1. **Cifra real de envío nacional**: el código encontró versiones contradictorias ($25.000-$30.000 vs. gratis). Se implementó con la versión más citada, marcada `TODO_OWNER` — confirmar la cifra real.
2. **Manga Larga retroactivo**: los productos importados antes de este rediseño no quedan marcados como `isLongSleeve` (el parser lo descartaba). Si hay productos manga larga ya en catálogo, hay que identificarlos manualmente o re-escanear el origen en Yupoo.
3. **Revisión legal**: `/privacidad` y `/terminos` tienen contenido mínimo honesto pero están marcados explícitamente como pendientes de revisión legal formal.
4. **Push de `master`**: el fix de seguridad original (contraseña de admin destrackeada) vive en `master` local desde el inicio de la sesión, sin pushear — confirmar si se debe pushear ahora o esperar al merge de `redesign`.
