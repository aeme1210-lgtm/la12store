"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, MessageCircle, Search } from "lucide-react";
import { useCart } from "@/lib/cart-store";

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
  const [searchValue, setSearchValue] = useState("");
  const totalItems = useCart((s) => s.totalItems);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchValue("");
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchValue.trim())}`);
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-[9999] transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-black/80 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
        style={{ top: "var(--urgency-h, 0px)" }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-10 md:h-12 w-auto object-contain"
                style={{ mixBlendMode: "screen" }}
              >
                <source src="https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/LOGO%20LA%2012.mp4" type="video/mp4" />
              </video>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-[#D4AF37]"
                      : "text-[#A0A0A0] hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {link.label}
                </Link>
              ))}
              {/* WhatsApp always visible on desktop */}
              <a
                href="https://wa.me/573008443885?text=Hola%20La%2012%20Store!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide transition-colors"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </div>

            {/* Cart + search + hamburger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); }}
                className="p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
                aria-label="Buscar"
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              <Link
                href="/carrito"
                className="relative p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
              >
                <ShoppingCart size={22} />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>
              <button
                onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }}
                className="md:hidden p-2 text-[#A0A0A0] hover:text-white transition-colors"
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Search dropdown */}
      {searchOpen && (
        <div className="fixed top-16 md:top-20 left-0 right-0 z-[9998] bg-black/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 py-3">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[9998] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-[#0F0F0F] border-b border-[#D4AF37]/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-6 py-5 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-semibold uppercase tracking-wider py-3.5 border-b border-[#1A1A1A] last:border-0 transition-colors ${
                    pathname === link.href ? "text-[#D4AF37]" : "text-[#A0A0A0] hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/573008443885?text=Hola%20La%2012%20Store!"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-[#25D366] text-white text-center py-3 rounded-lg font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
