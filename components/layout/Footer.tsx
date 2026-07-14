import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { SHIPPING } from "@/lib/shipping";
import { formatCOP } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#B8860B]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2
              className="text-2xl font-black tracking-widest text-[#D4A017] uppercase mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              LA 12 STORE
            </h2>
            <p className="text-[#A0A0A0] text-sm mb-4 max-w-xs">
              Lo mejor en camisetas de fútbol en Colombia. Calidad premium,
              acabados profesionales, envío a todo el país.
            </p>
            <p className="text-[#666666] text-xs">Santa Marta, Colombia</p>

            {/* Social */}
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://instagram.com/la12s_tore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A0A0A0] hover:text-[#D4A017] transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@la12s_tore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A0A0A0] hover:text-[#D4A017] transition-colors"
                aria-label="TikTok"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.23 8.23 0 004.83 1.55V7.16a4.85 4.85 0 01-1.06-.47z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A0A0A0] hover:text-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3
              className="text-white font-bold uppercase tracking-wider mb-4 text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Navegación
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/catalogo", label: "Catálogo" },
                { href: "/nosotros", label: "Sobre Nosotros" },
                { href: "/contacto", label: "Contacto" },
                { href: "/faq", label: "Preguntas Frecuentes" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] hover:text-[#D4A017] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h3
              className="text-white font-bold uppercase tracking-wider mb-4 text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Métodos de Pago
            </h3>
            <ul className="space-y-2 text-sm text-[#A0A0A0]">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                Nequi — 300 844 3885
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                Daviplata — 300 844 3885
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                Bancolombia — Cta. Ahorros
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                Nubank — @AME429
              </li>
            </ul>
            <p className="text-[#666666] text-xs mt-4">
              {SHIPPING.santaMarta.label}
              <br />
              {SHIPPING.nacional.label}: {formatCOP(SHIPPING.nacional.costMin)} - {formatCOP(SHIPPING.nacional.costMax)}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#B8860B]/10 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[#666666] text-xs">
            © 2026 La 12 Store — Santa Marta, Colombia
          </p>
          <p className="text-[#666666] text-xs">
            la12store.sm@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
