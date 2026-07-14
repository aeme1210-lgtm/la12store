# BRIEF DE REDISEÑO — LA 12 STORE

> **Nota:** Si algo en este documento se contradice con `docs/REDESIGN_ADENDA.md`, la adenda tiene precedencia.

Actúa simultáneamente como:

1. Director senior de producto digital.
2. Diseñador UX/UI especializado en e-commerce de moda.
3. Especialista en conversión y comportamiento de compra.
4. Arquitecto frontend senior.
5. Desarrollador experto en React, Next.js, TypeScript y la tecnología que realmente utilice este repositorio.
6. Especialista técnico en SEO, accesibilidad y rendimiento web.
7. Director creativo especializado en cultura y moda futbolera.

Tu misión no es hacer pequeños cambios cosméticos. Debes auditar, replantear y reconstruir integralmente la experiencia digital de La 12 Store para convertirla en una tienda de camisetas de fútbol moderna, editorial, intuitiva, rápida, confiable y comercialmente profesional.

## URL que debes auditar

https://la12store-git-master-aeme1210-lgtms-projects.vercel.app/

Debes contrastar permanentemente:

* La web publicada.
* El código real del repositorio.
* Los datos reales del catálogo.
* Las imágenes y recursos existentes.
* Los hallazgos incluidos en este encargo.
* Los patrones útiles de los principales comercios digitales del mundo.

No copies diseños, código, identidad visual ni textos de otras marcas. Investiga y adopta únicamente principios de arquitectura, búsqueda, navegación, confianza, accesibilidad y conversión.

# RESTRICCIÓN ECONÓMICA ABSOLUTA

Este proyecto debe ejecutarse sin gastar dinero adicional.

Está prohibido:

* Contratar servicios.
* Comprar plantillas.
* Comprar componentes.
* Comprar fotografías.
* Comprar fuentes.
* Comprar iconos.
* Utilizar APIs de pago.
* Añadir un CMS de pago.
* Añadir Algolia u otro buscador pago.
* Migrar a Shopify u otra plataforma con costos adicionales.
* Contratar almacenamiento nuevo.
* Añadir herramientas que requieran una suscripción para que la web continúe funcionando.
* Introducir una dependencia comercial que luego bloquee funcionalidades.

Debes trabajar exclusivamente con:

* El hosting actual.
* La infraestructura actual.
* El código existente.
* Los datos existentes.
* Las fotografías existentes.
* Librerías gratuitas y de código abierto cuando sean realmente necesarias.
* CSS, JavaScript y APIs nativas del navegador.
* Las funciones gratuitas que ya estén disponibles en el proyecto o en su plan actual.

No propongas funcionalidades que dependan de dinero futuro.

# REGLAS DE EJECUCIÓN

No te limites a entregar recomendaciones o un mockup.

Debes:

1. Auditar.
2. Diseñar la solución.
3. Implementar la solución en el código.
4. Probarla.
5. Corregir errores.
6. Ejecutar build, lint y typecheck.
7. Entregar un resumen final preciso de los archivos modificados.

No me preguntes cómo quiero cada sección. Toma decisiones profesionales fundamentadas.

Antes de editar:

* Revisa `package.json`.
* Identifica framework, versión y estructura del proyecto.
* Revisa rutas, componentes, estilos, utilidades y fuentes de datos.
* Identifica cómo se almacenan y generan los productos.
* Identifica cómo funcionan carrito, WhatsApp, filtros, imágenes y personalización.
* Revisa qué dependencias ya existen.
* Comprueba qué funcionalidades son reales y cuáles solamente decorativas.
* Crea un punto de restauración, rama de seguridad o commit previo antes de una reconstrucción extensa, según el flujo disponible.

No reemplaces la tecnología actual por moda. Conserva la arquitectura cuando sea adecuada y refactoriza únicamente lo necesario.

# HALLAZGOS QUE DEBES VERIFICAR Y CORREGIR

La auditoría externa detectó, como mínimo:

