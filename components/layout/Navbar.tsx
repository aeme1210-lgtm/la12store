"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCart((s) => s.totalItems);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#B8860B]/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-[#D4A017] uppercase whitespace-nowrap"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                LA 12
              </span>
              <span
                className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white uppercase whitespace-nowrap"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                STORE
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-[#D4A017]"
                      : "text-[#A0A0A0] hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Cart + Mobile button */}
            <div className="flex items-center gap-3">
              <Link
                href="/carrito"
                className="relative p-2 text-[#A0A0A0] hover:text-[#D4A017] transition-colors"
              >
                <ShoppingCart size={22} />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4A017] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-[#A0A0A0] hover:text-white transition-colors"
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile overlay — fixed, full screen, behind header */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[9998] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Menu panel — slides from top */}
          <div
            className="absolute top-16 left-0 right-0 bg-[#141414] border-b border-[#B8860B]/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-6 py-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-semibold uppercase tracking-wider py-3 border-b border-[#1A1A1A] last:border-0 transition-colors ${
                    pathname === link.href
                      ? "text-[#D4A017]"
                      : "text-[#A0A0A0] hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/573008443885?text=Hola%20La%2012%20Store%2C%20quiero%20más%20información"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-[#25D366] text-white text-center py-3 rounded-lg font-semibold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                WhatsApp
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
