"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ShoppingBag, Package, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const NavContent = () => (
    <>
      <div className="px-4 py-6 border-b border-[#B8860B]/10">
        <h1
          className="text-lg font-black text-[#D4A017] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          LA 12 STORE
        </h1>
        <p className="text-[#666666] text-xs mt-0.5">Panel Admin</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? "bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/20"
                  : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
              }`}
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#B8860B]/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#C70101] text-sm transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#141414] border-r border-[#B8860B]/10">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#141414] border-b border-[#B8860B]/10 flex items-center justify-between px-4 h-16">
        <h1
          className="text-lg font-black text-[#D4A017] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          LA 12 ADMIN
        </h1>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-2"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#141414] flex flex-col pt-16">
          <NavContent />
        </div>
      )}
    </>
  );
}
