import { Truck, Shirt, RefreshCw, ShieldCheck } from "lucide-react";

/**
 * Promesas verificables (redesign-v3). Sustituye el "✓ Dorsal y parches
 * gratis" que se repetía en cada tarjeta del catálogo. Solo afirmaciones que
 * respaldan las políticas publicadas (envío, dorsal, /cambios, pago manual).
 */
const ITEMS = [
  { Icon: Truck, title: "Envío gratis", desc: "A toda Colombia, sin mínimo" },
  { Icon: Shirt, title: "Dorsal y parches", desc: "Personalizados, siempre gratis" },
  { Icon: RefreshCw, title: "Cambio de talla", desc: "5 días hábiles al recibir" },
  { Icon: ShieldCheck, title: "Pago verificado", desc: "Nequi, Bre-B, Bancolombia" },
];

export function TrustBar() {
  return (
    <section className="border-y border-white/5 bg-[#0B0B0A]">
      <ul className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {ITEMS.map(({ Icon, title, desc }, i) => (
          <li
            key={title}
            className={`flex items-center gap-3 px-4 md:px-6 py-5 ${
              i % 2 === 1 ? "border-l border-white/5" : ""
            } ${i >= 2 ? "border-t md:border-t-0 border-white/5" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <Icon size={18} className="text-[#C4A06A] flex-shrink-0" aria-hidden="true" />
            <div style={{ fontFamily: "var(--font-inter)" }}>
              <p className="text-white text-xs md:text-sm font-semibold leading-tight">{title}</p>
              <p className="text-white/45 text-[11px] md:text-xs leading-tight mt-0.5">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
