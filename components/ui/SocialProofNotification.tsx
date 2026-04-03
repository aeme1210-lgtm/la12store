"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";

const MESSAGES = [
  "🛒 Alguien de Bogotá compró una camiseta del Real Madrid hace 2 horas",
  "🔥 La camiseta de Colombia 2026 es la más pedida esta semana",
  "⚡ 12 personas están viendo camisetas ahora mismo",
  "🛒 Alguien de Medellín compró una camiseta del Barcelona hace 3 horas",
  "🔥 +500 clientes satisfechos en toda Colombia",
  "⚡ Última unidad de la camiseta Retro Argentina 1986",
  "🛒 Alguien de Cali compró una camiseta del Manchester United hace 1 hora",
  "🔥 Envío gratis internacional en todos los pedidos",
];

export function SocialProofNotification() {
  const [visible, setVisible] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [closed, setClosed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); };

  const cycle = useCallback(() => {
    setVisible(true);
    timer.current = setTimeout(() => {
      setVisible(false);
      timer.current = setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % MESSAGES.length;
        setMsgIdx(idxRef.current);
        cycle();
      }, 15000);
    }, 5000);
  }, []);

  useEffect(() => {
    const initial = setTimeout(cycle, 4000);
    return () => { clearTimeout(initial); clearTimer(); };
  }, [cycle]);

  if (closed) return null;

  return (
    <div
      className={`hidden md:flex fixed bottom-6 left-6 z-[9998] items-start gap-3 bg-[#111111] border border-[#D4AF37]/30 rounded-lg shadow-xl p-4 max-w-xs transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
      }`}
    >
      <p className="text-white text-xs leading-relaxed flex-1" style={{ fontFamily: "var(--font-inter)" }}>
        {MESSAGES[msgIdx]}
      </p>
      <button
        onClick={() => { setClosed(true); clearTimer(); }}
        className="text-[#666666] hover:text-white transition-colors flex-shrink-0 mt-0.5"
        aria-label="Cerrar"
      >
        <X size={12} />
      </button>
    </div>
  );
}
