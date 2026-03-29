"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573008443885?text=Hola%20La%2012%20Store%2C%20quiero%20más%20información%20sobre%20las%20camisetas%20%F0%9F%91%9A"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20ba5a] transition-all duration-300 hover:scale-105 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={22} className="flex-shrink-0" />
      <span className="text-sm font-semibold hidden sm:block" style={{ fontFamily: "var(--font-oswald)" }}>
        WhatsApp
      </span>
    </a>
  );
}
