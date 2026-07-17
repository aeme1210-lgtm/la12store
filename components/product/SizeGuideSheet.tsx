"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { drawerTransition, drawerExitTransition } from "@/lib/motion";

/**
 * Guía de tallas como bottom sheet / modal — pulido final.
 *
 * Dos modos, según si `pendingSize` viene con valor:
 * - Consulta libre (botón "Ver guía de tallas"): solo muestra la imagen.
 * - Confirmación (al tocar una talla): además pide confirmar esa talla antes
 *   de guardarla — "Confirmar talla X" / "Volver a elegir". Cerrar de
 *   cualquier otra forma (backdrop, Escape, X) NUNCA guarda la talla; solo
 *   "Confirmar" lo hace. Antes, tocar una talla la guardaba de inmediato sin
 *   mostrar la guía — el brief pedía lo contrario.
 */
export function SizeGuideSheet({
  open,
  pendingSize,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pendingSize: string | null;
  onClose: () => void;
  onConfirm: (size: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={drawerTransition}
            className="fixed inset-0 bg-black/70 z-[10020]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Guía de tallas"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={open ? drawerTransition : drawerExitTransition}
            className="fixed inset-x-0 bottom-0 top-16 sm:top-auto sm:bottom-1/2 sm:translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[85vh] w-full max-w-full rounded-t-2xl sm:rounded-2xl bg-[#141414] border border-[#8A6435]/20 z-[10021] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-[#8A6435]/20 flex-shrink-0">
              <p
                className="text-white font-bold uppercase text-sm tracking-widest"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Guía de tallas
              </p>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Cerrar guía de tallas"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {pendingSize && (
                <p className="text-[#A0A0A0] text-sm mb-3">
                  Revisa las medidas antes de confirmar tu talla.
                </p>
              )}
              <div className="relative w-full rounded-lg overflow-hidden bg-white">
                <Image
                  src="/images/guia-tallas-oficial-la12store.png"
                  alt="Guía oficial de tallas La 12 Store: Aficionado (Fan), Jugador (Player) y Femenina (Mujer), con medidas de largo, ancho, altura y peso por talla"
                  width={1122}
                  height={1402}
                  className="w-full h-auto"
                  sizes="(max-width: 640px) 100vw, 500px"
                />
              </div>
            </div>

            {pendingSize && (
              <div className="flex-shrink-0 border-t border-[#8A6435]/20 p-4 space-y-3">
                <p className="text-white text-sm text-center">
                  Talla seleccionada: <span className="font-bold text-[#A47C42]">{pendingSize}</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-[#1A1A1A] border border-[#8A6435]/20 text-[#A0A0A0] font-bold py-3 rounded-xl uppercase tracking-wider text-xs hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Volver a elegir
                  </button>
                  <button
                    onClick={() => onConfirm(pendingSize)}
                    className="flex-[2] bg-[#A47C42] hover:bg-[#C4A06A] text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Confirmar talla {pendingSize}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
