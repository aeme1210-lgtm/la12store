"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "la12-urgency-dismissed";

export function UrgencyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
      document.documentElement.style.setProperty("--urgency-h", "36px");
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    document.documentElement.style.setProperty("--urgency-h", "0px");
    setVisible(false);
    window.dispatchEvent(new CustomEvent("urgency-change"));
  };

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10002] h-9 flex items-center justify-center px-8"
      style={{ background: "linear-gradient(90deg, #D4AF37 0%, #B8960C 100%)" }}
    >
      <p
        className="text-black text-xs font-semibold text-center leading-none"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        🔥 MUNDIAL 2026 — Camisetas de selecciones disponibles · Envío gratis internacional
      </p>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
