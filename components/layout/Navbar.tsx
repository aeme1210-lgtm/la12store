"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingCart, Menu, X, MessageCircle, Search } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { isSuperClasicoActive } from "@/lib/promo-super-clasico";
import { whatsAppLink } from "@/lib/whatsapp";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isPromoActive, setIsPromoActive] = useState(false);
  const [isBarcaPromoActive, setIsBarcaPromoActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalItems = useCart((s) => s.totalItems);

  // Set promo state client-side only to avoid hydration mismatch
  useEffect(() => {
    setIsPromoActive(isSuperClasicoActive());
    // Barça promo — consultar endpoint liviano (DB-driven)
    fetch("/api/promo-barca-status")
      .then((r) => r.json())
      .then((d) => setIsBarcaPromoActive(d.active === true))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    if (searchInputRef.current) searchInputRef.current.value = "";
  }, [pathname]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const value = searchInputRef.current?.value.trim() ?? "";
    if (value) {
      router.push(`/catalogo?q=${encodeURIComponent(value)}`);
      setSearchOpen(false);
    }
  }, [router]);

  const handleInputChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const value = searchInputRef.current?.value.trim() ?? "";
      if (value.length >= 2) {
        router.push(`/catalogo?q=${encodeURIComponent(value)}`);
        setSearchOpen(false);
      }
    }, 300);
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) {
      // Mover el foco al menú al abrir; restaurarlo al botón al cerrar.
      mobileMenuRef.current?.focus();
    } else {
      mobileToggleRef.current?.focus();
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Cerrar con Escape (menú móvil y buscador) — antes no existía ningún
  // manejo de teclado para estos overlays.
  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, searchOpen]);

  // Trap de Tab dentro del menú móvil mientras está abierto.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !mobileMenuRef.current) return;
      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
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
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-[9999] transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-black/90 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
        style={{ top: "var(--urgency-h, 0px)" }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span
                className="text-base sm:text-xl md:text-2xl font-black tracking-wider text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                LA 12 <span className="text-[#D4AF37]">STORE</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7">
              {isPromoActive && (
                <Link
                  href="/super-clasico"
                  className="text-sm font-black tracking-wider uppercase transition-colors duration-200 animate-pulse"
                  style={{
                    fontFamily: "var(--font-inter)",
                    background: "linear-gradient(90deg, #D32F2F, #D4AF37)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  🔥 SUPER CLÁSICO -15%
                </Link>
              )}
              {isBarcaPromoActive && (
                <Link
                  href="/campeones-barca"
                  className="text-sm font-black tracking-wider uppercase transition-colors duration-200 animate-pulse"
                  style={{
                    fontFamily: "var(--font-inter)",
                    background: "linear-gradient(90deg, #A50044, #FFD700, #004D98)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  🏆 BARÇA CAMPEÓN -20%
                </Link>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-[#D4AF37]"
                      : "text-[#A0A0A0] hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={whatsAppLink("Hola La 12 Store!")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </div>

            {/* Buscador persistente — protagonista en pantallas grandes en vez de
                estar escondido detrás de un ícono (hallazgo de la auditoría). */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center flex-1 max-w-xs mx-4"
            >
              <label htmlFor="navbar-search-desktop" className="sr-only">
                Buscar camiseta, equipo, selección
              </label>
              <div className="relative w-full">
                <Search
                  size={15}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
                />
                <input
                  id="navbar-search-desktop"
                  ref={desktopSearchRef}
                  type="text"
                  onChange={handleInputChange}
                  placeholder="Buscar equipo, selección..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-3 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/10 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </div>
            </form>

            {/* Cart + search + hamburger */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); }}
                className="lg:hidden p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
                aria-label="Buscar"
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              <Link
                href="/carrito"
                className="relative p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
              >
                <ShoppingCart size={22} />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>
              <button
                ref={mobileToggleRef}
                onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }}
                className="md:hidden p-2 text-[#A0A0A0] hover:text-white transition-colors"
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Search dropdown */}
      {searchOpen && (
        <div
          className="fixed left-0 right-0 z-[9998] bg-black/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 py-3"
          style={{ top: "calc(var(--urgency-h, 0px) + 56px)" }}
        >
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input
              autoFocus
              ref={searchInputRef}
              type="text"
              defaultValue=""
              onChange={handleInputChange}
              placeholder="Buscar camiseta, equipo, selección..."
              className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            />
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-[#F0D060] text-black px-4 rounded-lg font-bold transition-colors"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu — full screen overlay */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          tabIndex={-1}
          className="fixed inset-0 z-[9998] md:hidden bg-black/95 backdrop-blur-md flex flex-col outline-none"
        >
          {/* Close button */}
          <div className="flex items-center justify-between px-4 h-14" style={{ paddingTop: "var(--urgency-h, 0px)" }}>
            <span
              className="text-base font-black tracking-wider text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              LA 12 <span className="text-[#D4AF37]">STORE</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-white"
              aria-label="Cerrar menú"
            >
              <X size={28} />
            </button>
          </div>

          {/* Nav links centered */}
          <nav className="flex flex-col items-center justify-center flex-1 gap-2 pb-16">
            {isPromoActive && (
              <Link
                href="/super-clasico"
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-black uppercase tracking-wider py-4 px-8 w-full text-center transition-colors animate-pulse"
                style={{
                  fontFamily: "var(--font-inter)",
                  background: "linear-gradient(90deg, #D32F2F, #D4AF37)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                🔥 SUPER CLÁSICO -15%
              </Link>
            )}
            {isBarcaPromoActive && (
              <Link
                href="/campeones-barca"
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-black uppercase tracking-wider py-4 px-8 w-full text-center transition-colors animate-pulse"
                style={{
                  fontFamily: "var(--font-inter)",
                  background: "linear-gradient(90deg, #A50044, #FFD700, #004D98)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                🏆 BARÇA CAMPEÓN -20%
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-bold uppercase tracking-wider py-4 px-8 w-full text-center transition-colors ${
                  pathname === link.href ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"
                }`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={whatsAppLink("Hola La 12 Store!")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 bg-[#25D366] text-white py-4 px-12 rounded-xl font-bold uppercase tracking-wider flex items-center gap-3 text-lg"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
