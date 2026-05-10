"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiBlaugrana } from "./ConfettiBlaugrana";

interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function compute(endMs: number): TimeLeft {
  const total = Math.max(0, endMs - Date.now());
  if (total === 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days:    Math.floor(total / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const FLOATING_EMOJIS = ["🏆", "⚽", "🎉", "🏆", "⚽", "🎉"];

interface Props {
  endAt: string; // ISO string — serializable desde server
}

export function BarcaCountdown({ endAt }: Props) {
  const router = useRouter();
  const endMs = new Date(endAt).getTime();

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [expired, setExpired] = useState(false);

  const tick = useCallback(() => {
    const t = compute(endMs);
    setTimeLeft(t);
    if (t.total === 0) setExpired(true);
  }, [endMs]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Redirigir a /catalogo 5 s después de expirar
  useEffect(() => {
    if (!expired) return;
    const timer = setTimeout(() => router.push("/catalogo"), 5000);
    return () => clearTimeout(timer);
  }, [expired, router]);

  // Skeleton hidrata silenciosamente
  if (!timeLeft) {
    return (
      <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden h-48 animate-pulse"
           style={{ background: "linear-gradient(135deg, #A50044 0%, #A50044 45%, #004D98 55%, #004D98 100%)" }}
      />
    );
  }

  if (expired) {
    return (
      <div
        className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden flex flex-col items-center justify-center py-10 gap-4"
        style={{ background: "linear-gradient(135deg, #A50044 0%, #A50044 45%, #004D98 55%, #004D98 100%)" }}
      >
        <p className="text-white text-2xl font-black uppercase tracking-widest"
           style={{ fontFamily: "var(--font-oswald)" }}>
          La promo terminó
        </p>
        <p className="text-white/70 text-sm">Redirigiendo al catálogo en 5 segundos...</p>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Confeti de fondo */}
      <div className="absolute inset-0 z-0">
        <ConfettiBlaugrana />
      </div>

      {/* Tarjeta del cronómetro */}
      <motion.div
        className="relative z-10 rounded-3xl overflow-hidden px-6 py-8 flex flex-col items-center gap-5"
        style={{
          background: "linear-gradient(135deg, #A50044 0%, #A50044 45%, #004D98 55%, #004D98 100%)",
          boxShadow: isUrgent
            ? "0 0 0 3px #FFD700, 0 0 40px #FFD70060"
            : "0 0 0 2px #FFD70050, 0 8px 40px #00000060",
        }}
        animate={isUrgent ? { boxShadow: ["0 0 0 3px #FFD700, 0 0 40px #FFD70060", "0 0 0 6px #FFD700, 0 0 60px #FFD700AA", "0 0 0 3px #FFD700, 0 0 40px #FFD70060"] } : {}}
        transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
      >
        {/* Título pulsante */}
        <motion.p
          className="text-center font-black uppercase tracking-widest text-white text-base sm:text-lg md:text-xl"
          style={{ fontFamily: "var(--font-oswald)", textShadow: "0 2px 8px #00000080" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          🏆 BARÇA CAMPEÓN DE LA LIGA 🏆
        </motion.p>

        {/* Label superior */}
        <p className="text-white/70 text-[10px] uppercase tracking-[0.4em]"
           style={{ fontFamily: "var(--font-oswald)" }}>
          Termina en
        </p>

        {/* Dígitos */}
        <div className="flex items-start gap-2 sm:gap-4">
          {/* Días */}
          {timeLeft.days > 0 && (
            <>
              <DigitBlock label="DÍAS" value={pad(timeLeft.days)} />
              <Colon />
            </>
          )}
          <DigitBlock label="HRS" value={pad(timeLeft.hours)} />
          <Colon />
          <DigitBlock label="MIN" value={pad(timeLeft.minutes)} />
          <Colon />
          <AnimatePresence mode="popLayout">
            <DigitBlock key={timeLeft.seconds} label="SEG" value={pad(timeLeft.seconds)} animate />
          </AnimatePresence>
        </div>

        {/* Emojis flotantes */}
        <div className="relative h-8 w-full overflow-hidden">
          {FLOATING_EMOJIS.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-xl select-none"
              style={{ left: `${(i / FLOATING_EMOJIS.length) * 100}%` }}
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: -20, opacity: [0, 1, 0] }}
              transition={{
                duration: 2.5,
                delay: i * 0.7,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeOut",
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Colon() {
  return (
    <span
      className="text-[#FFD700] font-black text-3xl sm:text-4xl md:text-5xl leading-none mt-1"
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      :
    </span>
  );
}

function DigitBlock({
  label, value, animate: doAnimate,
}: {
  label: string;
  value: string;
  animate?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.span
        className="text-[#FFD700] font-black text-4xl sm:text-5xl md:text-6xl tabular-nums leading-none"
        style={{ fontFamily: "var(--font-oswald)", textShadow: "0 2px 12px #00000080" }}
        initial={doAnimate ? { opacity: 0, y: -4 } : false}
        animate={doAnimate ? { opacity: 1, y: 0 } : false}
        exit={doAnimate ? { opacity: 0, y: 4 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {value}
      </motion.span>
      <span
        className="text-white/50 text-[9px] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-oswald)" }}
      >
        {label}
      </span>
    </div>
  );
}
