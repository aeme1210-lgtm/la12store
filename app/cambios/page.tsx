import type { Metadata } from "next";
import Link from "next/link";
import { whatsAppLink, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "Política de Cambios, Devoluciones, Garantía, Retracto y Entrega",
  description:
    "Política oficial de La 12 Store: derecho de retracto, cambios de talla, garantía legal de 1 año, plazos de entrega y devolución del dinero.",
};

const summary = [
  { label: "Envío", value: "Gratis en todas las camisetas de la web" },
  { label: "Entrega estimada", value: "25 a 30 días calendario desde el pago confirmado" },
  { label: "Verificación de pago", value: "~2 horas en horario de atención (2:00 p. m. – 10:00 p. m.)" },
  { label: "Derecho de retracto", value: "5 días hábiles siguientes a la entrega" },
  { label: "Cambio voluntario de talla", value: "5 días hábiles siguientes a la entrega" },
  { label: "Garantía legal", value: "1 año desde la entrega" },
];

export default function CambiosPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p
          className="text-[#A47C42] text-xs tracking-widest uppercase mb-2"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Compra segura
        </p>
        <h1
          className="text-3xl md:text-4xl font-black text-white uppercase mb-2"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Política de Cambios, Devoluciones, Garantía, Retracto y Entrega
        </h1>
        <p className="text-[#666666] text-xs mb-8">Fecha de actualización: 17 de julio de 2026</p>

        <p className="text-[#A0A0A0] text-sm leading-relaxed mb-6">
          Esta política regula las solicitudes de cambios, devoluciones, garantía legal, derecho
          de retracto, entrega y reembolsos de los productos comprados en la página web de{" "}
          <strong className="text-white">La 12 Store</strong>. Se interpreta conforme a la Ley
          1480 de 2011 (Estatuto del Consumidor), la Ley 2439 de 2024, el Decreto 1074 de 2015, el
          Decreto 735 de 2013 y demás normas colombianas aplicables. Ninguna disposición de esta
          política limita, elimina o implica renuncia a tus derechos legales como consumidor.
        </p>

        {/* Resumen inicial — los números clave, sin tener que leer todo el documento */}
        <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4 mb-6">
          <p
            className="text-[#A47C42] font-bold uppercase text-xs tracking-widest mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Resumen
          </p>
          <dl className="space-y-2">
            {summary.map((s) => (
              <div key={s.label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-3 text-sm">
                <dt className="text-[#9CA3AF] flex-shrink-0">{s.label}</dt>
                <dd className="text-white text-right sm:text-right font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Identificación del vendedor — solo datos reales, sin placeholders */}
        <div className="bg-[#141414] rounded-xl border border-[#8A6435]/20 p-4 mb-8 text-sm text-[#A0A0A0] space-y-1">
          <p><span className="text-[#9CA3AF]">Nombre comercial:</span> <span className="text-white">La 12 Store</span></p>
          <p><span className="text-[#9CA3AF]">Domicilio:</span> <span className="text-white">Santa Marta, Magdalena, Colombia</span></p>
          <p>
            <span className="text-[#9CA3AF]">WhatsApp de atención:</span>{" "}
            <a href={whatsAppLink("Hola La 12 Store, tengo una consulta sobre la política de cambios")} target="_blank" rel="noopener noreferrer" className="text-[#A47C42] hover:underline">
              {WHATSAPP_DISPLAY}
            </a>
          </p>
          <p><span className="text-[#9CA3AF]">Horario de atención:</span> <span className="text-white">Todos los días, de 2:00 p. m. a 10:00 p. m.</span></p>
        </div>

        <Accordion>
          <AccordionItem title="Confirmación del pedido y verificación del pago">
            <p className="mb-2">
              La transferencia y el envío del comprobante <strong className="text-white">no
              implican la confirmación automática</strong> del pago ni del pedido.
            </p>
            <p className="mb-2">
              Después de recibir el comprobante, verificamos directamente que el dinero haya sido
              abonado correctamente. Mientras esto sucede, tu pedido queda en estado{" "}
              <strong className="text-white">&quot;Pendiente de verificación&quot;</strong>.
            </p>
            <p className="mb-2">
              En horario de atención (2:00 p. m. a 10:00 p. m.) procuramos verificar las
              transferencias en un plazo objetivo máximo de dos horas. Fuera de ese horario, la
              confirmación puede quedar sujeta a la siguiente franja de atención.
            </p>
            <p>
              No consideres confirmado tu pedido hasta recibir un mensaje expreso de La 12 Store
              indicando que el pago fue verificado. Si el dinero fue recibido pero el producto ya
              no está disponible, te avisaremos de inmediato y ofreceremos una alternativa
              equivalente o la devolución total del dinero, según tu decisión.
            </p>
          </AccordionItem>

          <AccordionItem title="Envío gratuito y plazo estimado de entrega">
            <p className="mb-2">
              Todas las camisetas compradas directamente en la web de La 12 Store tienen{" "}
              <strong className="text-white">envío gratis</strong> — el costo aparece en el
              checkout con valor de $0.
            </p>
            <p className="mb-2">
              El plazo estimado de entrega es de <strong className="text-white">25 a 30 días
              calendario</strong>, contados desde la confirmación efectiva del pago. Puede ser
              menor según disponibilidad y ubicación del producto.
            </p>
            <p>
              Si el producto no está disponible te avisaremos de inmediato. Si la entrega supera
              el plazo informado o los 30 días calendario previstos para comercio electrónico,
              puedes terminar la compra y solicitar la devolución total de lo pagado, sin
              retenciones ni descuentos.
            </p>
          </AccordionItem>

          <AccordionItem title="Derecho de retracto">
            <p className="mb-2">
              Por tratarse de una compra por internet, tienes derecho a retractarte dentro de los{" "}
              <strong className="text-white">5 días hábiles siguientes a la entrega</strong> del
              producto. Para ejercerlo:
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-2">
              <li>Infórmanos tu decisión dentro del plazo indicado.</li>
              <li>Identifica el pedido y el producto.</li>
              <li>Devuelve la prenda por los medios que te indiquemos.</li>
              <li>Entrégala en las mismas condiciones en que la recibiste.</li>
              <li>Asume los costos de transporte de la devolución por retracto.</li>
            </ol>
            <p className="mb-2">
              El producto no debe presentar señales de uso distintas a una revisión o prueba
              razonable de talla, ni estar lavado, perfumado, manchado, alterado o desprovisto de
              etiquetas y empaques.
            </p>
            <p className="mb-3">
              Ejercido el retracto y cumplidas las condiciones, el reintegro del dinero se produce
              dentro de un máximo de <strong className="text-white">15 días calendario</strong>.
            </p>
            <p className="text-white font-semibold mb-1">Productos personalizados</p>
            <p className="mb-2">
              El retracto puede no aplicar a prendas confeccionadas por instrucción particular del
              comprador o claramente personalizadas: nombre, número/dorsal, combinación especial
              de estampados o parches solicitados.
            </p>
            <p>
              Esta excepción <strong className="text-white">no elimina la garantía legal</strong>:
              si la prenda tiene un defecto, fue personalizada incorrectamente, llegó en una talla
              distinta de la confirmada o no corresponde a lo solicitado, puedes reclamar igual.
            </p>
          </AccordionItem>

          <AccordionItem title="Cambios voluntarios por talla">
            <p className="mb-2">
              Si la talla recibida es exactamente la que confirmaste, pero el ajuste no te queda
              bien, puedes pedir un cambio comercial de talla dentro de los{" "}
              <strong className="text-white">5 días hábiles siguientes a la entrega</strong>,
              sujeto a disponibilidad de la nueva talla, código de pedido, prenda sin uso,
              etiquetas y empaques conservados, y sin lavado, olores, manchas ni alteraciones.
            </p>
            <p className="mb-2">
              Los costos de envío del cambio voluntario de talla los asume el comprador, salvo que
              anunciemos expresamente una condición más favorable. Podemos pedir fotos o un video
              breve para orientar la nueva talla.
            </p>
            <p className="text-white font-semibold mb-1">Productos personalizados</p>
            <p>
              Las prendas personalizadas (nombre, dorsal, parches) no tienen cambio voluntario por
              talla cuando la talla enviada es la que confirmaste — por eso te pedimos revisar la
              guía oficial de medidas y confirmar tu talla antes de finalizar la compra.
            </p>
          </AccordionItem>

          <AccordionItem title="Talla o producto enviado incorrectamente">
            <p className="mb-2">Si recibes una talla distinta de la confirmada, una versión diferente (Fan en vez de Player), un equipo distinto, una prenda distinta de la comprada, una personalización diferente de la solicitada o una cantidad menor de productos, asumimos los costos razonables de devolución y del nuevo envío.</p>
            <p>
              Avísanos tan pronto como sea posible, indicando el código del pedido, la prenda
              recibida y la diferencia encontrada. Verificamos la talla enviada con la etiqueta de
              la prenda y la información del pedido.
            </p>
          </AccordionItem>

          <AccordionItem title="Garantía legal">
            <p className="mb-2">
              Todas las prendas nuevas de La 12 Store tienen garantía legal por calidad, idoneidad
              y conformidad, con un término de{" "}
              <strong className="text-white">un año contado desde la entrega</strong>.
            </p>
            <p className="mb-2">Puede cubrir, entre otras: escudos desprendidos o mal fijados, dorsales o estampados borrados o desprendidos, costuras abiertas o defectos de confección, daños de fabricación irreversibles, prenda diferente de la comprada, talla distinta de la confirmada, personalización distinta de la solicitada, y defectos que afecten de forma relevante la calidad, duración o uso normal.</p>
            <p>
              La garantía legal es gratuita. Cuando la reclamación proceda, asumimos los costos
              razonables de transporte para hacerla efectiva.
            </p>
          </AccordionItem>

          <AccordionItem title="Soluciones aplicables por garantía">
            <p className="mb-2">
              Si el defecto es reparable, lo reparamos gratis en un plazo razonable. Si no puede
              repararse, puedes pedir la reposición por una prenda igual, el cambio por una de
              características equivalentes, o la devolución del dinero cuando corresponda.
            </p>
            <p>
              Si tras una reparación vuelve a fallar lo mismo, puedes elegir entre una nueva
              reparación, el cambio de la prenda o la devolución del dinero. Un producto cambiado
              completamente por garantía inicia un nuevo término de garantía desde su entrega.
            </p>
          </AccordionItem>

          <AccordionItem title="Hilos sueltos y detalles menores">
            <p className="mb-2">
              Un hilo suelto aislado que no comprometa la estructura, apariencia, duración ni
              funcionalidad de la prenda no constituye necesariamente un daño irreversible —
              evaluamos cada caso individualmente.
            </p>
            <p>
              Esto no excluye la garantía cuando hay costura abierta, desprendimiento de piezas,
              rotura del tejido, defecto estructural u otro problema que continúe extendiéndose. No
              tienes que cortar, coser ni reparar la prenda antes de reclamar.
            </p>
          </AccordionItem>

          <AccordionItem title="Situaciones que pueden no estar cubiertas">
            <p className="mb-2">
              La garantía puede no proceder cuando el daño se produjo exclusivamente por una causa
              ajena a la calidad original de la prenda: uso contrario a su finalidad, lavado sin
              seguir las instrucciones, blanqueadores o químicos abrasivos, plancha directa sobre
              escudos/dorsales/estampados, secadora o temperaturas no recomendadas, cortes,
              quemaduras o accidentes posteriores a la entrega, daños causados por terceros,
              alteraciones no autorizadas, desgaste normal de uso, o fuerza mayor.
            </p>
            <p>
              La exclusión no es automática: debe existir relación entre el hecho y el daño. No se
              te puede exigir el cumplimiento de instrucciones que no te informamos claramente y en
              español.
            </p>
          </AccordionItem>

          <AccordionItem title="Recomendación al abrir el paquete">
            <p className="mb-2">
              Te recomendamos grabar un video continuo desde antes de abrir el paquete hasta
              mostrar el empaque, la guía de envío, la cantidad de productos, ambos lados de las
              prendas, las etiquetas de talla y las personalizaciones. Ayuda a resolver más rápido
              cualquier novedad de faltantes, daños o productos incorrectos.
            </p>
            <p>
              No tener el video no elimina tus derechos legales — la reclamación también puede
              analizarse con fotos, conversaciones, comprobantes, etiquetas y demás información del
              pedido.
            </p>
          </AccordionItem>

          <AccordionItem title="Pedido no recibido">
            <p className="mb-2">
              Si el producto no llega dentro del plazo máximo informado, puedes pedir información y
              seguimiento, mantener activo el pedido si prefieres esperar, o terminar la compra y
              pedir la devolución total cuando corresponda legalmente — sin necesidad de esperar 60
              días hábiles si el plazo de entrega informado ya venció.
            </p>
            <p>
              Como beneficio comercial adicional: si pasan{" "}
              <strong className="text-white">60 días hábiles</strong> sin entrega y decidiste
              mantener el pedido activo durante ese período, además de la devolución total del
              dinero te reenviamos la prenda sin costo adicional. Este beneficio no reemplaza ni
              retrasa tu derecho a terminar la compra y pedir la devolución desde el momento en que
              se incumpla el plazo inicial.
            </p>
          </AccordionItem>

          <AccordionItem title="Procedimiento para presentar una solicitud">
            <p className="mb-2">
              Puedes presentar una reclamación, cambio, retracto o garantía por WhatsApp:{" "}
              <a href={whatsAppLink("Hola La 12 Store, quiero presentar una solicitud sobre mi pedido")} target="_blank" rel="noopener noreferrer" className="text-[#A47C42] hover:underline">
                {WHATSAPP_DISPLAY}
              </a>
              .
            </p>
            <p className="mb-2">Según corresponda, indícanos: código del pedido, nombre, número de contacto, producto involucrado, descripción de la situación, solución solicitada, fotos de la prenda, foto de la etiqueta de talla, video de apertura si existe, foto del empaque y comprobante de pago. No te pediremos pruebas que no guarden relación con tu reclamo.</p>
            <p>
              Confirmamos la recepción de tu solicitud y respondemos dentro de los{" "}
              <strong className="text-white">15 días hábiles siguientes</strong>, con las razones de
              la decisión.
            </p>
          </AccordionItem>

          <AccordionItem title="Envío de productos para revisión">
            <p className="mb-2">
              Cuando haga falta recibir la prenda físicamente, te damos las instrucciones de
              devolución. Empácala adecuadamente para evitar daños en el transporte.
            </p>
            <p className="mb-1"><strong className="text-white">Nosotros asumimos el transporte</strong> cuando: enviamos una talla incorrecta, un producto distinto, hay una falla cubierta por garantía, la personalización se hizo mal, o la devolución se debe a un incumplimiento nuestro.</p>
            <p>
              <strong className="text-white">Tú asumes el transporte</strong> cuando: ejerces el
              retracto, pides voluntariamente un cambio de talla habiendo recibido la talla
              confirmada, o pides un cambio comercial sin defecto atribuible al producto o a
              nosotros. El envío gratis de la compra inicial no cubre automáticamente transportes
              posteriores.
            </p>
          </AccordionItem>

          <AccordionItem title="Devolución del dinero">
            <p className="mb-2">Solo pedimos los datos necesarios para devolver tu dinero, preferentemente al mismo medio de pago o al mecanismo que acordemos contigo.</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white">Retracto:</strong> máximo 15 días calendario desde que lo ejerces válidamente.</li>
              <li><strong className="text-white">Producto no disponible o entrega fuera de plazo:</strong> dentro del término legal, sin exceder 30 días calendario.</li>
              <li><strong className="text-white">Garantía legal:</strong> máximo 15 días hábiles desde que pones el producto a nuestra disposición y procede la devolución.</li>
            </ul>
            <p className="mt-2">No aplicamos descuentos injustificados sobre lo que legalmente debamos devolver.</p>
          </AccordionItem>

          <AccordionItem title="Reversión del pago">
            <p className="mb-2">Si compraste por comercio electrónico y tu medio de pago está cubierto por las normas de reversión, puedes solicitarla en casos de fraude, operación no solicitada, producto no recibido, defectuoso o diferente del solicitado.</p>
            <p>
              Dentro de los 5 días hábiles siguientes a conocer el hecho, presenta la reclamación
              ante La 12 Store y notifica al emisor de tu medio de pago, según el procedimiento
              legal aplicable. La procedencia depende del medio de pago y las entidades
              participantes.
            </p>
          </AccordionItem>

          <AccordionItem title="Trato durante las reclamaciones">
            <p>
              Te atendemos de forma respetuosa, clara y orientada a resolver tu solicitud, y te
              pedimos lo mismo. Una discusión o el tono usado no te hace perder automáticamente tu
              garantía ni tus derechos legales. Amenazas, suplantaciones o fraude pueden
              documentarse y gestionarse por las vías legales correspondientes.
            </p>
          </AccordionItem>

          <AccordionItem title="Prendas usadas, lavadas o alteradas">
            <p className="mb-2">
              Para retracto o cambio voluntario, la prenda debe devolverse sin uso, lavado, olores,
              manchas ni alteraciones, con etiquetas y empaques.
            </p>
            <p>
              Para garantía legal no rechazamos automáticamente por haberse usado la prenda —
              muchos defectos solo se notan tras el uso o lavado. Evaluamos si la falla es un
              defecto de calidad o fue causada por uso inadecuado o intervención no autorizada.
            </p>
          </AccordionItem>

          <AccordionItem title="Aceptación de la política">
            <p>
              Antes de acceder a los datos de pago del checkout, debes marcar una casilla
              confirmando que leíste y aceptas los términos de compra, la política de envío y esta
              política de cambios, devoluciones, garantía y retracto — y que entiendes que tu
              transferencia queda pendiente de verificación hasta la confirmación expresa de La 12
              Store. Esta aceptación no implica renuncia a tus derechos legales como consumidor.
            </p>
          </AccordionItem>

          <AccordionItem title="Autoridad de protección al consumidor">
            <p>
              Si consideras que tu reclamación no fue resuelta satisfactoriamente, después de
              presentar tu reclamación directa ante La 12 Store puedes acudir a los mecanismos de
              protección de la Superintendencia de Industria y Comercio.
            </p>
          </AccordionItem>
        </Accordion>

        <a
          href={whatsAppLink("Hola La 12 Store, quiero solicitar un cambio de mi pedido")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest text-sm transition-all mt-8"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Solicitar cambio por WhatsApp
        </a>

        <p className="text-[#666666] text-xs mt-6">
          ¿Dudas adicionales? Revisa también nuestros{" "}
          <Link href="/terminos" className="text-[#A47C42] hover:underline">
            términos de uso
          </Link>{" "}
          o escríbenos directamente.
        </p>
      </div>
    </div>
  );
}
