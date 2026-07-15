# REDESIGN PROGRESS — LA 12 STORE

> Checklist vivo. Se actualiza al cerrar cada fase/subfase. Una sesión nueva retoma leyendo
> `REDESIGN_BRIEF.md` + `REDESIGN_ADENDA.md` + este archivo, sin repetir trabajo.

Rama de trabajo: `redesign`. Prohibido push a `master` durante esta tarea (ver adenda §2).

## Fase 0: Preparación de sesión
- [x] Guardar `docs/REDESIGN_BRIEF.md` y `docs/REDESIGN_ADENDA.md`
- [x] Precondición: git status limpio (fix de seguridad comiteado a master local — pendiente de tu aprobación para push)
- [x] Precondición: `npm run build` pasando
- [x] Crear rama `redesign`
- [x] Crear este checklist

## Fase 1: Auditoría — COMPLETA (ver `docs/REDESIGN_AUDIT.md`)
- [x] Arquitectura (framework, versión, estructura de carpetas)
- [x] Datos (modelo Prisma, origen del catálogo, scripts de importación) — verificado contra BD real
- [x] Diseño (sistema visual actual, tipografía, paleta)
- [x] Navegación / arquitectura de información
- [x] Producto (ficha, galería, selector de talla, personalización)
- [x] Carrito y flujo de WhatsApp
- [x] Rendimiento (imágenes, JS, fuentes)
- [x] SEO (metadatos, sitemap, structured data, og:image) — brecha crítica encontrada
- [x] Accesibilidad — brecha crítica encontrada
- [x] Confianza (reseñas, cifras, footer bancario) — notificaciones falsas confirmadas
- [x] Contenido (tono, textos de prueba, idioma)
- [x] Riesgos (costos, migraciones destructivas, límites de Supabase/Vercel)
- [x] Verificar cada uno de los 16 hallazgos del brief contra el código real
- [x] Documento de diagnóstico interno (`docs/REDESIGN_AUDIT.md`)

## Fase 2: Sistema y estructura — COMPLETA (ver `docs/REDESIGN_SYSTEM.md`)
- [x] Arquitectura de información / rutas
- [x] Taxonomía de producto (normalización derivada, no reestructuración completa)
- [x] Sistema visual (tokens: color, tipografía consolidada a 2 familias, espaciado, radios, sombras)
- [x] Componentes reutilizables (lista definida)
- [x] Estrategia de búsqueda (server-side ILIKE + pg_trgm/unaccent, SQL a mostrar en Fase 3)
- [x] Estrategia de filtros
- [x] Flujo de pedido por WhatsApp (lib/whatsapp.ts + lib/shipping.ts centralizados)

## Fase 3: Correcciones estructurales (datos primero)
- [x] Config centralizada de WhatsApp (`lib/whatsapp.ts`, +57 300 844 3885) — 9+ archivos migrados
- [x] Config centralizada de envíos (`lib/shipping.ts`, marcadores `TODO_OWNER`) — Footer/ProductDetail/FAQ migrados; cifra falsa "envío gratis a toda Colombia" quitada de campeones-barca/super-clasico
- [x] Precios consolidados en `lib/pricing.ts` (una sola fuente; antes había 3 implementaciones distintas — causa del bug de precio catálogo≠ficha)
- [x] Taxonomía tipo/color separada (`lib/taxonomy.ts`, capa derivada, sin tocar la BD) — filtro Tipo/Color ya separados en `/catalogo`
- [x] Informe automático de duplicados generado (`docs/duplicate-report.json`, 623 grupos, 794 filas, solo 1 con OrderItem real)
- [x] Deduplicación de los 794 duplicados — **ejecutada con aprobación explícita del dueño**. Backup completo en `docs/dedupe-backup-2026-07-14T19-29-20-982Z.json`. Verificado post-ejecución: 2,550 productos totales (3,344 - 794), 0 grupos duplicados restantes, `OrderItem` intacto (1 fila, la única real, correctamente preservada pese a tener el slug con sufijo `-2`)
- [x] Corrección de causa raíz en /scripts (`scripts/import_common.py`, upsert seguro, ya no borra la liga completa, captura manga larga) — los 5 pipelines migrados
- [x] Fix seguridad: cuenta bancaria completa ya no se muestra en el paso inicial de checkout, solo tras crear el pedido
- [x] Documentación en `ADMIN_GUIDE.md`
- [x] `pg_trgm`/`unaccent` habilitados en Supabase + índices GIN en `name`/`team` — **ejecutado con aprobación explícita del dueño**. SQL en `docs/db-search-extensions.sql`

