import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos de uso de la tienda online de La 12 Store.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p
          className="text-[#A47C42] text-xs tracking-widest uppercase mb-2"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Antes de comprar
        </p>
        <h1
          className="text-3xl md:text-4xl font-black text-white uppercase mb-8"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Términos de Uso
        </h1>

        <div className="space-y-5 text-[#A0A0A0] text-sm leading-relaxed">
          <p>
            La 12 Store es una tienda de camisetas de fútbol con sede en Santa Marta, Colombia. Los
            pedidos se coordinan por WhatsApp: el cliente selecciona sus productos en el catálogo,
            confirma talla y personalización, y completa el pago por los métodos indicados en el
            checkout antes de que el pedido se despache.
          </p>
          <p>
            Los precios mostrados están en pesos colombianos (COP) e incluyen personalización de
            dorsal y parches sin costo adicional. El envío es gratis en todas las camisetas de la
            web, a toda Colombia.
          </p>
          <p>
            Al hacer un pedido aceptas nuestra{" "}
            <a href="/cambios" className="text-[#A47C42] hover:underline">
              política de cambios
            </a>{" "}
            y el tratamiento de datos descrito en nuestra{" "}
            <a href="/privacidad" className="text-[#A47C42] hover:underline">
              política de privacidad
            </a>
            .
          </p>
          <div className="bg-[#141414] border border-[#8A6435]/20 rounded-xl p-4 text-xs text-[#666]">
            <p className="text-[#A47C42] font-semibold mb-1">Nota</p>
            <p>
              Este texto describe el funcionamiento real de la tienda hoy. Pendiente de revisión
              legal formal por el propietario del negocio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
