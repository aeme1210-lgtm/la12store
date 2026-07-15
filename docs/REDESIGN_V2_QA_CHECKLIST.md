# REDESIGN V2 — CHECKLIST DE QA MANUAL (PREVIEW)

> No se puede correr Lighthouse ni pruebas visuales multi-viewport reales
> desde este entorno (sin navegador con métricas de rendimiento real). Esta
> lista es lo que el dueño o quien revise la preview debe verificar a mano
> antes de aprobar el merge a `master`. Lo que sí se verificó desde este
> entorno (build, consola, flujo de checkout completo) está documentado en
> `docs/DECISIONS_V2.md` y `docs/REDESIGN_V2_PROGRESS.md`.

## 1. Métricas de rendimiento (Lighthouse — Chrome DevTools, pestaña "Lighthouse")

Correr en la URL de preview, modo "Mobile", con throttling por defecto:

- [ ] **CLS < 0.1** — especialmente en Home (hero, Estrenos, Mundos) y en
      ficha de producto (galería de imágenes).
- [ ] **LCP < 2.5s** — el elemento LCP normalmente es la imagen del hero o
      la primera imagen de producto; confirmar que carga rápido y no
      bloqueada por fuentes.
- [ ] **INP < 200ms** — probar interacciones reales: abrir carrito, abrir
      buscador, cambiar de talla en ficha de producto, avanzar un paso del
      checkout.
- [ ] Ningún warning de "layout shift" atribuido a imágenes sin
      `width`/`height` — especial atención a los 38 productos de la
      Temporada 26/27 (imágenes en `photo.yupoo.com`, ver limitación en
      `docs/IMPORT_2627_REPORT.md`).

## 2. Estabilidad visual (el "tambaleo" original)

- [ ] Cargar el Home varias veces seguidas — la portada no debe "saltar"
      ni recomponerse después de la primera pintura.
- [ ] Hacer scroll lento por todo el Home — los bloques (Estrenos, Mundos,
      Colección destacada, Tendencias, Encuentra tu camiseta, Nosotros,
      Cómo comprar) deben revelarse una sola vez, sin repetirse si se
      vuelve a subir y bajar con el scroll.
- [ ] Ficha de producto: cambiar de imagen en la galería no debe mover el
      resto del layout.
- [ ] Abrir/cerrar el carrito (drawer) y el buscador varias veces seguidas
      — no debe haber parpadeos ni saltos del header.

## 3. Recorrido de compra completo (flujo real, con datos de prueba)

Ya verificado una vez en este entorno (ver `docs/DECISIONS_V2.md`, incluye
el hallazgo y arreglo de un bug real de hidratación) — repetir en la
preview real para confirmar en producción:

- [ ] Agregar un producto al carrito desde la ficha de producto.
- [ ] Abrir el drawer del carrito desde el header — el contador debe
      mostrar la cantidad correcta sin parpadeo.
- [ ] Ir a `/checkout` y completar el Paso 1 (Datos) — validar que un
      campo vacío o un teléfono inválido muestra el error inline, no un
      `alert()`.
- [ ] Paso 2 (Entrega): confirmar que la línea de envío dice "gratis" solo
      si la ciudad es Santa Marta, y "se confirma por WhatsApp" para
      cualquier otra ciudad.
- [ ] Paso 3 (Revisión): confirmar que el código de pedido tiene el
      formato `L12-YYYYMMDD-XXXX` y que los botones "Editar" regresan al
      paso correcto sin perder los demás datos ya escritos.
- [ ] Paso 4 (Pago): probar los 4 métodos, confirmar que los botones de
      copiar (titular/número/total) muestran la confirmación visual (✓).
- [ ] Paso 5 (Comprobante): seleccionar una imagen de prueba, confirmar
      que se ve la vista previa, y probar el botón de compartir — en un
      celular real debería abrir el selector nativo de compartir de
      WhatsApp con el archivo y el texto ya armados; en un navegador de
      escritorio sin soporte debería copiar el resumen y abrir `wa.me`.
- [ ] Confirmar que el mensaje final dice **"pendiente de verificación"**
      y en ningún momento dice "pagado" ni "confirmado" automáticamente.
- [ ] Recargar la página de checkout a mitad del flujo (por ejemplo en el
      paso 3) y confirmar que se restaura el paso y los datos, pero pide
      volver a seleccionar el comprobante si ya se había elegido uno.
- [ ] Verificar en `/admin/pedidos` (con login de admin) que el pedido de
      prueba aparece con estado "Pendiente de verificación" y que se
      puede cambiar a "Confirmado manualmente" desde el selector.

## 4. Multi-viewport (visual)

- [ ] Mobile (375–430px): menú hamburguesa, drawer del carrito a pantalla
      completa, checkout usable con el teclado abierto (que ningún campo
      quede tapado).
- [ ] Tablet (768–1024px): grillas de catálogo y Home no deben verse
      apretadas ni con espacios raros.
- [ ] Desktop (1280px+): ya verificado en este entorno — ver capturas del
      flujo de checkout en la sesión de trabajo.

## 5. Accesibilidad rápida

- [ ] Navegar el checkout completo solo con teclado (Tab/Enter/Escape) —
      el foco debe ser visible y seguir un orden lógico.
- [ ] Verificar con un lector de pantalla (o el inspector de accesibilidad
      de Chrome DevTools) que el contador del carrito anuncia la cantidad
      correcta.

## 6. Cosas ya verificadas en este entorno (no hace falta repetir, solo confirmar que siguen así)

- Build de producción (`npm run build`) sin errores.
- Sin errores de hidratación en consola en: Home, Catálogo, ficha de
  producto, Nosotros, Checkout, `/admin/login` — verificado con la
  consola del navegador real.
- Ningún dato financiero (cuentas, llaves) fuera del checkout — footer,
  FAQ, contacto y carrito solo muestran nombres de métodos de pago.
- Import de la Temporada 26/27 (38 productos) — ver
  `docs/IMPORT_2627_REPORT.md` para el riesgo conocido de hotlinking a
  Yupoo, confirmado durante esta sesión (la misma URL de imagen sirvió una
  foto real en una carga y una versión reducida — posible bloqueo — en
  otra). **Prioridad alta antes de producción**: migrar estas imágenes al
  bucket propio de Supabase.