1. La portada muestra "+0 camisetas disponibles".
2. El catálogo contiene aproximadamente 2.873 productos y 120 páginas.
3. El buscador no tiene el protagonismo necesario para un catálogo de ese tamaño.
4. El filtro "Tipo" mezcla colores, estilos y tipos de camiseta.
5. Existen nombres de productos en inglés y categorías en español.
6. Hay productos que parecen estar repetidos.
7. Barcelona aparece asociado a "Premier League" en una página de producto.
8. Se detectó al menos una diferencia entre el precio mostrado en el catálogo y el precio de la ficha.
9. Se repiten cifras y argumentos de confianza sin evidencias visibles.
10. Las reseñas son demasiado genéricas y anónimas.
11. Existe una notificación de compra reciente que puede parecer inventada si no está conectada a datos reales.
12. Se muestran números de cuentas bancarias personales directamente en el footer.
13. La información de envío internacional y nacional puede parecer contradictoria.
14. La página de producto tiene muy poca información para tomar una decisión segura.
15. Las respuestas de FAQ deben comprobarse para garantizar que estén presentes en el HTML, sean accesibles y puedan ser indexadas.
16. La experiencia depende demasiado de listas de productos y no suficientemente de colecciones, historias o recomendaciones.

> **Ver `docs/REDESIGN_ADENDA.md` sección 1 para las correcciones verificadas a estos hallazgos** (p. ej. el catálogo real es 3.344 productos, no 2.873; el "+0" es una animación, no un bug; etc.)

No des por ciertos estos hallazgos sin mirar el código. Compruébalos y documenta la causa técnica de cada uno.

# PRINCIPIO CENTRAL DEL REDISEÑO

La nueva La 12 Store debe sentirse como:

"Una plataforma editorial de cultura futbolera con una experiencia de compra de alto nivel".

No debe parecer:

* Una plantilla genérica.
* Un catálogo chino.
* Una lista descargada de un proveedor.
* Una tienda de dropshipping.
* Una copia de Nike, Adidas o Classic Football Shirts.
* Una página saturada de dorado.
* Un sitio lleno de animaciones innecesarias.
* Una web donde todos los elementos intentan llamar la atención simultáneamente.

El producto y las fotografías deben ser los protagonistas.

# DIRECCIÓN VISUAL

Construye un sistema visual moderno, editorial y distintivo.

## Paleta orientativa

* Negro profundo como base.
* Blanco cálido o marfil para fondos claros.
* Gris neutro para textos secundarios.
* Dorado sobrio como acento, utilizado con moderación.
* Verde únicamente para disponibilidad o confirmaciones.
* Rojo únicamente para errores, alertas o descuentos reales.

El dorado no debe utilizarse en todo. Debe funcionar como detalle premium, no como decoración excesiva.

## Tipografía

Utiliza fuentes gratuitas.

Preferencia:

* Una tipografía display contundente para titulares editoriales.
* Una tipografía sans-serif extremadamente legible para interfaz, precios, filtros y textos.

Si el proyecto es Next.js, utiliza `next/font` para evitar saltos visuales y solicitudes innecesarias.

No uses más de dos familias tipográficas.

> **Ver adenda sección 1**: Playfair Display + Inter ya están integradas vía `next/font` y cumplen este criterio. Partir de ellas.

## Composición

* Mucho espacio negativo.
* Fotografías grandes.
* Titulares cortos.
* Jerarquía evidente.
* Grillas limpias.
* Bordes sutiles.
* Sombras mínimas.
* Radio de esquinas consistente.
* Sistema de espaciado de ocho puntos.
* Iconografía uniforme.
* Transiciones de 160 a 240 milisegundos.
* Compatibilidad con `prefers-reduced-motion`.

Evita carruseles automáticos, videos pesados y animaciones que bloqueen la navegación.

# ARQUITECTURA DE INFORMACIÓN

Replantea la navegación principal.

La cabecera debe incluir, según el espacio disponible:

* Logo.
* Novedades.
* Selecciones.
* Clubes.
* Retro.
* Versión jugador.
* Colecciones.
* Buscador.
* Carrito o pedido.
* WhatsApp como acción secundaria, no como elemento que compita con todo.

En móvil:

* Header compacto.
* Buscador fácilmente accesible.
* Menú lateral organizado por necesidades reales.
* Carrito visible.
* Áreas táctiles mínimas adecuadas.
* Ningún enlace debe depender de hover.

