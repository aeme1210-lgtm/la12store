# FASE 1 — DIAGNÓSTICO DE AUDITORÍA — LA 12 STORE

> Generado 2026-07-14. Verificado contra código real del repo (rama `redesign`) y, donde se indica,
> contra una consulta de solo lectura a la base de datos de producción (Supabase Postgres).
> Metodología: 3 auditorías paralelas (datos/backend, frontend/contenido, SEO/rendimiento/accesibilidad)
> + verificación directa de conteos vía Prisma read-only.

## 1. Arquitectura
- Next.js `16.2.4` (App Router), React `19.2.4`, Prisma `7.8.0` + `@prisma/adapter-pg`, Tailwind 4, Zustand (carrito).
- Rutas: `app/page.tsx` (home), `catalogo/page.tsx` + `catalogo/[slug]/page.tsx`, `carrito`, `checkout`, `nosotros`, `faq`, `contacto`, `campeones-barca`/`super-clasico` (promos), `admin/(protected)/*`, `api/*`.
- Patrón de conexión a BD (pooler 6543 runtime / DIRECT_URL 5432 CLI, singleton) se cumple correctamente (`lib/prisma.ts`, `prisma.config.ts`).
- **Riesgo**: la migración inicial (`prisma/migrations/20260326212132_init/migration.sql`) usa sintaxis SQLite (`DATETIME`, `CURRENT_TIMESTAMP`) pese a que `schema.prisma` declara `provider = "postgresql"` — indicio de drift entre el historial de migraciones versionado y el esquema real en Supabase. Además hay un `prisma/dev.db` (SQLite) suelto en el repo. **No tocar migraciones sin antes confirmar el esquema real de Supabase.**

