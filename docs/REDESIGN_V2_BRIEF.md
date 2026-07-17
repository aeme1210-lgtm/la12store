# SEGUNDA INTERVENCIÓN PROFUNDA — LA 12 STORE v2 — MODO AUTÓNOMO

> Guardado tal cual se recibió. Ver `docs/REDESIGN_V2_PROGRESS.md` para el checklist vivo,
> `docs/redesign-v2-audit.md` para la auditoría, y `docs/DECISIONS_V2.md` para cada decisión
> tomada de forma autónoma con su justificación.

Actúa como director creativo digital, diseñador UX/UI senior,
especialista en motion, arquitecto frontend y desarrollador senior
de la tecnología real de este repo. La primera reconstrucción no
alcanzó el nivel: audita https://la12store.vercel.app, reproduce
los problemas, encuentra su causa en el código y corrígelos
integralmente. Conserva lo que sí funciona.

## MODO AUTÓNOMO
- NO preguntar ni esperar aprobaciones intermedias. Ante
  ambigüedad: decidir con criterio profesional y registrar cada
  decisión en docs/DECISIONS_V2.md (decisión + justificación de
  una línea).
- Únicas paradas válidas: (a) riesgo real de pérdida irreversible
  de datos sin backup posible, (b) fin de sesión → commit + push
  de la rama + checklist al día para que otra sesión retome.
- Los permisos humanos se reemplazan por barandillas automáticas
  definidas abajo (backups, solo-inserción, límites).

## REGLAS DE ORO
1. Rama nueva `redesign-v2`. PROHIBIDO push o merge a master. Al
   final: push de la rama + URL de preview de Vercel. El merge lo
   hace el dueño tras revisar.
2. Cero gasto: nada de pasarelas, plantillas, APIs, servicios
   pagos ni pruebas gratuitas que luego cobren.
3. PROHIBIDO servir imágenes vía `/storage/v1/render/image/`
   (la cuota de transformaciones ya se reventó una vez). Mantener el
   loader a `/object/public/`. Dimensiones explícitas siempre.
4. Base de datos: NUNCA migraciones destructivas ni UPDATE/DELETE
   masivos. Solo cambios aditivos e INSERTs. Antes de cualquier
   escritura masiva: exportar backup JSON del estado previo
   relevante a `/backups` (gitignored).
5. Documentación viva: guardar este brief como
   `docs/REDESIGN_V2_BRIEF.md`; crear `docs/REDESIGN_V2_PROGRESS.md`
   (checklist por fase, actualizarlo siempre) y
   `docs/redesign-v2-audit.md` (problema → ruta → componente →
   causa → solución → resultado). `npm run build` + commit al
   cerrar cada fase.
6. CLAUDE.md sigue vigente (pooler 6543 pgbouncer, DIRECT_URL
   5432, singleton Prisma, build antes de push).

## DATOS DEL NEGOCIO (fuente de verdad; corregir cualquier otro valor
que se encuentre, especialmente el número 573167548107 que es un
ERROR si aparece)
- WhatsApp ventas: 3008443885 → links wa.me/573008443885.
  Centralizado en configuración.
- Pagos (SOLO dentro del checkout, jamás en el footer):
  Nequi 3008443885 · DaviPlata 3008443885 · Bancolombia Ahorros
  91622993231 titular Silvana Ossa · Bre-B llave @AME429.
- Precios: Fan $150.000 / Retro $170.000 / Player $180.000 /
  Manga Larga $185.000. Dorsal y parches GRATIS retail: es el
  diferenciador, destacarlo en hero, ficha y carrito.
- Envío (DECIDIDO, en config editable src/config/shipping.ts o
  equivalente): "Santa Marta: gratis · Envío nacional: se
  confirma según destino por WhatsApp antes del pago". El
  checkout muestra subtotal + línea de envío honesta; no bloquea
  ni inventa tarifas.