# NUEVA PORTADA

La portada no debe ser una lista de componentes aislados. Diseña una narrativa.

Mantén un máximo aproximado de ocho bloques de alto valor.

## 1. Barra informativa superior

Mostrar únicamente información verdadera y útil, por ejemplo:

* Envíos desde Santa Marta.
* Envíos nacionales.
* Personalización disponible.
* Atención por WhatsApp.

No mostrar promociones inventadas ni urgencia falsa.

## 2. Header profesional y fijo

* Fondo adaptado al scroll.
* Buscador protagonista.
* Navegación clara.
* Estado accesible de foco.
* Contador real del carrito.
* Sin saltos visuales.

## 3. Hero editorial

Debe usar una de las mejores fotografías existentes.

Requisitos:

* Una sola idea principal.
* Un titular fuerte.
* Una frase secundaria breve.
* Un CTA principal.
* Un CTA secundario.
* Imagen optimizada.
* Correcta lectura sobre la fotografía.
* Buen comportamiento móvil.
* No colocar cinco mensajes promocionales simultáneos.

Ejemplo conceptual, no necesariamente literal:

"Camisetas que cuentan historias."

CTA principal: "Explorar colección"
CTA secundario: "Encontrar mi camiseta"

## 4. Navegación visual rápida

Crear accesos claros hacia:

* Selecciones.
* Clubes.
* Retro.
* Nuevas temporadas.
* Versión fan.
* Versión jugador.
* Manga larga.
* Disponibles inmediatamente, únicamente si el dato existe.

Usar fotografías o composiciones existentes. No depender exclusivamente de texto.

## 5. Colección destacada

Crear una sección editorial actualizable desde los datos del proyecto.

Puede mostrar:

* Lo más buscado.
* Últimos ingresos.
* Favoritas de la comunidad.
* Retro imprescindibles.
* Colección de una selección o club.

No utilizar "más vendido", "últimas unidades" o "tendencia" si no existe información que lo respalde.

## 6. Encuentra tu camiseta

Crear una experiencia guiada gratuita y completamente local.

Debe permitir elegir:

1. Selección o club.
2. Estilo moderno o retro.
3. Versión fan o jugador.
4. Presupuesto.
5. Talla.

Con esas respuestas debe filtrar y mostrar productos reales del catálogo.

No utilizar inteligencia artificial externa ni APIs de pago.

## 7. Comunidad y confianza

Mostrar únicamente información verificable.

Puede incluir:

* Fotografías reales de clientes, si ya existen y pueden utilizarse.
* Opiniones reales.
* Capturas autorizadas.
* Fotografías editoriales propias.
* Historia de Andrés y Silvana.
* Punto físico o presencia en Santa Marta, si continúa vigente.
* Enlaces reales a redes sociales.

No inventes:

* Nombres.
* Pedidos.
* Número de compradores.
* Calificaciones.
* Ventas recientes.
* Países alcanzados.
* Porcentajes de satisfacción.

Si una cifra no puede verificarse, elimínala o reemplázala por información cualitativa honesta.

## 8. Footer profesional

El footer debe contener:

* Navegación.
* Contacto.
* Redes.
* Información de envíos.
* Preguntas frecuentes.
* Política de cambios.
* Política de privacidad.
* Términos.
* Métodos de pago aceptados.
* Ubicación general.

No mostrar públicamente números completos de cuentas bancarias. Mostrar únicamente los métodos aceptados. La información concreta para transferir debe entregarse dentro del flujo seguro de confirmación del pedido.

# CATÁLOGO Y DESCUBRIMIENTO

El catálogo es una prioridad absoluta.

## Buscador global

Crear un buscador visible desde todas las páginas.

Debe:

* Ignorar mayúsculas y minúsculas.
* Ignorar tildes.
* Buscar por selección.
* Buscar por club.
* Buscar por jugador cuando el dato exista.
* Buscar por temporada.
* Buscar por año.
* Buscar por tipo.
* Buscar por versión.
* Buscar por color.
* Buscar por palabras parciales.
* Tolerar variaciones razonables de escritura.
* Conservar el texto de búsqueda.
* Mostrar sugerencias.
* Agrupar sugerencias por productos, equipos y colecciones.
* Mostrar alternativas cuando no haya resultados.

