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
      style={{ background: "linear-gradient(90deg, #A47C42 0%, #C4A06A 100%)" }}
    >
      <p
        className="text-black text-[10px] md:text-xs font-semibold text-center leading-none truncate max-w-[calc(100%-2rem)]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        🔥 <span className="hidden sm:inline">MUNDIAL 2026 — </span>Camisetas de selecciones · Dorsal y parches gratis
      </p>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors p-1"
        aria-label="Cerrar"
      >
        <X size={13} />
      </button>
    </div>
  );
}