## ADN DE DISEÑO (decisiones tomadas tras estudiar Classic Football
Shirts, Cult Kits, Kitbag, Football Shirt Collective, Nike, KITH,
Aesop, Gymshark, Stance y Staud — adoptar PRINCIPIOS, no copiar
nada)
- Filosofía: contención editorial con alma futbolera. La portada
  es la primera plana de una revista de cultura futbolera que
  cambia (drops, colecciones), no un índice de catálogo. El
  producto y la fotografía real son los protagonistas.
- Curaduría > listado: navegación por colecciones con imagen
  (Selecciones, Clubes, Retro, Jugador, 26/27), como los grandes
  archivos navegan por club/país/década. Nav principal máximo 6
  ítems; el resto al footer.
- Ritual de drop: la sección ESTRENOS rota a diario y lo dice
  ("El drop de hoy · se renueva cada 24h") — razón para volver.
- Confianza real arriba del pliegue: personalización gratis,
  envíos, WhatsApp, Santa Marta. Cifras inventadas: cero.
- Paleta (variables globales): Negro túnel #0B0B0A (profundidad,
  no cubrirlo todo) · Carbón #181816 · Marfil tribuna #F1EBDD
  (secciones editoriales luminosas que rompan el negro) · Arena
  #D6C8AE · Bronce envejecido #A47C42 (sustituye TODO dorado
  brillante; ≤10% de la interfaz) · Vino #6B202B y Verde césped
  #20372A solo en bloques editoriales puntuales · Naranja marcador
  #D95632 solo CTAs clave · verde brillante solo confirmaciones/
  stock. Colores de Nequi/Bancolombia/DaviPlata solo dentro del
  selector de pago.
- Tipografía (DECIDIDO): display = Archivo (pesos Black/Expanded
  para titulares editoriales, energía deportiva contemporánea);
  interfaz y cuerpo = Inter. Ambas vía next/font/google, máximo
  estas 2 familias, fallbacks de métrica similar. Reemplazar
  Playfair de forma consistente en todo el sitio.
- Motion system centralizado (tokens): micro 140-180ms · drawer/
  modal 220-300ms · paso de checkout 220-320ms · revelado
  editorial 350-550ms · transición compartida ≤400ms. Curvas:
  entrada cubic-bezier(0.22,1,0.36,1), salida
  cubic-bezier(0.4,0,1,1). prefers-reduced-motion respetado.

## FASE 0 — AUDITORÍA REAL (documentada en redesign-v2-audit.md)
package.json y versiones; librería de animación en uso;
componentes de portada; layouts/loading; carrito; ficha; nav
móvil; checkout existente; config de WhatsApp; dónde viven las
cuentas; cálculo de total y envío; comportamiento en la URL
publicada; consola e hidratación; CLS; animaciones de viewport y
si se repiten; dimensiones de imágenes.

## FASE 1 — ESTABILIDAD (prioridad #1, causa del "tambaleo")
- Imágenes: width/height o aspect-ratio SIEMPRE, espacio
  reservado, placeholder del mismo tamaño, sizes correcto, sin
  cambios tras hidratar, sin swaps móvil/desktop que alteren
  altura.
- Fuentes: next/font, preload solo esenciales, sin ocultar la
  página entera.
- ELIMINAR: springs en secciones completas; escalados 0.9/0.95;
  translate 40-100px; animar height:auto; posición+escala+
  opacidad simultáneas; parallax móvil; animación por tarjeta de
  producto; reveals que se repiten al scroll; animaciones sobre
  margin/padding/top/left/width/height; staggers lentos;
  transiciones que retrasen poder pulsar.
- Reveals editoriales: solo opacidad + translate ≤16px, una vez.
- Skeletons EXACTOS al tamaño final; nada que empuje secciones.

