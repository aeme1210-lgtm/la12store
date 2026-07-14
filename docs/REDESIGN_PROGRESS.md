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
- [ ] Deduplicación de los 794 duplicados — script listo (`scripts/dedupe-products.ts`, dry-run OK, backup generado en `docs/dedupe-backup-*.json`), **pendiente aprobación explícita del dueño para ejecutar `--execute`**
- [x] Corrección de causa raíz en /scripts (`scripts/import_common.py`, upsert seguro, ya no borra la liga completa, captura manga larga) — los 5 pipelines migrados
- [x] Fix seguridad: cuenta bancaria completa ya no se muestra en el paso inicial de checkout, solo tras crear el pedido
- [x] Documentación en `ADMIN_GUIDE.md`
- [ ] Habilitar `pg_trgm`/`unaccent` en Supabase — SQL listo, **pendiente aprobación explícita del dueño para ejecutar**

## Fase 4: Implementación visual
- [ ] Header
- [ ] Portada (8 bloques narrativos)
- [ ] Catálogo (tarjetas, filtros, orden, paginación)
- [ ] Ficha de producto
- [ ] Carrito
- [ ] Buscador
- [ ] Nosotros
- [ ] FAQ
- [ ] Footer
- [ ] Estados vacíos y de error

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