## Fase 4: Implementación visual — EN CURSO
- [x] Base tipográfica: consolidada a Playfair Display + Inter en las 32 archivos que usaban Oswald/JetBrains Mono (205 + 19 usos migrados con heurística titular→Playfair, resto→Inter); `app/layout.tsx` ya no carga las 4 fuentes originales
- [x] Tokens de color actualizados en `globals.css` (paleta sobria); eliminado `.gold-glow` (antipatrón "dorado saturado") de los 3 componentes que lo usaban
- [x] `prefers-reduced-motion` respetado globalmente (regla CSS en `globals.css`) — pendiente revisar además los `useEffect`/`setInterval` de `HeroSlider`/`LogoIntro` en detalle
- [x] FAQ: acordeón accesible (`aria-expanded`, `aria-controls`, `role="region"`, respuestas siempre en el HTML vía `hidden` en vez de desmontarse)
- [x] Se eliminó `SocialProofNotification` (notificaciones de compra 100% inventadas — violaba directamente el brief)
- [x] Limpieza de `next.config.ts` (headers vestigiales de `/_next/image` que ya no aplican con el loader custom)
- [x] Header — buscador persistente visible en pantallas grandes (antes escondido tras un ícono), menú móvil con `role="dialog"`, trap de Tab, cierre con Escape y restauración de foco al botón
- [x] Portada — bloque "Encuentra tu camiseta" nuevo (`components/home/ShirtFinder.tsx`): selección/club, estilo (moderno/retro), versión (fan/jugador), presupuesto, talla → filtra productos reales vía `/catalogo` (sin IA externa, sin APIs de pago). Extendí `buildWhere` en `catalogo/page.tsx` para soportar `version`/`precioMax`/`talla` (antes solo liga/tipo/color/q)
- [x] Portada — sección "Comunidad y confianza" corregida (se quitaron cifras inventadas: 500+ clientes/+10 países/100%, se mantiene el video real y se agregan enlaces reales a Instagram); mismo fix en los "trust stats" de la ficha de producto (ahora son compromisos reales: dorsal/parches gratis, cambios por talla, WhatsApp). Meta description corregida (2,500 en vez de 2800, post-dedupe)
- [ ] Portada — pendiente: auditar los ~9 bloques actuales contra el máximo "~8 bloques de alto valor" del brief (hay bloques no listados explícitamente como "Por qué elegirnos" que podrían fusionarse); los filtros nuevos de versión/precio/talla aún no tienen UI en el sidebar de `/catalogo` (`CatalogoFilters.tsx`), solo se llega a ellos vía el buscador guiado
- [ ] Catálogo (tarjetas, filtros visuales, orden, paginación) — filtros Tipo/Color ya separados (Fase 3), falta rediseño visual
- [x] Ficha de producto — AMPLIADA completa: selector de cantidad, campo de parches (wireado hasta el mensaje de WhatsApp vía `patches` en `CartItem`/`WhatsAppOrderItem`, antes existía el campo en el tipo pero nunca se usaba), acordeón accesible nuevo (`components/ui/Accordion.tsx`, reutilizable) con Descripción/Versión y ajuste/Materiales y cuidados/Envíos y cambios/FAQ, "Vistos recientemente" 100% local (`lib/recently-viewed.ts` + `localStorage`, sin servicio externo). Validación de talla obligatoria ya no usa `alert()` nativo (hallazgo de accesibilidad) — ahora es un error inline con `role="alert"` y el selector de talla es un `radiogroup` real. `generateMetadata` tenía el mismo bug de precio inline que el resto (ignoraba versión/manga larga) — ahora usa `getStartingPrice`; se agregó `og:image`/`twitter:card` por producto (imagen real, vía el mismo transform que `supabase-image-loader.js`)
- [x] Buscador — protagonista en el header (Fase 4 antes), no pendiente
- [ ] Carrito — funcional (Fase 3), pendiente rediseño visual
- [ ] Nosotros — pendiente presentación editorial
- [x] Footer — agregados los links que faltaban por completo: `/cambios`, `/privacidad`, `/terminos` (páginas nuevas, contenido mínimo honesto marcado con nota de revisión legal pendiente del dueño, en vez de inventar términos vinculantes). Pendiente: pulido visual más allá de esto
- [x] Estados vacíos y de error — `app/not-found.tsx` (404 con marca), `app/error.tsx` (error boundary con reintentar/WhatsApp), `app/catalogo/loading.tsx` y `app/catalogo/[slug]/loading.tsx` (skeletons) — antes NINGUNO de estos existía, el sitio usaba el 404 genérico de Next sin marca y sin loading states en ningún lado
- [x] SEO adelantado de Fase 5 (aprovechando que ya estaba en estos archivos): `app/sitemap.ts` (páginas estáticas + todos los productos activos) y `app/robots.ts` — antes no existía ninguno de los dos; `og:image`/`twitter:card` global agregado en `app/layout.tsx` (foto real del bucket brand) + `metadataBase`

