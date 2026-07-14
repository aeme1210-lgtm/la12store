# FASE 2 — SISTEMA Y ESTRUCTURA — LA 12 STORE

> Decisiones de arquitectura para el rediseño. Basado en `REDESIGN_BRIEF.md` + `REDESIGN_ADENDA.md`
> + hallazgos de `REDESIGN_AUDIT.md`. Se ejecutan en Fase 3 (datos) y Fase 4 (visual).

## 1. Arquitectura de información

Rutas actuales se conservan (no hay razón para romper URLs indexadas). Ajustes:

- `/` — portada narrativa (8 bloques, ver Fase 4).
- `/catalogo` — listado con filtros vía querystring (`?liga=&equipo=&tipo=&manga=&version=&talla=&color=&precioMin=&precioMax=&orden=&pagina=`). Ya es SSR paginado — se mantiene el patrón, se corrige la taxonomía subyacente.
- `/catalogo/[slug]` — ficha de producto. Se agregan breadcrumb reales, secciones ampliadas, JSON-LD `Product`+`Offer`, `og:image` por producto.
- `/carrito`, `/checkout` — se mantienen, se corrige el flujo de mensaje WhatsApp y el momento en que se muestra la cuenta bancaria (después de confirmar, no antes).
- `/nosotros`, `/faq`, `/contacto` — se mantienen, contenido revisado en Fase 4.
- `/campeones-barca`, `/super-clasico` — páginas promo existentes; se corrige la cifra de envío contradictoria (ver §6) para que usen la misma config central.
- **Nuevas rutas de Fase 5**: `app/sitemap.ts`, `app/robots.ts` (no existen hoy).
- No se agregan rutas nuevas de navegación (colecciones "virtuales" como Selecciones/Clubes/Retro se resuelven como vistas filtradas de `/catalogo`, no como árboles de contenido nuevos — evita duplicar lógica de listado).

## 2. Taxonomía de datos

Estado real del modelo `Product` (post Fase 1, con `priceLongSleeve`/`isLongSleeve` ya aplicados vía `db push`):

```
id, name, slug, description, team, league, season, type,
priceFan, pricePlayer, priceRetro, priceLongSleeve, isLongSleeve,
images, sizes, hasPlayer, isRetro, isFeatured, isTrending, isNew,
isActive, stock, createdAt, updatedAt
```

**Decisión: no se reestructura el modelo completo que sugiere el brief (`tipoEquipo`, `pais`, `anioInicio`, `stockPorTalla`, etc.) en esta fase.** Motivo: son 3,344 filas ya cargadas; una migración de esa magnitud (nuevas columnas obligatorias, backfill, cambios de tipo) es alto riesgo y el brief pide corregir causas raíz antes que rehacer el modelo. En su lugar:

- **`type` se limpia, no se reestructura**: hoy mezcla tipo de camiseta (Home/Away/Third/Goalkeeper/Visitante/Local/Tercera/Portero/Entrenamiento/Pre-partido/Especial) con colores (Red/Yellow/White/Black/Blue/Purple/Green/Gold/Grey) — confirmado en BD real (Fase 1 §2). Fase 3 crea un **mapa de normalización determinista** (`lib/taxonomy.ts`) que traduce cada valor crudo de `type` a dos salidas separadas en tiempo de consulta/render: `tipoCamiseta` (Home→Local, Away→Visitante, Third→Tercera, Goalkeeper→Portero, etc., ya en español) y `colorPrincipal` (cuando el valor crudo era en realidad un color). No se reescribe la columna `type` en la BD todavía — la normalización vive en código (capa derivada), evitando tocar 3,344 filas a mano. Se documenta cada mapeo (ningún valor se transforma "en silencio": el reporte de Fase 3 lista qué se mapeó a qué).
- **Idioma**: mismo mecanismo — el diccionario de normalización traduce valores en inglés a español para mostrar en UI, sin tocar el dato crudo.
- **`isLongSleeve`**: ya aplicado (Fase 1). Fase 3 corrige el parser para que futuras importaciones lo capturen en vez de descartarlo.
- **Precio**: una sola función consolidada `getProductPrice()` en `lib/pricing.ts` (nueva, reemplaza la lógica duplicada en `ProductCard.tsx`/`ProductDetail.tsx`/`lib/utils.ts`), que resuelve Fan/Player/Retro/Manga Larga con la misma prioridad en los tres lugares donde se usa.