Para evitar costos, crea un índice local generado durante el build o utiliza una librería gratuita y liviana únicamente si es necesaria.

No utilizar Algolia.

> **Ver adenda sección 4**: preferir búsqueda server-side con ILIKE + `unaccent`/`pg_trgm` dado el volumen real (3.344 productos); nunca traer el catálogo completo al cliente.

## Taxonomía correcta

Reestructura los productos usando atributos separados.

Modelo orientativo:

* `id`
* `slug`
* `nombre`
* `nombreNormalizado`
* `equipo`
* `tipoEquipo`: club o selección
* `pais`
* `liga`
* `temporada`
* `anioInicio`
* `anioFin`
* `tipoCamiseta`: local, visitante, tercera, arquero, entrenamiento o especial
* `version`: fan, jugador o retro
* `manga`: corta o larga
* `colorPrincipal`
* `coloresSecundarios`
* `precio`
* `precioAnterior`, únicamente cuando sea real
* `imagenes`
* `tallas`
* `stockPorTalla`
* `personalizable`
* `parchesDisponibles`
* `destacado`
* `novedad`
* `colecciones`
* `descripcion`
* `materiales`
* `cuidados`

Adapta este modelo al origen real de los datos. No destruyas información existente.

Si el catálogo proviene de datos desordenados, crea una capa de normalización determinista y reutilizable. No corrijas manualmente miles de productos si puede resolverse mediante scripts, reglas o mapeos.

Genera un informe automático de:

* Slugs duplicados.
* Productos duplicados.
* Precios inconsistentes.
* Categorías inexistentes.
* Temporadas no reconocidas.
* Productos sin imágenes.
* Productos sin precio.
* Productos sin equipo.
* Productos mal clasificados.
* Variantes separadas que deberían pertenecer a un mismo producto.

No sobrescribas silenciosamente los datos originales. Documenta cada transformación.

> **Ver adenda secciones 1 y 2**: los 794 duplicados reales tienen una limpieza YA planificada (backup JSON, nunca borrar filas referenciadas en OrderItem, aprobación explícita del dueño). Ejecutar ese plan, no improvisar otro. Atacar también la causa raíz en `/scripts`.

## Filtros

Separar correctamente:

* Selección o club.
* País.
* Liga.
* Temporada.
* Año.
* Versión.
* Local, visitante, tercera, arquero o especial.
* Manga.
* Talla.
* Color.
* Rango de precio.
* Disponibilidad.
* Personalización.

Incluir:

* Número de resultados por filtro.
* Filtros aplicados.
* Botón para eliminar individualmente.
* Botón "Limpiar todo".
* Estado en la URL mediante parámetros.
* Restauración de filtros al regresar desde un producto.
* Panel lateral en escritorio.
* Bottom sheet accesible en celular.

## Ordenamiento

Agregar:

* Recomendados.
* Más recientes.
* Precio menor a mayor.
* Precio mayor a menor.
* Nombre.
* Más populares, solamente si hay datos reales.

## Tarjetas de producto

Cada tarjeta debe mostrar de forma limpia:

* Fotografía principal.
* Segunda fotografía al interactuar, únicamente en dispositivos adecuados.
* Nombre normalizado en español.
* Equipo o selección.
* Temporada.
* Tipo o versión.
* Precio en pesos colombianos.
* Precio anterior únicamente si existe un descuento real.
* Disponibilidad relevante.
* Etiquetas verdaderas.
* Acción rápida para ver detalles.
* Estado accesible de foco.

En celular:

* Dos columnas cuando el ancho lo permita.
* Texto legible.
* Botones fáciles de pulsar.
* Imágenes con proporciones consistentes.
* Nada debe desbordarse.

No repetir como productos separados simples variaciones que puedan organizarse dentro de una misma ficha.

## Paginación

No cargues los 2.873 productos simultáneamente.

Implementa una estrategia que preserve:

* Rendimiento.
* Accesibilidad.
* URLs navegables.
* Indexación.
* Estado de filtros.
* Posición de desplazamiento.

