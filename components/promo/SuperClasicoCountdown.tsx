"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function computeTimeLeft(targetMs: number): TimeLeft {
  const total = targetMs - Date.now();
  if (total <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / (1000 * 60 * 60));
  return { hours, minutes, seconds, total };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface Props {
  targetTime: string; // ISO string — serializable from server to client
  mode: "start" | "end";
}

export function SuperClasicoCountdown({ targetTime, mode }: Props) {
  // null = not yet mounted (avoids hydration mismatch)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const targetMs = new Date(targetTime).getTime();
    setTimeLeft(computeTimeLeft(targetMs));
    const interval = setInterval(() => setTimeLeft(computeTimeLeft(targetMs)), 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  // Skeleton while hydrating
  if (!timeLeft) {
    return (
      <div className="rounded-2xl overflow-hidden flex h-24 md:h-32">
        <div className="flex-1 bg-[#D32F2F]/40 animate-pulse" />
        <div className="w-6 bg-[#5B1060]/40 animate-pulse" />
        <div className="flex-1 bg-[#1A237E]/40 animate-pulse" />
        <div className="w-6 bg-[#003087]/40 animate-pulse" />
        <div className="flex-1 bg-[#003087]/40 animate-pulse" />
      </div>
    );
  }

  const isExpired = timeLeft.total <= 0;
  const isUrgent = !isExpired && timeLeft.hours === 0;

  if (isExpired) {
    return (
      <div className="rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center h-24 md:h-32">
        <p
          className="text-white text-lg font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {mode === "end" ? "¡Promo finalizada!" : "¡Comienza ahora!"}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden flex ${isUrgent ? "animate-pulse" : ""}`}>
      {/* ── Horas — River Plate (rojo, texto blanco) ── */}
      <div className="bg-[#D32F2F] flex-1 flex flex-col items-center justify-center py-5 md:py-7 px-2 md:px-4">
        <span
          className="text-white font-black text-4xl md:text-6xl tabular-nums leading-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {pad(timeLeft.hours)}
        </span>
        <span className="text-white/60 text-[9px] uppercase tracking-widest mt-1.5">
          Horas
        </span>
      </div>

      {/* Separador HH:MM */}
      <div className="bg-gradient-to-b from-[#D32F2F] to-[#6A0080] flex items-center justify-center px-2 md:px-3">
        <span
          className="text-white font-black text-3xl md:text-5xl select-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          :
        </span>
      </div>

      {/* ── Minutos — gradiente central ── */}
      <div className="bg-gradient-to-r from-[#6A0080] via-[#1A237E] to-[#003087] flex-1 flex flex-col items-center justify-center py-5 md:py-7 px-2 md:px-4">
        <span
          className="text-white font-black text-4xl md:text-6xl tabular-nums leading-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {pad(timeLeft.minutes)}
        </span>
        <span className="text-white/60 text-[9px] uppercase tracking-widest mt-1.5">
          Min
        </span>
      </div>

      {/* Separador MM:SS */}
      <div className="bg-[#003087] flex items-center justify-center px-2 md:px-3">
        <span
          className="text-[#FFD700] font-black text-3xl md:text-5xl select-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          :
        </span>
      </div>

      {/* ── Segundos — Boca Juniors (azul, texto amarillo) ── */}
      <div className="bg-[#003087] flex-1 flex flex-col items-center justify-center py-5 md:py-7 px-2 md:px-4">
        <span
          className="text-[#FFD700] font-black text-4xl md:text-6xl tabular-nums leading-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {pad(timeLeft.seconds)}
        </span>
        <span className="text-[#FFD700]/60 text-[9px] uppercase tracking-widest mt-1.5">
          Seg
        </span>
      </div>
    </div>
  );
}