## FASE 2 — PORTADA CON RITMO EDITORIAL (bloques diferenciados, no
la misma grilla diez veces)
1 barra informativa compacta y verdadera · 2 header sticky
estable (logo, nav ≤6, buscador, carrito) · 3 hero editorial
(una foto potente, altura estable, titular breve, ≤2 CTA, sin
carrusel automático) · 4 ESTRENOS 26/27 (Fase 4) · 5 mundos en
composición asimétrica (imagen dominante + secundarias) ·
6 colección destacada con contexto y fondo distinto (aquí pueden
entrar marfil/vino/verde) · 7 destacados en grilla limpia sin
animar cada producto · 8 "Encuentra tu camiseta" guiado 100%
local (selección/club → moderna/retro → fan/jugador → talla →
presupuesto → resultados reales) · 9 historia de Andrés y
Silvana con foto real full-bleed · 10 cómo comprar en 5 pasos ·
11 footer completo, ligero y SIN cuentas bancarias.

## FASE 3 — TRANSICIONES FUNCIONALES
Producto→ficha con continuidad de imagen (View Transitions solo
si es estable en la versión real del framework; fallback sin
animación; ≤400ms) · buscador como overlay editorial estable
(foco al campo, cierre por botón/Escape/gesto, no mueve el
header) · carrito drawer (fondo oscurecido, scroll bloqueado
bien, al cambiar cantidad se anima solo el ítem; al agregar:
confirmación breve + contador estable, sin abrir el carrito a la
fuerza) · checkout con crossfade/slide corto entre pasos e
indicador de progreso · menú móvil drawer fluido, táctiles ≥44px.

## FASE 4 — TEMPORADA 26/27 + ESTRENOS (AUTÓNOMO con barandillas)
A) Importación: adaptar los scripts de /scripts (conservando el
   dedupe por nombre normalizado + equipo + temporada + tipo) a
   esta fuente Yupoo y ejecutar la importación completa SIN pedir
   aprobación:
   https://maiyuyan.x.yupoo.com/search/album?uid=1&sort=&q=26%2F27&page=1
   https://maiyuyan.x.yupoo.com/search/album?uid=1&sort=&q=26%2F27&page=2
   (verificar si hay más páginas). Barandillas obligatorias:
   backup previo (conteo + lista de slugs existentes) a /backups;
   SOLO INSERTs, jamás update/delete de productos existentes;
   duplicado detectado → skip y log; álbum imparseable → skip y
   log; si los errores superan el 30% de los álbumes → detener la
   importación y documentar. Temporada 2026/27, colección
   "Temporada 26/27" navegable, precio por tipo detectado (Fan
   por defecto), imágenes al bucket products como el pipeline
   actual. Reporte final en docs/IMPORT_2627_REPORT.md: cuántos
   creados, cuántos omitidos y por qué, ejemplos.
B) ESTRENOS: sección en home + entrada en nav. 8-12 camisetas
   26/27 rotando cada 24h SIN cron ni servicios pagos: selección
   determinista sembrada por fecha (YYYYMMDD) con revalidate
   diario (ISR) o cálculo server-side. FC Barcelona y Real Madrid
   26/27 SIEMPRE presentes; el resto rota. Layout estable y
   estado elegante si aún no hay productos 26/27.

## FASE 5 — CHECKOUT INTERNO /checkout (pasarela honesta)
- Pasos: 1 Datos (nombre, WhatsApp, ciudad, departamento,
  dirección, barrio/referencia, observaciones; correo opcional;
  validación real; el teclado móvil no tapa campos) → 2 Entrega
  (productos, tallas, personalizaciones, cantidades, subtotal,
  línea de envío según config, total) → 3 Revisión (todo
  editable; código de pedido L12-YYYYMMDD-XXXX aleatorio sin
  colisiones) → 4 Pago → 5 Comprobante.
