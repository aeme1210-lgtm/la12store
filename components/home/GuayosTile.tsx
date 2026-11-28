"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

/**
 * Sección "Guayos" del aniversario (ver lib/launches.ts).
 *
 * - Portada: en vez de una sola foto, rota entre TODOS los guayos (fundido
 *   cada 2,5 s). Con candado, las fotos se ven desenfocadas de fondo.
 * - Cerrada: candado + "Aniversario La 12 Store" + cuenta regresiva. Al
 *   llegar a cero se refresca sola y queda abierta.
 * - Abierta: toda la tarjeta lleva a /guayos (catálogo completo).
 */
export function GuayosTile({
  images,
  total,
  unlockAt,
  initiallyUnlocked,
}: {
  images: string[];
  total: number;
  unlockAt: string;
  initiallyUnlocked: boolean;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);

  // Rotación de portada.
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2500);
    return () => clearInterval(t);
  }, [images.length]);

  // Apertura automática al llegar la hora.
  useEffect(() => {
    if (unlocked) return;
    const ms = new Date(unlockAt).getTime() - Date.now();
    if (ms <= 0) {
      setUnlocked(true);
      router.refresh();
      return;
    }
    const t = setTimeout(() => {
      setUnlocked(true);
      router.refresh();
    }, Math.min(ms + 500, 2_147_000_000));
    return () => clearTimeout(t);
  }, [unlocked, unlockAt, router]);

  const cover = (
    <div className="absolute inset-0">
      {images.length > 0 ? (
        images.map((src, i) => {
          // Solo se montan la anterior (para el fundido), la actual y la
          // siguiente (precarga): 3 fotos en vez de 40 → portada liviana en móvil.
          const n = images.length;
          if (i !== idx && i !== (idx + 1) % n && i !== (idx - 1 + n) % n) return null;
          return (
          <Image
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            priority={i === 0}
            className={`object-cover transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"} ${
              unlocked ? "" : "blur-md scale-110"
            }`}
          />
          );
        })
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3a2c18_0%,_#0B0B0A_70%)]" />
      )}
      <div className={`absolute inset-0 ${unlocked ? "bg-gradient-to-t from-black/85 via-black/30 to-black/10" : "bg-black/65"}`} />
    </div>
  );

  if (!unlocked) {
    return (
      <div
        className="relative overflow-hidden rounded-xl min-h-[340px] md:min-h-[420px] flex items-center justify-center text-center px-5 select-none"
        aria-label="Sección bloqueada: Aniversario La 12 Store"
      >
        {cover}
        <div className="relative z-10 flex flex-col items-center">
          <span className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#C4A06A]/60 bg-black/40 flex items-center justify-center mb-5">
            <Lock className="w-7 h-7 md:w-9 md:h-9 text-[#C4A06A]" aria-hidden="true" />
          </span>
          <p
            className="text-[#C4A06A] text-[10px] md:text-xs tracking-[0.45em] uppercase mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Aniversario La 12 Store
          </p>
          <h2 className="font-display text-white text-3xl md:text-5xl uppercase mb-4">Algo se viene</h2>
          <Countdown unlockAt={unlockAt} />
          <p className="text-white/55 text-xs md:text-sm mt-4" style={{ fontFamily: "var(--font-inter)" }}>
            Se abre el domingo 29 de noviembre a las 3:00 p. m.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/guayos"
      className="group relative block overflow-hidden rounded-xl min-h-[340px] md:min-h-[420px]"
    >
      {cover}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
        <p
          className="text-[#C4A06A] text-[10px] md:text-xs tracking-[0.45em] uppercase mb-3"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Aniversario La 12 Store
        </p>
        <h2 className="font-display text-white text-4xl md:text-6xl uppercase leading-none mb-4">Guayos</h2>
        <span
          className="inline-flex items-center gap-2 text-white/80 group-hover:text-white text-xs md:text-sm uppercase tracking-[0.2em] transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {total > 0 ? `Ver los ${total} guayos →` : "Ver catálogo →"}
        </span>
      </div>
    </Link>
  );
}

export function Countdown({ unlockAt }: { unlockAt: string }) {
  const target = new Date(unlockAt).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  // Antes de hidratar no se muestra un valor (evita desajuste servidor/cliente).
  const left = now === null ? null : Math.max(0, target - now);
  const parts =
    left === null
      ? ["--", "--", "--"]
      : [Math.floor(left / 3_600_000), Math.floor((left % 3_600_000) / 60_000), Math.floor((left % 60_000) / 1000)].map(
          (n) => String(n).padStart(2, "0")
        );
  return (
    <div className="flex items-center gap-2 md:gap-3" role="timer" aria-live="off">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center gap-2 md:gap-3">
          <div className="min-w-[56px] md:min-w-[72px] rounded-lg bg-black/50 border border-white/10 px-2 py-2">
            <span className="block text-white text-2xl md:text-4xl font-bold tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>
              {p}
            </span>
            <span className="block text-white/45 text-[9px] uppercase tracking-[0.2em]">{["horas", "min", "seg"][i]}</span>
          </div>
          {i < 2 && <span className="text-white/40 text-2xl">:</span>}
        </div>
      ))}
    </div>
  );
}
