"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-[#0A0A0A] shadow-lg shadow-black/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl md:text-3xl font-black tracking-widest text-[#D4A017] uppercase"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              LA 12
            </span>
            <span
              className="text-2xl md:text-3xl font-black tracking-widest text-white uppercase"
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

          {/* Cart + Mobile */}
          <div className="flex items-center gap-4">
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
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#141414] border-t border-[#B8860B]/20">
          <div className="px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-semibold uppercase tracking-wider transition-colors ${
                  pathname === link.href ? "text-[#D4A017]" : "text-[#A0A0A0]"
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
              className="mt-2 bg-[#25D366] text-white text-center py-3 rounded-lg font-semibold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
