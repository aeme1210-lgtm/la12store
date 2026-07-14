# ADENDA CRÍTICA AL BRIEF DE REDISEÑO — LA 12 STORE
**Este documento complementa REDESIGN_BRIEF.md con el estado REAL del proyecto.
Si algo aquí contradice el brief, ESTA ADENDA TIENE PRECEDENCIA.**

## 1. Correcciones a los hallazgos del brief
- **Contador "+0"**: NO es un bug. Es una animación count-up que sube de 0 al total real. Ignorarlo como error. Refinamiento opcional de bajo esfuerzo: renderizar el total real en el HTML del servidor y animar desde ahí (mejora lo que ven crawlers y previews). No prioritario.
- **Catálogo real**: 3,344 productos (no 2,873). Se componen de 2,873 base + 471 legítimos nuevos (Mundial 2026: 217, Premier League: 128, Serie A: 126). Los duplicados reales son 623 grupos de nombre repetido = 794 filas sobrantes SOLO dentro de la base histórica, causados por los pipelines de /scripts que escanean carpetas solapadas del bucket y crean un producto nuevo con slug auto-sufijado (-2, -3) en vez de detectar el existente.
- **Personalización**: dorsal y parches **SÍ SON GRATIS** en pedidos retail. Es EL diferenciador comercial de la tienda: conservarlo y destacarlo en hero, ficha y carrito. (El canal mayorista cobra $15.000 por dorsal, pero eso NO aparece en la web pública.)
- **WhatsApp — fuente de verdad**: +57 300 844 3885. Centralizar en UN archivo de configuración; verificar y corregir cualquier otro número hardcodeado.
- **Envíos**: existen versiones contradictorias entre documentos del negocio (gratis Santa Marta / nacional $25-30k / internacional gratis vs. otras). NO publicar cifras sin confirmar: implementar todas las cifras de envío como constantes en un solo archivo config con marcador `TODO_OWNER`, y listar al final qué debe confirmar el dueño.
- **Tipografía**: Playfair Display + Inter ya están integradas vía next/font y cumplen el criterio del brief (display + sans legible). Partir de ellas; reemplazar solo con justificación fuerte y siempre con fuentes gratuitas de next/font/google.
- **Precios oficiales**: Fan $150.000, Retro $170.000, Player $180.000, Manga Larga $185.000 COP. Cualquier inconsistencia catálogo/ficha se corrige contra estos valores y contra la BD.

## 2. Seguridad operacional (INNEGOCIABLE)
- Trabajar SIEMPRE en la rama `redesign` (git checkout -b redesign). **PROHIBIDO hacer push a master** en esta tarea. Producción solo se toca después de que el dueño revise la preview de Vercel y apruebe el merge.
- **PROHIBIDO ejecutar migraciones destructivas de Prisma contra la base de producción.** Cambios de esquema: solo aditivos (columnas nullable, índices), mostrando la migración ANTES de aplicarla y esperando aprobación explícita. Preferir una capa de normalización derivada (build-time o query-time) antes que alterar datos existentes.
- La limpieza de los **794 duplicados** es una tarea YA planificada con reglas aprobadas: backup JSON previo de todo lo que se borre + JAMÁS eliminar filas referenciadas en OrderItem (conservar la referenciada o la más antigua) + confirmación del dueño antes de ejecutar. Si la Fase 3 del brief requiere esa limpieza: ejecutar ESE plan, no improvisar otro. Alternativa válida mientras tanto: deduplicar a nivel de consulta/visualización.
- **Atacar la raíz**: corregir la lógica de los scripts de importación en /scripts para que detecten producto existente (nombre normalizado + equipo + temporada + tipo) antes de crear uno nuevo, y documentar en ADMIN_GUIDE.md cómo importar de Yupoo sin generar duplicados.

## 3. Restricción económica REAL de imágenes (el brief no la conoce)
- Este proyecto YA reventó el límite de Supabase Image Transformations (5,539 de 100) por servir imágenes vía `/storage/v1/render/image/`. Se corrigió con un loader que sirve `/storage/v1/object/public/` directo.
- **PROHIBIDO reintroducir `/render/image/` o cualquier transformación de imágenes de Supabase.**
- Cuidado con la optimización de imágenes de Vercel (plan Hobby, cuota limitada): mantener/extender el custom loader existente. Dimensiones explícitas width/height, lazy loading nativo, `priority` solo en la imagen LCP, proporciones vía CSS/aspect-ratio. `srcset` solo si NO dispara servicios de transformación.
- Miniaturas: aceptable usar la misma URL pública dimensionada por CSS. No generar derivados que cuesten dinero.

## 4. Base de datos y rendimiento de consultas
- Postgres (Supabase) vía Prisma con pooler puerto 6543 y connection_limit=1: consultas eficientes obligatorias — select de campos mínimos, paginación skip/take, NUNCA traer el catálogo completo al cliente.
- Búsqueda: preferir server-side con ILIKE + `unaccent` o `pg_trgm` (extensiones disponibles en Supabase; habilitarlas requiere SQL — mostrarlo antes de ejecutarlo). Índice ligero en cliente solo para sugerencias (campos mínimos de nombre/equipo).
- Índices de BD donde el rendimiento lo pida: migración aditiva, mostrada antes.

## 5. Prioridad elevada: compartir por WhatsApp/Instagram
Este es EL canal de ventas del negocio. Tratar como criterio de aceptación, no como detalle SEO:
- `og:image` global de marca (elegir una foto lifestyle existente del bucket brand).
- `og:image` por producto usando su foto real + título y descripción por producto.
- `twitter:card` = summary_large_image.
- Verificable: pegar un link de producto en WhatsApp debe mostrar foto + nombre correctos.

## 6. Reparto de QA realista
- Claude Code: implementa, razona el responsive por código, corre build/typecheck/lint, revisa consola en dev. NO afirma métricas que no midió.
- Verificación visual multi-viewport y Lighthouse/PageSpeed: las hace el dueño sobre la URL de preview (con la extensión de Chrome como apoyo). Entregar al final la lista exacta de qué medir y dónde.

## 7. Mecánica de sesión (el brief es más grande que una sesión)
- Crear `docs/REDESIGN_PROGRESS.md` con el plan de fases como checklist vivo; actualizarlo al cerrar cada fase o subfase.
- `npm run build` + commit al cerrar cada fase (mensajes: "redesign fase X: ...").
- Si la sesión se acerca a su límite: commit + push de la RAMA + estado del checklist. Una sesión nueva retoma leyendo BRIEF + ADENDA + PROGRESS, sin repetir trabajo.
- Las reglas técnicas del proyecto ya viven en CLAUDE.md (pooler/puertos, singleton de Prisma, build antes de push): respetarlas siempre.

## 8. Criterios de aceptación ADICIONALES a los 24 del brief
25. Ninguna imagen se sirve vía /render/image/ ni servicio de transformación con costo.
26. Push únicamente a la rama redesign; master queda intacto hasta aprobación del dueño.
27. og:image funcional: un link de producto pegado en WhatsApp muestra foto y título correctos (verificable en la preview).
28. Los scripts de importación ya no crean duplicados (dedupe implementado y documentado en ADMIN_GUIDE.md).
29. docs/REDESIGN_PROGRESS.md refleja fielmente el estado real del trabajo al cierre de la sesión.
