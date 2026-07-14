"use client";

import { MessageCircle, Mail } from "lucide-react";
import { whatsAppLink } from "@/lib/whatsapp";

function InstagramIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TikTokIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.23 8.23 0 004.83 1.55V7.16a4.85 4.85 0 01-1.06-.47z"/>
    </svg>
  );
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <p className="text-[#D4A017] text-xs tracking-widest uppercase mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
            Estamos para ti
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-4" style={{ fontFamily: "var(--font-oswald)" }}>
            Contacto
          </h1>
          <div className="w-16 h-0.5 bg-[#D4A017] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact methods */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase mb-4" style={{ fontFamily: "var(--font-oswald)" }}>
              Canales de atención
            </h2>

            <a
              href={whatsAppLink("Hola La 12 Store, quiero información")}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border bg-[#25D366]/10 border-[#25D366]/20 hover:border-[#25D366]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/20">
                <MessageCircle size={20} className="text-[#25D366]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-oswald)" }}>WhatsApp</p>
                <p className="text-[#25D366] text-sm">+57 300 844 3885</p>
              </div>
            </a>

            <a
              href="https://instagram.com/la12s_tore"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border bg-[#E1306C]/10 border-[#E1306C]/20 hover:border-[#E1306C]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/20">
                <InstagramIcon size={20} className="text-[#E1306C]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-oswald)" }}>Instagram</p>
                <p className="text-[#E1306C] text-sm">@la12s_tore</p>
              </div>
            </a>

            <a
              href="https://tiktok.com/@la12s_tore"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border bg-white/5 border-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/20">
                <TikTokIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-oswald)" }}>TikTok</p>
                <p className="text-[#A0A0A0] text-sm">@la12s_tore</p>
              </div>
            </a>

            <a
              href="mailto:la12store.sm@gmail.com"
              className="flex items-center gap-4 p-4 rounded-xl border bg-[#D4A017]/10 border-[#D4A017]/20 hover:border-[#D4A017]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/20">
                <Mail size={20} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-oswald)" }}>Email</p>
                <p className="text-[#D4A017] text-sm">la12store.sm@gmail.com</p>
              </div>
            </a>

            {/* Payments */}
            <div className="bg-[#141414] rounded-xl border border-[#B8860B]/10 p-4 mt-2">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3" style={{ fontFamily: "var(--font-oswald)" }}>
                Métodos de pago
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { method: "Nequi", number: "300 844 3885" },
                  { method: "Daviplata", number: "300 844 3885" },
                  { method: "Bancolombia (Cta. Ahorros)", number: "91622993231 · Silvana Ossa" },
                  { method: "Nubank (Llave)", number: "@AME429" },
                ].map((p) => (
                  <div key={p.method} className="flex justify-between">
                    <span className="text-[#D4A017] font-semibold">{p.method}</span>
                    <span className="text-white" style={{ fontFamily: "var(--font-jetbrains)" }}>{p.number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick message form */}
          <div>
            <h2 className="text-lg font-bold text-white uppercase mb-4" style={{ fontFamily: "var(--font-oswald)" }}>
              Envíanos un mensaje
            </h2>
            <form
              className="space-y-4 bg-[#141414] rounded-xl border border-[#B8860B]/10 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.target as HTMLFormElement);
                const nombre = data.get("nombre");
                const mensaje = data.get("mensaje");
                const url = whatsAppLink(`Hola La 12 Store! Soy ${nombre}.\n\n${mensaje}`);
                window.open(url, "_blank");
              }}
            >
              <div>
                <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                  Tu nombre
                </label>
                <input
                  name="nombre" type="text" required
                  className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                  Mensaje
                </label>
                <textarea
                  name="mensaje" required rows={5}
                  className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#D4A017]/50 resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-all"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <MessageCircle size={16} />
                Enviar por WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