Puede utilizarse paginación mejorada o "cargar más" con enlaces rastreables, según la arquitectura del proyecto.

# PÁGINA DE PRODUCTO

La ficha debe convertirse en una experiencia de compra completa.

## Galería

* Fotografía principal grande.
* Miniaturas.
* Swipe en móvil.
* Zoom.
* Proporciones consistentes.
* Carga diferida para imágenes no iniciales.
* Texto alternativo útil.
* Sin cambios bruscos de diseño.
* Posibilidad de mostrar frente, espalda, detalles, textura y fotografía puesta cuando existan.

## Información principal

Mostrar:

* Nombre normalizado.
* Equipo o selección.
* Temporada.
* Tipo.
* Versión.
* Precio.
* Disponibilidad real.
* Selector de talla.
* Enlace visible a guía de tallas.
* Recomendación de ajuste.
* Personalización.
* Parches.
* Cantidad.
* Envío.
* Cambios.
* Métodos de pago.
* CTA principal.

## Selector de talla

Debe:

* Explicar si el ajuste es normal, reducido o amplio.
* Diferenciar versión fan y jugador.
* Desactivar tallas no disponibles.
* Mostrar mensajes claros.
* No permitir agregar sin talla cuando sea obligatoria.
* Incluir una guía visual accesible.
* Guardar correctamente la selección.

## Personalización

Cuando el producto permita personalización, incluir campos reales para:

* Nombre.
* Número.
* Parches.
* Observaciones.

Validar longitud y caracteres.

La personalización elegida debe aparecer en:

* Carrito.
* Resumen.
* Mensaje de WhatsApp.
* Precio final, si existe algún costo.
* Confirmación.

No afirmar que la personalización es gratuita cuando los datos reales no lo confirmen.

> **Ver adenda sección 1**: dorsal y parches SÍ SON GRATIS en retail — es el diferenciador comercial. Destacarlo en hero, ficha y carrito. (El cobro de $15.000 es solo mayorista y no aparece en la web pública.)

## Información ampliada

Crear secciones o acordeones para:

* Descripción.
* Historia o inspiración.
* Versión y ajuste.
* Materiales.
* Cuidados.
* Envíos.
* Cambios.
* Preguntas frecuentes.

No inventar historias específicas de una camiseta. Utiliza únicamente datos confirmados. Cuando no exista información editorial, usa una descripción objetiva y útil.

## Compra móvil

Crear una barra fija inferior con:

* Precio.
* Estado de selección.
* Botón "Agregar al pedido" o equivalente.

No debe cubrir contenido ni interferir con accesibilidad.

## Recomendaciones

Mostrar productos relacionados utilizando datos reales:

* Mismo equipo.
* Misma selección.
* Misma temporada.
* Misma versión.
* Estilo retro relacionado.
* Precio semejante.

Agregar "Vistos recientemente" mediante almacenamiento local, sin servicio externo.

# CARRITO Y PEDIDO POR WHATSAPP

Determina si actualmente existe una pasarela de pagos real.

Si no existe pago directo, no presentes la experiencia como un checkout bancario completo.

Crea un flujo honesto:

1. El cliente agrega camisetas.
2. Revisa el pedido.
3. Edita talla y personalización.
4. Ve subtotal.
5. Conoce que envío se confirma según destino.
6. Continúa por WhatsApp.
7. Se genera un mensaje profesional con toda la información.

El mensaje debe incluir:

* Producto.
* URL.
* Talla.
* Versión.
* Nombre.
* Número.
* Parches.
* Cantidad.
* Precio unitario.
* Subtotal.
* Ciudad, si fue solicitada.
* Observaciones.

Centraliza el número de WhatsApp en un único archivo de configuración. No lo repitas manualmente en múltiples componentes.

Comprueba cuál es el número actualmente configurado y señala cualquier inconsistencia antes de publicar.

> **Ver adenda sección 1**: fuente de verdad es +57 300 844 3885.

El carrito debe permitir:

* Editar.
* Eliminar.
* Cambiar cantidad.
* Vaciar.
* Conservarse al recargar.
* Mostrar subtotal real.
* Evitar duplicados accidentales.
* Mantener personalizaciones separadas cuando sean distintas.