## Fase 5: Optimización
- [ ] Imágenes (custom loader, sin /render/image/, sin transformaciones de pago)
- [ ] JavaScript (code splitting, imports dinámicos)
- [ ] Fuentes (next/font, Playfair Display + Inter)
- [ ] SEO (og:image global + por producto, twitter:card, sitemap, structured data)
- [ ] Accesibilidad (WCAG 2.2 AA en flujos principales)
- [ ] Responsive (razonado por código; medición visual la hace el dueño)
- [ ] Core Web Vitals (razonado por código; medición real la hace el dueño)

## Fase 6: Control de calidad
- [ ] Build
- [ ] Typecheck
- [ ] Lint
- [ ] Pruebas disponibles
- [ ] Revisión manual (dev)
- [ ] Navegación móvil (razonada por código)
- [ ] Revisión de enlaces
- [ ] Revisión de consola
- [ ] Revisión del pedido por WhatsApp
- [ ] Revisión de precios (catálogo/ficha/carrito consistentes)

## Cierre
- [ ] Push de la rama `redesign` (nunca `master`)
- [ ] URL de preview de Vercel
- [ ] Entrega final (14 puntos del brief)
- [ ] Lista de qué debe verificar el dueño manualmente (Lighthouse, multi-viewport, TODO_OWNER de envíos)

---

## Notas de sesión
- 2026-07-14: Sesión inicial. Se encontró y corrigió antes de empezar: `.claude/settings.local.json`
  estaba trackeado en git (pese a estar en `.gitignore`) con una contraseña de admin en texto plano
  en el historial de comandos permitidos. Se destrackeó y sanitizó. Se comiteó junto con fixes
  preexistentes no relacionados (README.md, prisma/seed.ts ya no hardcodean password) y
  `promo-rls.sql` (política RLS para tabla Promo, documentada pero NO aplicada aún a la BD).
  Ese commit vive en `master` local, sin pushear (pendiente de aprobación del dueño).
- 2026-07-14: Fase 1 completa. Auditoría con 3 agentes paralelos + verificación directa de solo
  lectura contra la BD real (script temporal, borrado tras usarlo). Confirmados exactos: 3,344
  productos, 623 grupos duplicados = 794 filas sobrantes, caso Barcelona/Premier League real.
  Hallazgo nuevo no anticipado: solo 1 fila en `OrderItem` en toda la BD (reduce mucho el riesgo
  del dedupe). Brecha más grave encontrada: cero `og:image`/structured data en todo el sitio.
- 2026-07-14: Decisión del dueño — el tier "Manga Larga" ($185.000) SÍ es real y se agregó al
  esquema (`priceLongSleeve Int?`, `isLongSleeve Boolean @default(false)`), migración 100%
  aditiva. Al aplicarla con `prisma migrate deploy` se descubrió que la tabla `_prisma_migrations`
  no existe en la BD real y `migration_lock.toml` está desalineado (dice `sqlite`) — el proyecto
  en realidad siempre sincronizó el esquema con `prisma db push`, nunca con migraciones
  versionadas. Se aplicó con `db push` (confirmado en BD real, columna por columna) y se
  documentó en `CLAUDE.md`. Limitación conocida: los productos ya existentes NO quedan marcados
  retroactivamente como `isLongSleeve` (el parser descartaba ese dato); solo lo estarán las
  importaciones futuras tras el fix del parser en Fase 3.
- 2026-07-14: Fase 2 completa. Decisión clave: NO se reestructura el modelo Product completo del
  brief (alto riesgo con 3,344 filas ya cargadas); en su lugar, capa de normalización derivada en
  código para separar tipo/color del campo `type` mezclado. Tipografía consolidada a 2 familias
  (Playfair Display + Inter, se eliminan Oswald y JetBrains Mono en Fase 4). Paleta rediseñada para
  uso sobrio del dorado (se elimina el efecto `.gold-glow`, antipatrón que el propio brief prohíbe).
  Ver `docs/REDESIGN_SYSTEM.md`.
- 2026-07-14: Fase 3 en curso. Dos agentes en paralelo (frontend + scripts Python) chocaron con el
  límite de sesión de la cuenta antes de completar su trabajo; se retomó manualmente. Se creó
  `import_common.py` (dedupe real revisado a mano; se descartó un borrador duplicado `lib_import.py`
  del mismo agente). Se centralizó WhatsApp/precios/envíos/taxonomía en `lib/`, se migró toda la UI
  que los usaba, se corrigió la causa raíz de duplicados en los 5 pipelines Python, se corrigió el
  bug de seguridad de la cuenta bancaria en checkout, y se documentó en `ADMIN_GUIDE.md`. Lint
  reveló ~15 errores/warnings preexistentes (patrones `setState` en `useEffect`, uso de `<a>` en vez
  de `<Link>`, etc.) en archivos NO tocados esta sesión — quedan documentados para Fase 4/6, no
  bloquean el cierre de Fase 3. Pendientes de aprobación explícita del dueño antes de ejecutar:
  (1) borrar las 794 filas duplicadas (dry-run OK, backup listo), (2) habilitar `pg_trgm`/`unaccent`
  en Supabase.
