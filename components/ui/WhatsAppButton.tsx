"use client";

import { MessageCircle } from "lucide-react";
import { whatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton() {
  return (
    <a
      href={whatsAppLink("Hola La 12 Store, quiero más información sobre las camisetas 👚")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20ba5a] transition-all duration-300 hover:scale-105 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={22} className="flex-shrink-0" />
      <span className="text-sm font-semibold hidden sm:block" style={{ fontFamily: "var(--font-inter)" }}>
        WhatsApp
      </span>
    </a>
  );
}