# CONTENIDO Y TONO DE MARCA

La voz debe sentirse:

* Apasionada.
* Contemporánea.
* Futbolera.
* Premium.
* Cercana.
* Colombiana.
* Segura.
* Sin exageraciones poco creíbles.

Evitar en textos comerciales:

* Afirmar afiliación oficial inexistente.
* "Original" cuando no pueda demostrarse.
* "Igual a la original".
* "Réplica AAA".
* "La que usan los jugadores".
* "100% garantizado" sin condiciones claras.
* Cifras inventadas.
* Escasez inventada.
* Ventas recientes inventadas.
* Reseñas fabricadas.
* Nombres oficiales protegidos utilizados como si existiera patrocinio o asociación.

Mantener la política editorial de la marca de evitar el uso promocional de expresiones como "FIFA", nombres de fabricantes y términos que puedan sugerir oficialidad cuando no corresponda.

Priorizar expresiones como:

* Cultura futbolera.
* Camisetas con historia.
* Diseño local o visitante.
* Versión fan.
* Versión jugador.
* Edición retro.
* Personalización.
* La pasión se viste aquí.

No renombres automáticamente productos cuando ello pueda perjudicar que el cliente encuentre el equipo o selección. Equilibra claridad comercial, SEO y prudencia de marca.

# PÁGINA "NOSOTROS"

Conservar la historia de Andrés y Silvana, pero presentarla de forma editorial.

Debe incluir:

* Una fotografía principal auténtica.
* Una historia breve y emocional.
* Cómo nació la tienda.
* Qué representa la marca.
* Cómo seleccionan las camisetas.
* La conexión con Santa Marta.
* La relación entre fútbol, moda y comunidad.
* CTA al catálogo.

No convertir la página en una biografía extensa ni utilizar cargos grandilocuentes.

# PREGUNTAS FRECUENTES Y POLÍTICAS

Crear o mejorar páginas claramente accesibles para:

* Preguntas frecuentes.
* Envíos.
* Cambios y devoluciones.
* Privacidad.
* Tratamiento de datos.
* Términos de uso.
* Contacto.

No inventes plazos, garantías ni derechos específicos.

Extrae las políticas reales existentes. Cuando falte un dato indispensable:

* Utiliza un marcador interno claramente identificado.
* Documenta qué información debe validar el propietario.
* No publiques una promesa falsa.

> **Ver adenda sección 1**: cifras de envío contradictorias entre documentos de negocio — implementar como constantes en un solo archivo config con marcador `TODO_OWNER` y listar qué debe confirmar el dueño.

Las respuestas de FAQ deben estar presentes en el HTML y funcionar con teclado y lector de pantalla.

# SEO TÉCNICO

Implementar según la arquitectura disponible:

* Títulos únicos.
* Descripciones únicas.
* Canonicals.
* Open Graph.
* Twitter Cards.
* Sitemap.
* Robots.
* URLs limpias.
* Breadcrumbs reales.
* Redirecciones para slugs antiguos cuando cambien.
* Jerarquía correcta de encabezados.
* Enlaces internos.
* Texto alternativo.
* Página 404 útil.
* Página de resultados sin productos.
* Metadatos por colección.
* Metadatos por categoría.
* Metadatos por producto.

Agregar datos estructurados válidos cuando exista información suficiente:

* `Organization`
* `WebSite`
* `SearchAction`
* `BreadcrumbList`
* `Product`
* `Offer`
* Variantes de producto.
* Disponibilidad.
* Precio.
* Envío.
* Política de cambios o devoluciones, únicamente cuando esté definida.

No insertar puntuaciones o reseñas estructuradas inventadas.

Crear contenido indexable para categorías importantes, sin llenar las páginas de textos repetitivos o generados mecánicamente.

> **Ver adenda sección 5 (prioridad elevada)**: og:image global + og:image por producto + twitter:card summary_large_image son criterio de aceptación, no detalle secundario — es el canal de ventas real (WhatsApp/Instagram).

# RENDIMIENTO

Objetivos mínimos:

* LCP menor de 2,5 segundos.
* INP menor de 200 milisegundos.
* CLS menor de 0,1.
* Lighthouse móvil alto sin sacrificar funciones.
* Carga inicial reducida.
* Sin errores de hidratación.
* Sin advertencias graves en consola.

Aplicar:

* Optimización de imágenes.
* `srcset` o componente de imagen del framework.
* Dimensiones explícitas.
* Lazy loading.
* Prioridad únicamente para la imagen LCP.
* Fuentes optimizadas.
* Eliminación de JavaScript innecesario.
* División de código.
* Importaciones dinámicas cuando proceda.
* Componentes de servidor cuando la arquitectura lo permita.
* Caché adecuada.
* Evitar solicitudes repetidas.
* Evitar paquetes pesados para tareas simples.
* Evitar cargar los miles de productos en el cliente.
* Evitar efectos visuales costosos.
* Evitar imágenes enormes utilizadas como miniaturas.

> **Ver adenda sección 3 (restricción económica real de imágenes)**: PROHIBIDO usar `/render/image/` de Supabase o cualquier transformación con costo — el proyecto ya reventó ese límite una vez. Usar `/storage/v1/object/public/` directo vía el custom loader existente. Cuidado también con la cuota de optimización de imágenes de Vercel (plan Hobby).

# ACCESIBILIDAD

Objetivo: WCAG 2.2 nivel AA en los flujos principales.

Comprobar:

* Contraste.
* Navegación por teclado.
* Orden de tabulación.
* Foco visible.
* Botones semánticos.
* Etiquetas de formularios.
* Mensajes de error.
* Estados de carga.
* Lectores de pantalla.
* `aria-expanded` en acordeones.
* `aria-live` para cambios del carrito.
* Texto alternativo.
* Áreas táctiles.
* Reducción de movimiento.
* Zoom de navegador.
* Orientación móvil.
* No depender únicamente del color.

# ANALÍTICA GRATUITA

No instales una solución paga.

Si ya existe analítica, reutilízala.

Deja eventos consistentes para:

* Búsqueda realizada.
* Sugerencia seleccionada.
* Filtro aplicado.
* Producto visto.
* Talla seleccionada.
* Producto agregado.
* Carrito abierto.
* Inicio de pedido por WhatsApp.
* Colección visitada.
* Error sin resultados.

Centraliza estos eventos en un adaptador. La web debe seguir funcionando aunque no exista un proveedor de analítica.

# ADMINISTRACIÓN SIN CMS PAGO

Facilita la gestión futura.

Crea documentación sencilla para:

* Agregar un producto.
* Cambiar un precio.
* Actualizar stock.
* Destacar una camiseta.
* Crear una colección.
* Cambiar el hero.
* Actualizar WhatsApp.
* Añadir una reseña real.
* Cambiar información de envío.

Si los datos son estáticos, crea validaciones y scripts que detecten errores antes del build.

Añade un archivo como `ADMIN_GUIDE.md` o equivalente.

> **Ver adenda sección 2**: documentar en `ADMIN_GUIDE.md` cómo importar de Yupoo sin generar duplicados.

# EXPERIENCIA RESPONSIVE

Prueba como mínimo:

* 320 px.
* 375 px.
* 390 px.
* 430 px.
* 768 px.
* 1024 px.
* 1280 px.
* 1440 px.

Prioriza especialmente iPhone y navegación móvil.

Verifica:

* Header.
* Menú.
* Buscador.
* Filtros.
* Tarjetas.
* Galería.
* Selectores.
* Carrito.
* Botón fijo.
* Footer.
* Teclado móvil.
* Mensaje de WhatsApp.

> **Ver adenda sección 6**: la verificación visual multi-viewport y Lighthouse/PageSpeed las hace el dueño sobre la preview; Claude Code razona el responsive por código y no afirma métricas no medidas.

# ESTADOS QUE DEBEN DISEÑARSE

No diseñes únicamente el estado perfecto.

Incluye:

* Cargando.
* Error.
* Sin resultados.
* Producto sin stock.
* Talla agotada.
* Imagen faltante.
* Carrito vacío.
* Carrito con productos.
* Búsqueda vacía.
* Búsqueda sin coincidencias.
* Filtro sin resultados.
* Error de validación.
* Enlace inexistente.
* Producto no encontrado.
* Conexión lenta.

