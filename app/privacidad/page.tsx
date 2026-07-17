import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo La 12 Store trata los datos personales de sus clientes.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <p
          className="text-[#A47C42] text-xs tracking-widest uppercase mb-2"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Tus datos
        </p>
        <h1
          className="text-3xl md:text-4xl font-black text-white uppercase mb-8"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Política de Privacidad
        </h1>

        <div className="space-y-5 text-[#A0A0A0] text-sm leading-relaxed">
          <p>
            Cuando haces un pedido en La 12 Store, recolectamos únicamente los datos necesarios
            para procesarlo y entregarlo: nombre, teléfono, dirección de envío y, si lo indicas,
            correo electrónico. Estos datos se usan para coordinar tu pedido por WhatsApp y no se
            venden ni comparten con terceros para fines publicitarios.
          </p>
          <p>
            Si nos escribes por WhatsApp, esa conversación queda en nuestro historial de chat como
            cualquier conversación normal de esa plataforma.
          </p>
          <p>
            Puedes solicitar en cualquier momento que eliminemos tus datos de contacto de nuestros
            registros escribiéndonos directamente.
          </p>
          <div className="bg-[#141414] border border-[#8A6435]/20 rounded-xl p-4 text-xs text-[#666]">
            <p className="text-[#A47C42] font-semibold mb-1">Nota</p>
            <p>
              Este texto describe el tratamiento real de datos hoy. Pendiente de revisión legal
              formal por el propietario del negocio para una política de tratamiento de datos
              completa conforme a la Ley 1581 de 2012 (Colombia).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