## 2. Datos — verificado contra BD real (solo lectura)
- **Total de productos: 3,344** (confirmado por consulta directa — coincide exacto con la adenda).
- **Duplicados: 623 grupos de nombre repetido = 794 filas sobrantes** (confirmado exacto).
- Distribución por liga: Retro 677, Mundial FIFA 2026 468, Premier League 440, Selecciones Nacionales 408, Serie A 331, La Liga 279, Other Clubs 195, Brasileirao 171, New Season 132, Liga Argentina 127, Ligue 1 59, Bundesliga 57.
- **`OrderItem` real en toda la BD: solo 1 fila.** El riesgo de "borrar un producto referenciado en un pedido" durante el dedupe es mínimo en la práctica (afecta como máximo a 1 producto), aunque la regla de nunca borrar filas referenciadas se mantiene sin excepción.
- **Caso Barcelona/Premier League confirmado en BD real**: producto `id 99ef50dc...`, `name: "05/06 Barcelona home LS Champions League Home Retro"`, `team: "Barcelona home LS Champions League"` (nombre de equipo corrompido — arrastra texto que no es el equipo), `league: "Premier League"`. Causa raíz de código: `scripts/pipeline_premier_league.py:44` fija `LEAGUE_NAME = "Premier League"` para todo lo importado bajo esa categoría de Yupoo, sin validar el equipo real extraído del texto.
- **Filtro "Tipo" — mezcla confirmada en BD real.** Valores distintos existentes: tipos de camiseta en inglés y español (`Home`, `Away`, `Third`, `Goalkeeper`, `Visitante`, `Local`, `Tercera`, `Portero`, `Entrenamiento`, `Pre-partido`, `Edición Especial`/`Special Edition`, `Camiseta`) mezclados con **colores** (`Red`, `Yellow`, `White`, `Black`, `Blue`, `Purple`, `Green`, `Gold`, `Grey`, y variantes `Goalkeeper Red/Green/Blue/Yellow/White`). Confirma hallazgo #4 y #5 del brief.
- **Causa raíz de duplicados** (4 scripts en `/scripts`: `pipeline_premier_league.py`, `pipeline_multi_liga.py`, `pipeline_liga_argentina.py`, `fix_import_pl.py`): al chocar el slug, generan sufijo `-2`/`-3` y **crean fila nueva** en vez de detectar y actualizar la existente. Único script con dedupe real: `pipeline_continue.py` (`mode="add"`, salta si el slug ya existe).
- **Riesgo adicional en esos mismos scripts**: hacen `DELETE FROM "Product" WHERE league=%s` sin manejo de la FK `OrderItem_productId_fkey` (`ON DELETE RESTRICT`) — si se re-ejecutan tal cual sobre una liga con pedidos reales, pueden fallar a medias. No se deben re-ejecutar sin antes corregir esto.
- **"Manga Larga" como tier de precio: NO EXISTE en el esquema.** `schema.prisma` solo tiene `priceFan`/`pricePlayer`/`priceRetro` (todos `Int?`). "Long sleeve" es solo un modificador de texto que se elimina por regex en `prisma/import-products.ts` — no genera precio propio. **Esto contradice la adenda** (que da $185.000 como precio oficial de un 4º tier). Necesito tu decisión antes de la Fase 3 — ver preguntas al final.
- **Precios confirmados**: Fan $150.000, Retro $170.000, Player $180.000 en `lib/utils.ts` — coinciden con la adenda.
- **Bug real de precio catálogo vs. ficha (explica hallazgo #8)**: existen **tres implementaciones separadas** del cálculo de precio: `ProductCard.tsx` (inline, siempre usa Fan/Retro, **ignora la versión Jugador**), `ProductDetail.tsx` (`getPrice()`, correcto, cambia con el toggle Fan/Player), y `lib/utils.ts` (`getProductPrice()`, tercera implementación que **no se usa en ningún lado**). Se debe consolidar a una sola fuente de verdad.
- **WhatsApp**: número consistente `+57 300 844 3885` en todo el repo (sin discrepancias de número), pero **no centralizado** — hardcodeado directo, además del helper de `lib/utils.ts`, en `HeroSlider.tsx`, `Footer.tsx`, `Navbar.tsx` (x2), `WhatsAppButton.tsx`, `app/page.tsx`, `nosotros/page.tsx`, `faq/page.tsx`, `contacto/page.tsx` (x2) — 9+ archivos a tocar si cambia el número.
- **Envíos — contradicción real confirmada en código**, no solo en docs de negocio: `Footer.tsx`, `ProductDetail.tsx` y `faq/page.tsx` dicen envío nacional $25.000-$30.000 + internacional/Santa Marta gratis; pero `campeones-barca/page.tsx` y `super-clasico/page.tsx` (banners de promo) dicen "envío gratis a toda Colombia" (nacional gratis). No existe archivo de configuración central ni marcadores `TODO_OWNER`.
- **Personalización (dorsal/parches)**: tratada como gratis consistentemente en todo el código — coincide con la adenda.
- **Cuenta bancaria — hallazgo más grave de lo que decía el brief**: el footer NO expone número completo (solo alias Nequi/Daviplata/Nubank), **pero `checkout/page.tsx` sí expone el número completo de Bancolombia (`91622993231`) desde el primer paso de selección de método de pago, antes de confirmar el pedido** — no está detrás de un flujo seguro post-confirmación como pide el brief.
- `promo-rls.sql` (sin aplicar) es consistente con el código real (`lib/promo-barca.ts` lectura pública, ruta admin protegida).

## 3. Diseño / sistema visual
- Se cargan **4 familias tipográficas** vía `next/font/google` (`Oswald`, `Inter`, `Playfair Display`, `JetBrains Mono`), no 2. En la práctica **Oswald domina** la mayoría de componentes; Playfair aparece solo en logo y algunos H1. El brief pide máximo 2 familias — hay que decidir en Fase 2 si se consolida a Playfair+Inter (como asume la adenda) o se justifican explícitamente las 4.
- Loader de imágenes (`supabase-image-loader.js` + `next.config.ts`) cumple la restricción: nunca usa `/render/image/`, `remotePatterns` restringido al bucket público de Supabase. Confirmado sin excepciones en el código actual.
- **Riesgo latente**: el loader es global — si algún componente nuevo usa `next/image` con una ruta local (`/public/...`), el loader actual generaría una URL rota. No ocurre hoy, pero es una trampa a evitar en Fase 4.

## 4. Navegación
- No hay buscador global persistente — vive detrás de un ícono/dropdown en `Navbar.tsx`, oculto por defecto.
- Búsqueda duplicada e inconsistente: input server-side GET en `catalogo/page.tsx` + input client-side con debounce en `CatalogoFilters.tsx`, cada uno con su propia lógica.
- Breadcrumbs solo existen en la ficha de producto (`ProductDetail.tsx`), generados dinámicamente — por eso heredan errores de clasificación (ej. caso Barcelona/Premier League). No existen en catálogo, carrito, checkout, nosotros ni FAQ. No hay `BreadcrumbList` estructurado en ningún lado.

## 5. Producto (ficha)
- Muestra: breadcrumb, tipo+temporada, precio con toggle Fan/Player, selector de talla + guía de tallas, dorsal nombre/número (gratis), botones carrito/WhatsApp, envío/pago en una línea, stats de confianza (hardcodeados, ver §9), descripción opcional.
- Falta: materiales, cuidados, selector real de parches, política de cambios detallada, FAQ embebido, "vistos recientemente", selector de cantidad (fijo en 1).
- Miniaturas de galería sin prop `sizes` (descargas más pesadas de lo necesario) y `alt=""`.

## 6. Carrito y pedido por WhatsApp
- El armado del mensaje está fragmentado en 3 lugares distintos con campos diferentes: consulta rápida desde ficha (`ProductDetail.tsx`, sin precio/URL), pedido completo (`carrito/page.tsx`, sin URL/ciudad/observaciones), y checkout (`checkout/page.tsx`, agrega N° de pedido y método de pago, tampoco URL/ciudad/notas).
- Ninguno de los tres incluye la URL del producto — el brief lo pide explícitamente.

## 7. Rendimiento
- Paginación server-side real y confirmada: `catalogo/page.tsx` (`skip`/`take: 24`), productos relacionados (`take: 4`), fallback home (`take: 8`). No se encontró ningún componente cliente que traiga el catálogo completo — el único `findMany()` sin límite es un cron de backup server-only, no expuesto a usuarios.
- `next/image` usado correctamente en general (`fill` + `sizes`, `priority` solo en imagen LCP de hero y ficha).
- El warning de build ("Custom Cache-Control headers... /_next/image") viene de un bloque `headers()` en `next.config.ts` que es **código vestigial**: con el loader custom, las imágenes ya no pasan por la ruta `/_next/image`, así que ese override no cumple ninguna función real hoy. Candidato a eliminar.
- `framer-motion` se usa de forma extensa, incluyendo animaciones instanciadas por cada `ProductCard` (decenas por página de catálogo) — candidato a reemplazar por CSS transitions/IntersectionObserver nativo para aliviar INP.
- `googleapis` (SDK pesado) está en dependencias de producción — confirmar en Fase 5 que solo se usa server-side.
- No hay lodash/moment/axios/librerías de carrusel — el resto de dependencias es razonablemente austero.

## 8. SEO técnico — brecha más grave encontrada
- **No existe ningún `og:image`** en el proyecto, ni global ni por producto. Tampoco `twitter:card`, ni `canonical`. Un link de producto compartido por WhatsApp/Instagram hoy no muestra imagen ni título personalizado — **contradice directamente el criterio de aceptación #27 de la adenda**, que la marca como prioridad alta (es el canal de ventas real del negocio).
- No existen `sitemap.ts`/`robots.ts` ni versiones estáticas — no hay sitemap ni robots.txt.
- Cero datos estructurados JSON-LD en todo el proyecto (`Product`, `Offer`, `BreadcrumbList`, `Organization`, `WebSite`/`SearchAction` — ninguno existe).
- `generateMetadata` en la ficha de producto solo devuelve `title` y `description`, nada más.

## 9. Confianza y contenido
- El contador "+0" es efectivamente una animación cliente (`CounterBanner.tsx`, `requestAnimationFrame`, arranca en 0 y sube al total real recibido por prop desde `prisma.product.count()`), confirmando la lectura de la adenda. Pero el HTML SSR inicial sí muestra literalmente "+0" — afecta lo que ven crawlers/previews antes de la hidratación, tal como anticipa la adenda como refinamiento opcional de bajo esfuerzo.
- **`SocialProofNotification.tsx` es un array 100% hardcodeado** de mensajes falsos ("Alguien de Bogotá compró...", "12 personas viendo ahora", etc.), rotado por timer, sin ninguna conexión a `Order`/`OrderItem` reales. Montado globalmente en `app/layout.tsx`. Esto es exactamente lo que el brief prohíbe ("no inventes ventas recientes") — se debe eliminar o reemplazar por algo verificable.
- Cifras no verificables hardcodeadas y repetidas en múltiples lugares: "500+ clientes", "+10 países", "100%" de satisfacción, nombre genérico "Cliente verificado" — en `app/page.tsx` y de nuevo en `ProductDetail.tsx`.
- Meta description hardcodeada ("Más de 2800 camisetas disponibles", `app/layout.tsx`) desalineada del conteo real (3,344).
- Mezcla de idioma: el campo `type` guarda literalmente palabras en inglés (`Home`/`Away`) mostradas sin traducir en las tarjetas y la ficha; `slugToLeague` mezcla "New Season"/"Other Clubs" en inglés con nombres en español.
- No se encontraron textos de prueba tipo "lorem ipsum"/"TODO" visibles al usuario.

## 10. Accesibilidad
- **Cero usos de `aria-expanded`, `aria-live` o `role` en todo el proyecto** (grep global, cero resultados).
- FAQ (`app/faq/page.tsx`) es cliente puro: las respuestas **no están en el HTML inicial**, solo aparecen tras interacción — pueden quedar ocultas a crawlers y lectores de pantalla mal configurados. Sin `aria-expanded` en el toggle.
- Flechas de galería icon-only sin `aria-label`; toggle de guía de tallas sin `aria-expanded`.
- `LogoIntro.tsx`: overlay de pantalla completa cerrable solo con click sobre un `div` (no botón), sin `tabIndex`/`onKeyDown`/`role`, inaccesible por teclado (solo se cierra solo tras 3.5s).
- Menú móvil y drawer de filtros bloquean el scroll del body pero no gestionan foco (sin trap de Tab, sin cierre por `Escape`).
- Validación de talla obligatoria usa `alert()` nativo del navegador en vez de un mensaje de error accesible inline.
- **Cero soporte de `prefers-reduced-motion`** en todo el proyecto — afecta el crossfade infinito del hero (cada 5s), el bounce de scroll infinito, la intro de video a pantalla completa, y las animaciones de `framer-motion` en catálogo/ficha.

## 11. Riesgos consolidados (por orden de impacto)
1. **SEO/compartir**: cero `og:image`/structured data — máxima prioridad según adenda.
2. **Confianza**: notificaciones de compra falsas montadas globalmente — violación directa del brief.
3. **Seguridad de datos en checkout**: cuenta bancaria completa expuesta antes de confirmar el pedido.
4. **Integridad de datos**: causa raíz de duplicados activa en 4 scripts de `/scripts`; requiere corrección antes de cualquier reimportación futura.
5. **Bug de precio**: 3 implementaciones de cálculo de precio compitiendo — causa directa de inconsistencias catálogo/ficha.
6. **Accesibilidad**: ausencia total de semántica ARIA y `prefers-reduced-motion` — brecha grande frente al objetivo WCAG 2.2 AA.
7. **Mantenibilidad**: WhatsApp y envíos no centralizados — 9+ archivos a tocar por cada cambio de número/cifra.
8. **Infraestructura**: posible drift entre migraciones versionadas (sintaxis SQLite) y el esquema real en Supabase.
9. **Rendimiento**: código vestigial en `next.config.ts` (headers de `/_next/image`), uso amplio de `framer-motion` en listas grandes.
10. **Escala de búsqueda**: sin índices para `team`/`league`/`name` de cara a `ILIKE`/`pg_trgm` con 3,344 filas.

## 12. Preguntas que necesitan tu decisión antes de avanzar a Fase 3
Ver mensaje de seguimiento fuera de este documento — están listadas ahí para que las respondas directamente.