## 3. Sistema visual (tokens)

**Hallazgo de Fase 1 relevante**: el sistema actual (`app/globals.css`) es fondo negro fijo en todo el sitio + efectos `.gold-glow` (sombra dorada difusa en hover) — es precisamente el antipatrón que el brief pide evitar ("página saturada de dorado"). Se rediseña la paleta para uso *sobrio* del dorado, y se introduce blanco cálido para secciones claras (portada narrativa alterna fondos, no todo negro).

**Paleta** (valores exactos, agregados a `@theme inline` en `globals.css`):

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#0A0A0A` | Negro profundo — base, texto sobre claro |
| `--color-cream` | `#F5F1E8` | Blanco cálido/marfil — fondos claros alternos |
| `--color-neutral` | `#6B6B6B` | Gris neutro — texto secundario |
| `--color-neutral-light` | `#A0A0A0` | Gris claro — texto terciario sobre oscuro |
| `--color-gold` | `#B8860B` | Dorado sobrio — acento, SOLO en detalles puntuales (no glow, no fondo) |
| `--color-success` | `#22C55E` | Verde — disponibilidad/confirmación únicamente |
| `--color-error` | `#C70101` | Rojo — errores/descuentos reales únicamente |
| `--color-whatsapp` | `#25D366` | Verde WhatsApp — reservado al CTA de WhatsApp |

Se elimina `.gold-glow` (sombras difusas doradas) y el uso de dorado como fondo/borde decorativo genérico; queda para: precio de producto destacado, un ícono puntual, línea divisoria fina. Nada de fondos dorados grandes.

**Tipografía — decisión: consolidar a 2 familias (cumple el límite explícito del brief).**

Hoy se cargan 4 (`Oswald`, `Inter`, `Playfair Display`, `JetBrains Mono` — confirmado en `app/layout.tsx`), con Oswald dominando en la práctica y Playfair casi sin uso, pese a que la adenda asumía que Playfair+Inter ya cumplían el criterio.

- **Display (titulares editoriales)**: `Playfair Display` — encaja con el posicionamiento "plataforma editorial de cultura futbolera" mucho mejor que Oswald (condensada, estilo cartel deportivo, más cercana a Nike/Adidas — justo lo que el brief pide evitar).
- **UI / cuerpo / precios**: `Inter` — ya es la fuente real del `<body>` (`app/layout.tsx:69`). Para precios se usa `font-variant-numeric: tabular-nums` sobre Inter en vez de una tercera familia monoespaciada.
- **Se eliminan** `Oswald` y `JetBrains Mono` de `next/font` en Fase 4 (impacto: menos peso de fuentes, cumple el límite de 2 familias). Esto toca decenas de componentes que hoy referencian `var(--font-oswald)` — se hace como parte del Fase 4 sistemáticamente, componente por componente, no en Fase 2.

**Composición**: espaciado base 8px (`--space-1: 8px` … escalado), radios consistentes (`--radius: 6px` tarjetas, `12px` contenedores grandes), sombras mínimas (una sola `--shadow-sm` sutil, sin glow), transiciones 160–240ms (`--transition: 200ms ease`), `prefers-reduced-motion: reduce` respetado globalmente (Fase 1 confirmó cero soporte actual — se agrega una regla global que neutraliza animaciones/transiciones cuando el usuario lo pide, más el fix puntual en `HeroSlider`/`LogoIntro`/`ScrollAnimations`).

