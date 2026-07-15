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

## Fase 3: Transiciones funcionales
- [ ] Producto → ficha con continuidad de imagen
- [ ] Buscador overlay estable
- [ ] Carrito drawer
- [ ] Checkout con transición entre pasos + progreso
- [ ] Menú móvil drawer fluido

## Fase 4: Temporada 26/27 + Estrenos
- [ ] Backup previo (conteo + slugs) a /backups
- [ ] Scraping Yupoo 26/27 (páginas 1-2, verificar si hay más)
- [ ] Importación solo-INSERT con dedupe
- [ ] docs/IMPORT_2627_REPORT.md
- [ ] Colección "Temporada 26/27" navegable
- [ ] Sección/página ESTRENOS con rotación diaria determinista
- [ ] Barça y Real Madrid 26/27 siempre presentes

## Fase 5: Checkout interno
- [ ] Config central de pagos
- [ ] Paso 1: Datos
- [ ] Paso 2: Entrega
- [ ] Paso 3: Revisión (código L12-YYYYMMDD-XXXX)
- [ ] Paso 4: Pago (4 métodos, copiar, sin QR/deep link inventado)
- [ ] Paso 5: Comprobante (archivo local, Web Share API + fallback)
- [ ] Estados honestos (nunca "pagado" automático)
- [ ] Persistencia local (sin comprobante)
- [ ] ADMIN_GUIDE.md: protocolo anti-comprobantes-falsos

## Fase 6: Rendimiento y cierre
- [ ] Build/typecheck/lint
- [ ] Revisión de consola
- [ ] Lista de verificación manual para el dueño
- [ ] Entrega final (14 puntos)
- [ ] Push de `redesign-v2` + URL de preview

---

## Notas de sesión
