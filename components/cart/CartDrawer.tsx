"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import { drawerTransition, drawerExitTransition } from "@/lib/motion";

/**
 * Carrito como drawer (REDESIGN_V2_BRIEF.md Fase 3) — antes /carrito era una
 * página completa; ahora es un panel deslizante accesible desde cualquier
 * parte del sitio sin perder el contexto de navegación. La página /carrito
 * se conserva para enlaces directos/compartidos, pero el ícono del header
 * abre este drawer.
 */
export function CartDrawer() {
  const { items, removeItem, updateQuantity, isDrawerOpen, closeDrawer } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (!isDrawerOpen) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input'
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
  }, [isDrawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={drawerTransition}
            className="fixed inset-0 bg-black/60 z-[10010]"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={isDrawerOpen ? drawerTransition : drawerExitTransition}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#181816] z-[10011] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>
                Tu carrito {totalItems > 0 && `(${totalItems})`}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={closeDrawer}
                aria-label="Cerrar carrito"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <ShoppingBag size={40} className="text-white/20 mb-4" />
                <p className="text-white/60 text-sm mb-6">Tu carrito está vacío</p>
                <Link
                  href="/catalogo"
                  onClick={closeDrawer}
                  className="text-[#D95632] hover:text-[#e06a48] text-sm font-semibold uppercase tracking-widest transition-colors"
                >
                  Ver catálogo →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#0B0B0A]">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold leading-tight truncate" style={{ fontFamily: "var(--font-inter)" }}>
                          {item.name}
                        </p>
                        <p className="text-white/50 text-[11px] mt-0.5">
                          {item.size} · {item.version}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label={`Disminuir cantidad de ${item.name}`}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span aria-live="polite" className="text-white text-xs w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <span className="text-[#C4A06A] text-xs font-bold" style={{ fontFamily: "var(--font-inter)" }}>
                            {formatCOP(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Quitar ${item.name} del carrito`}
                        className="text-white/30 hover:text-[#C70101] transition-colors self-start"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-5 flex-shrink-0">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-white/60 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)" }}>
                      Subtotal
                    </span>
                    <span aria-live="polite" className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-inter)" }}>
                      {formatCOP(total)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="block w-full text-center bg-[#D95632] hover:bg-[#c14a29] text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-sm transition-colors mb-2"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Finalizar compra
                  </Link>
                  <Link
                    href="/carrito"
                    onClick={closeDrawer}
                    className="block w-full text-center text-white/50 hover:text-white text-xs py-2 transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Ver carrito completo
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