## 4. Componentes reutilizables (a construir/refactorizar en Fase 4)

- `PriceTag` — usa `lib/pricing.ts`, único lugar que formatea y calcula precio (incluye Manga Larga).
- `Breadcrumbs` — genérico, reemplaza el breadcrumb hardcodeado de `ProductDetail.tsx`, se reutiliza en catálogo.
- `Accordion` — con `aria-expanded`/`aria-controls` reales, reemplaza el patrón manual de FAQ y guía de tallas.
- `FocusTrap`/`Dialog` — utilidad compartida para menú móvil, drawer de filtros y overlays (gestión de foco + cierre por `Escape`, hoy ausente en los tres).
- `SizeSelector` — unifica lógica de tallas (fan/player/manga larga tienen tallas distintas potencialmente).
- `ShareMeta` (server) — genera `og:image`/`twitter:card` por producto a partir de la imagen real.

## 5. Estrategia de búsqueda

Server-side, sin dependencias nuevas de pago (cumple restricción económica):

- Habilitar extensión `pg_trgm` (o `unaccent`) en Supabase — **requiere SQL, se muestra antes de ejecutar** (regla de la adenda §4), ver comando propuesto en Fase 3.
- Query server-side existente (`ILIKE`/`contains`) se extiende con índice GIN trigram sobre `name`/`team` para tolerar variaciones de escritura sin traer el catálogo completo al cliente.
- Sugerencias: endpoint liviano que devuelve solo `name`/`slug`/`team` (campos mínimos) para el dropdown, no el catálogo completo.
- El buscador pasa a tener protagonismo real en el header (Fase 4), no un ícono oculto.

## 6. Estrategia de filtros

- Filtros separados en la URL: `liga`, `equipo`, `tipoCamiseta` (ya no mezclado con color), `color` (extraído de `type` vía el mapa de normalización), `version` (Fan/Player/Retro/Manga Larga), `talla`, `precio`, `disponibilidad`, `personalizacion`.
- Contador de resultados por filtro, chips de "filtros aplicados" con botón individual + "Limpiar todo", estado 100% en la URL (ya parcialmente cierto hoy, se completa), panel lateral en escritorio / bottom sheet en móvil (usa el `Dialog`/`FocusTrap` compartido).

## 7. Flujo de pedido / WhatsApp

- `lib/whatsapp.ts` (nuevo, único punto de verdad): número `+57 300 844 3885` centralizado, reemplaza los 9+ archivos con el número hardcodeado (Fase 3).
- Un solo builder de mensaje reutilizado por consulta rápida, carrito y checkout, que siempre incluye: producto, **URL**, talla, versión, dorsal, parches, cantidad, precio unitario, subtotal, ciudad (si se pidió), observaciones — hoy fragmentado en 3 implementaciones distintas con campos distintos (Fase 1 §6).
- Cuenta bancaria completa se mueve del primer paso de `checkout/page.tsx` a la pantalla de confirmación posterior (Fase 3/4), corrigiendo el hallazgo de seguridad de la auditoría.
- `lib/shipping.ts` (nuevo): constantes de envío con marcadores `TODO_OWNER` donde la cifra es contradictoria hoy (nacional gratis vs. $25-30k — Fase 1 §2), consumido por Footer, ProductDetail, FAQ y las páginas promo (hoy cada una tiene su propia cifra hardcodeada).

## 8. Alcance explícitamente fuera de Fase 2-3 (para no perder foco)

- Reestructuración completa del modelo de datos sugerido por el brief (país, año inicio/fin, stock por talla) — se evalúa después de estabilizar lo anterior; no bloquea el criterio de aceptación del rediseño.
- Analítica: se deja el adaptador centralizado (`lib/analytics.ts`) con eventos definidos pero sin proveedor conectado (no hay ninguno hoy que reutilizar) — Fase 5.
