import type { Metadata } from "next";
import { whatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Política de Cambios",
  description: "Política de cambios y devoluciones de La 12 Store.",
};

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
          className="text-3xl md:text-4xl font-black text-white uppercase mb-8"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Política de Cambios
        </h1>

        <div className="space-y-5 text-[#A0A0A0] text-sm leading-relaxed">
          <p>
            Aceptamos cambios en caso de <strong className="text-white">talla incorrecta</strong> o{" "}
            <strong className="text-white">defecto de fábrica</strong>. Debes contactarnos dentro de
            los <strong className="text-white">3 días</strong> siguientes a recibir tu pedido.
          </p>
          <p>
            Para iniciar un cambio, escríbenos por WhatsApp con fotos del producto y tu número de
            pedido — resolvemos cada caso directamente, sin formularios.
          </p>
          <p>
            Las prendas personalizadas con dorsal y número solo se cambian por defecto de fábrica,
            no por error en los datos ingresados por el cliente al momento del pedido.
          </p>
        </div>

        <a
          href={whatsAppLink("Hola La 12 Store, quiero solicitar un cambio de mi pedido")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest text-sm transition-all mt-8"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Solicitar cambio por WhatsApp
        </a>
      </div>
    </div>
  );
}
