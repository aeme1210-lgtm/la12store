import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { whatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Conoce la historia de La 12 Store, fundada por Andrés Méndez y Silvana Ossa desde Santa Marta, Colombia.",
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen pt-24 md:pt-28">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* 2-column: story text left, photo right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Left: story */}
          <div className="bg-[#141414] rounded-2xl border border-[#B8860B]/10 p-8 flex flex-col justify-center">
            <p
              className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Nuestra historia
            </p>
            <h1
              className="text-3xl md:text-5xl font-black text-white uppercase leading-tight mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Sobre Nosotros
            </h1>
            <div className="space-y-4 text-[#A0A0A0] leading-relaxed">
              <p>
                La 12 Store nació en Santa Marta, Colombia, de la unión de dos personas apasionadas por el fútbol y la moda:{" "}
                <span className="text-[#D4A017] font-semibold">Andrés Méndez</span> y{" "}
                <span className="text-[#D4A017] font-semibold">Silvana Ossa</span>. Juntos fundaron una tienda con el propósito de ofrecer camisetas de fútbol de la más alta calidad a los aficionados del deporte más popular del mundo.
              </p>
              <p>
                Andrés lidera las operaciones, los pedidos y la logística — asegurándose de que cada envío llegue en perfectas condiciones. Silvana es la cara visual de la marca: modelo principal de las sesiones fotográficas y embajadora de La 12 Store, dándole vida a cada prenda con su estilo único.
              </p>
              <p>
                Lo que empezó como un pequeño proyecto entre los dos se fue convirtiendo en una
                tienda reconocida en la región Caribe colombiana, con clientes que vuelven pedido
                tras pedido.
              </p>
              <p>
                En La 12 Store no vendemos simplemente camisetas — vendemos la experiencia de
                sentirte parte de tu equipo favorito. Cada prenda pasa por control de calidad antes
                de salir, con{" "}
                <span className="text-[#D4A017] font-semibold">telas técnicas de alto rendimiento</span>{" "}
                y acabados profesionales.
              </p>
            </div>
          </div>

          {/* Right: photo */}
          <div className="relative min-h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/PAREJA%20QUIENES%20SOMOS.jpeg"
              alt="Andrés y Silvana — La 12 Store"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Founders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[
            {
              name: "Andrés Méndez",
              role: "Fundador · Operaciones & Logística",
              bio: "Encargado de las operaciones, pedidos y logística de La 12 Store. Garantiza que cada pedido llegue a tiempo y en perfectas condiciones, desde Santa Marta hasta cualquier rincón del mundo.",
            },
            {
              name: "Silvana Ossa",
              role: "Cofundadora · Imagen & Embajadora",
              bio: "La cara visual de la marca. Modelo principal de las sesiones fotográficas y embajadora oficial de La 12 Store, dándole vida y estilo a cada camiseta con su personalidad única.",
            },
          ].map((person) => (
            <div
              key={person.name}
              className="bg-[#141414] rounded-2xl border border-[#B8860B]/10 p-6 hover:border-[#D4A017]/30 transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-center justify-center mx-auto mb-4">
                <span
                  className="text-[#D4A017] text-2xl font-black"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {person.name[0]}
                </span>
              </div>
              <h3
                className="text-white text-lg font-black uppercase mb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {person.name}
              </h3>
              <p
                className="text-[#D4A017] text-xs uppercase tracking-wider mb-3"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {person.role}
              </p>
              <p className="text-[#A0A0A0] text-sm leading-relaxed">{person.bio}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="bg-[#141414] rounded-2xl border border-[#B8860B]/10 p-8 mb-10">
          <h2
            className="text-2xl font-black text-white uppercase mb-6"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Calidad premium",
                desc: "Cada camiseta está hecha con telas técnicas de alto rendimiento y acabados profesionales que garantizan durabilidad y comodidad.",
              },
              {
                title: "Atención personalizada",
                desc: "Te acompañamos en todo el proceso, desde elegir la talla hasta coordinar el envío. Siempre disponibles por WhatsApp.",
              },
              {
                title: "Pasión por el fútbol",
                desc: "Somos aficionados al fútbol al igual que tú. Eso nos hace entender exactamente lo que buscas en una camiseta.",
              },
            ].map((v) => (
              <div key={v.title}>
                <h3
                  className="text-[#D4A017] font-bold uppercase tracking-wide text-sm mb-2"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {v.title}
                </h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[#A0A0A0] mb-6">
            ¿Listo para encontrar tu camiseta ideal?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ver Catálogo
            </Link>
            <a
              href={whatsAppLink("Hola Andrés, quiero más información sobre La 12 Store")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-8 py-4 rounded-lg uppercase tracking-widest transition-all text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Escríbenos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