- Paso 4: tarjetas Nequi / Bancolombia / DaviPlata / Bre-B con
  los datos reales, titular, total exacto y código. Botones
  Copiar número/llave/total/resumen con confirmación visual. QR:
  NO generar QRs financieros; dejar slot para imagen oficial con
  TODO_OWNER. "Abrir app": solo deep links de documentación
  OFICIAL; si no existen (nada de nequi:// inventado), el botón
  abre la app vía enlace oficial o tienda de apps SIN prometer
  datos precargados, y el flujo principal es copiar → "Abre tu
  app y pega estos datos".
- Paso 5: comprobante JPG/JPEG/PNG/WEBP/PDF con vista previa,
  nombre, tamaño, eliminar/reemplazar, validación de tipo y
  tamaño. NO en localStorage, NO a servicios externos, NO afirmar
  almacenamiento inexistente.
- WhatsApp: ruta principal Web Share API (navigator.share +
  canShare con el archivo específico) compartiendo archivo +
  resumen ("Hola, La 12 Store. Adjunto el comprobante del pedido
  L12-XXXX..." con cliente, WhatsApp, ciudad, método, total y
  productos). Tras compartir: "Tu comprobante fue preparado para
  compartir. Tu pedido queda pendiente de verificación." NUNCA
  "enviado" ni "pagado". Fallback sin soporte de archivos: copiar
  resumen + abrir wa.me/573008443885 con texto precargado +
  "Adjunta el comprobante desde tu galería antes de enviar" +
  miniatura recordatoria. El carrito NO se borra hasta terminar.
- Estados honestos: DRAFT, READY_FOR_PAYMENT,
  PAYMENT_INSTRUCTIONS_VIEWED, RECEIPT_SELECTED,
  RECEIPT_SHARE_STARTED, PENDING_VERIFICATION, CONFIRMED_MANUALLY.
  Prohibido PAID/aprobado automático. UI: "Pago pendiente",
  "Pendiente de verificación", "Confirmaremos tu pedido por
  WhatsApp".
- Persistencia local: carrito, datos básicos, método, código y
  paso (NUNCA el comprobante). Al volver: restaurar paso y avisar
  que el archivo se selecciona de nuevo.
- Config central de pagos (id, nombre, titular, tipo, número,
  llave, qr opcional, instrucciones, color, activo, deepLink
  oficial opcional, a11y). Sin duplicar datos financieros en
  componentes. Sin secretos en el frontend.
- docs/ADMIN_GUIDE.md: protocolo anti-comprobantes-falsos
  (verificar el movimiento EN la app financiera, comparar
  total/fecha/titular, no despachar por una captura, marcar
  CONFIRMED_MANUALLY a mano) + cómo cambiar cuentas, QR, WhatsApp
  y envío.

## FASE 6 — RENDIMIENTO Y CIERRE
CLS < 0.1 · LCP < 2.5s viable · INP < 200ms · sin errores de
consola · sin saltos visibles · sin bloqueo de scroll · build +
typecheck + lint limpios o con limitaciones preexistentes
documentadas. QA visual multi-viewport y Lighthouse: NO se pueden
medir desde la terminal — entregar la lista exacta de qué
verificar en la preview, sin afirmar métricas no medidas.

## ENTREGA FINAL
Causas reales del tambaleo · animaciones eliminadas · transiciones
nuevas · sistema cromático y tipográfico aplicados · estructura de
portada · arquitectura del checkout · métodos de pago configurados
· deep links oficiales hallados o su ausencia documentada ·
comprobante/Web Share/fallback · resultado de la importación 26/27
· archivos creados y modificados · dependencias añadidas y por qué
· resultados de build/typecheck/lint · decisiones tomadas
(DECISIONS_V2.md) · push de redesign-v2 + URL de preview.

## ACEPTACIÓN (dura)
Cero layout shift al cargar · portada con bloques diferenciados ·
bronce sobrio ≤10% en lugar de dorado · Archivo+Inter consistentes
· buscador/carrito/checkout con transiciones funcionales ·
/checkout completo con los 4 métodos reales copiables · cuentas
fuera del footer · sin QR ni deep links inventados · pedidos
siempre "pendiente de verificación" · carrito persistente ·
ESTRENOS rotando a diario con Barça y Real fijos · importación
26/27 ejecutada con backup y reporte · ninguna imagen vía
/render/image/ · push SOLO a redesign-v2 · master intacto.
