"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error de autenticación");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-black text-[#A47C42] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            LA 12 STORE
          </h1>
          <p className="text-[#666666] text-sm mt-1">Panel Administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#141414] rounded-2xl border border-[#8A6435]/20 p-6 space-y-4"
        >
          <div>
            <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-inter)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#8A6435]/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#A47C42]/50"
            />
          </div>
          <div>
            <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-inter)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#8A6435]/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#A47C42]/50"
            />
          </div>

          {error && (
            <p className="text-[#C70101] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A47C42] hover:bg-[#C4A06A] disabled:opacity-50 text-black font-bold py-3 rounded-lg uppercase tracking-widest text-sm transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