# CRITERIOS DE ACEPTACIÓN

No consideres terminado el proyecto hasta que:

1. Ya no aparezca "+0 camisetas".
2. El precio sea consistente entre tarjeta, ficha y carrito.
3. No existan breadcrumbs evidentemente incorrectos.
4. No existan filtros que mezclen color, versión y tipo.
5. El buscador sea visible y útil.
6. El catálogo pueda navegarse cómodamente en móvil.
7. La web tenga español consistente.
8. No existan textos de prueba.
9. No existan cifras inventadas.
10. No existan ventas recientes simuladas.
11. No se publiquen números bancarios completos en el footer.
12. Las páginas de producto expliquen talla, versión, personalización, envío y cambios.
13. El pedido de WhatsApp incluya todas las opciones escogidas.
14. El carrito persista correctamente.
15. No existan errores de consola.
16. El build termine correctamente.
17. Typecheck y lint pasen o se documente con exactitud cualquier limitación preexistente.
18. Los elementos interactivos funcionen con teclado.
19. Las imágenes no deformen ni desplacen el contenido.
20. La web conserve la identidad auténtica de La 12 Store.
21. Ninguna función nueva requiera pagos futuros.
22. No se haya destruido la base de productos existente.
23. La experiencia de inicio a pedido sea corta y comprensible.
24. La web se sienta como una marca editorial real, no como una plantilla.

> **Criterios adicionales 25-29 en `docs/REDESIGN_ADENDA.md` sección 8.**

# ORDEN DE TRABAJO OBLIGATORIO

## Fase 1: Auditoría

Entrega internamente un diagnóstico de:

* Arquitectura.
* Datos.
* Diseño.
* Navegación.
* Producto.
* Carrito.
* Rendimiento.
* SEO.
* Accesibilidad.
* Confianza.
* Contenido.
* Riesgos.

## Fase 2: Sistema y estructura

Define:

* Arquitectura de información.
* Rutas.
* Taxonomía.
* Sistema visual.
* Componentes reutilizables.
* Modelo de datos.
* Estrategia de búsqueda.
* Estrategia de filtros.
* Flujo de pedido.

## Fase 3: Correcciones estructurales

Primero corrige:

* Datos.
* Precios.
* Categorías.
* Duplicados.
* Slugs.
* Configuración.
* WhatsApp.
* Errores de conteo.

No construyas una interfaz hermosa encima de datos incorrectos.

## Fase 4: Implementación visual

Reconstruye:

* Header.
* Portada.
* Catálogo.
* Tarjetas.
* Ficha.
* Carrito.
* Buscador.
* Nosotros.
* FAQ.
* Footer.
* Estados vacíos y errores.

## Fase 5: Optimización

Trabaja:

* Imágenes.
* JavaScript.
* Fuentes.
* SEO.
* Accesibilidad.
* Responsive.
* Core Web Vitals.

## Fase 6: Control de calidad

Ejecuta:

* Build.
* Typecheck.
* Lint.
* Pruebas disponibles.
* Revisión manual.
* Navegación móvil.
* Revisión de enlaces.
* Revisión de consola.
* Revisión del pedido por WhatsApp.
* Revisión de precios.

# ENTREGA FINAL

Al terminar, responde con:

1. Diagnóstico inicial resumido.
2. Concepto creativo aplicado.
3. Arquitectura final.
4. Funciones implementadas.
5. Errores de datos corregidos.
6. Archivos creados.
7. Archivos modificados.
8. Dependencias añadidas y motivo.
9. Pruebas ejecutadas.
10. Resultados de build, typecheck y lint.
11. Métricas de rendimiento obtenidas.
12. Aspectos que requieren datos reales del propietario.
13. Instrucciones exactas para ejecutar y publicar.
14. Guía breve para administrar productos y colecciones.

No me entregues solamente fragmentos de código.

No pares después de diseñar la portada.

No sacrifiques las páginas internas.

No escondas errores preexistentes.

No inventes resultados.

No aumentes los costos.

Tu trabajo termina cuando La 12 Store tenga una experiencia integral, consistente y lista para vender, utilizando únicamente los recursos disponibles.
