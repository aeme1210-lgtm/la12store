# REDESIGN V2 — PROGRESS

> Checklist vivo. Rama `redesign-v2`. Modo autónomo — ver `docs/DECISIONS_V2.md` para cada
> decisión tomada sin preguntar. Prohibido push/merge a `master`.

## Fase 0: Auditoría real (producción)
- [ ] package.json y versiones
- [ ] Librería de animación en uso
- [ ] Componentes de portada
- [ ] Layouts/loading
- [ ] Carrito
- [ ] Ficha de producto
- [ ] Nav móvil
- [ ] Checkout existente
- [ ] Config de WhatsApp
- [ ] Dónde viven las cuentas de pago
- [ ] Cálculo de total y envío
- [ ] Comportamiento en la URL publicada (curl real)
- [ ] Consola e hidratación
- [ ] CLS — causas
- [ ] Animaciones de viewport (¿se repiten?)
- [ ] Dimensiones de imágenes
- [ ] Documento `docs/redesign-v2-audit.md`

## Fase 1: Estabilidad
- [ ] Imágenes con dimensiones/aspect-ratio siempre
- [ ] Fuentes sin bloquear render
- [ ] Eliminar animaciones problemáticas (springs de sección, scale 0.9-0.95, translate 40-100px, height:auto, parallax móvil, animación por card, reveals repetidos, animar layout props)
- [ ] Reveals editoriales: opacidad + translate ≤16px, una vez
- [ ] Skeletons exactos al tamaño final
- [ ] Motion tokens centralizados

## Fase 2: Portada con ritmo editorial
- [ ] Barra informativa compacta
- [ ] Header sticky estable, nav ≤6
- [ ] Hero editorial (1 foto, sin carrusel automático)
- [ ] ESTRENOS 26/27 (depende de Fase 4)
- [ ] Mundos en composición asimétrica
- [ ] Colección destacada con fondo distinto
- [ ] Destacados en grilla limpia
- [ ] Encuentra tu camiseta (guiado)
- [ ] Historia Andrés y Silvana full-bleed
- [ ] Cómo comprar en 5 pasos
- [ ] Footer completo sin cuentas bancarias

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
