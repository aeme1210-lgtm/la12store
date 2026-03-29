"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  team: string;
  league: string;
  season?: string | null;
  type: string;
  description?: string | null;
  priceFan?: number | null;
  pricePlayer?: number | null;
  priceRetro?: number | null;
  isRetro: boolean;
  hasPlayer: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  isActive: boolean;
}

interface Props {
  mode: "create" | "edit";
  product?: Product;
}

const typeOptions = ["Local", "Visitante", "Tercera", "Retro", "Edicion Especial"];
const leagueOptions = [
  "Selecciones",
  "Liga Española",
  "Premier League",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Ligas Sudamericanas",
];

export function AdminProductActions({ mode, product }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    team: product?.team ?? "",
    league: product?.league ?? "Selecciones",
    season: product?.season ?? "",
    type: product?.type ?? "Local",
    description: product?.description ?? "",
    priceFan: product?.priceFan ?? 150000,
    pricePlayer: product?.pricePlayer ?? 180000,
    priceRetro: product?.priceRetro ?? 170000,
    isRetro: product?.isRetro ?? false,
    hasPlayer: product?.hasPlayer ?? true,
    isFeatured: product?.isFeatured ?? false,
    isTrending: product?.isTrending ?? false,
    isNew: product?.isNew ?? true,
    isActive: product?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        await fetch("/api/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`/api/productos/${product!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar ${product?.name}?`)) return;
    await fetch(`/api/productos/${product!.id}`, { method: "DELETE" });
    router.refresh();
  };

  const CheckField = ({
    name,
    label,
  }: {
    name: keyof typeof form;
    label: string;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={form[name] as boolean}
        onChange={(e) => setForm({ ...form, [name]: e.target.checked })}
        className="accent-[#D4A017]"
      />
      <span className="text-[#A0A0A0] text-sm">{label}</span>
    </label>
  );

  return (
    <>
      <div className="flex items-center gap-2">
        {mode === "create" ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-[#D4A017] hover:bg-[#F0D060] text-black font-bold px-4 py-2 rounded-lg text-sm transition-all"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            <Plus size={16} />
            Nuevo Producto
          </button>
        ) : (
          <>
            <button
              onClick={() => setOpen(true)}
              className="p-1.5 text-[#A0A0A0] hover:text-[#D4A017] transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-[#A0A0A0] hover:text-[#C70101] transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#141414] rounded-2xl border border-[#B8860B]/20 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-black text-white uppercase"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {mode === "create" ? "Nuevo Producto" : "Editar Producto"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-[#666666] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Nombre del producto", type: "text", required: true },
                { name: "team", label: "Equipo", type: "text", required: true },
                { name: "season", label: "Temporada (ej: 25/26)", type: "text" },
                { name: "description", label: "Descripción", type: "textarea" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                    {f.label}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={form[f.name as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      rows={2}
                      className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A017]/50 resize-none"
                    />
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.name as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A017]/50"
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                    Liga
                  </label>
                  <select
                    value={form.league}
                    onChange={(e) => setForm({ ...form, league: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A017]/50"
                  >
                    {leagueOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A017]/50"
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "priceFan", label: "Precio Fan" },
                  { name: "pricePlayer", label: "Precio Player" },
                  { name: "priceRetro", label: "Precio Retro" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="text-[#A0A0A0] text-xs uppercase tracking-wider block mb-1" style={{ fontFamily: "var(--font-oswald)" }}>
                      {f.label}
                    </label>
                    <input
                      type="number"
                      value={form[f.name as keyof typeof form] as number}
                      onChange={(e) => setForm({ ...form, [f.name]: parseInt(e.target.value) })}
                      className="w-full bg-[#1A1A1A] border border-[#B8860B]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A017]/50"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CheckField name="isRetro" label="Es Retro" />
                <CheckField name="hasPlayer" label="Tiene versión Player" />
                <CheckField name="isFeatured" label="Destacado" />
                <CheckField name="isTrending" label="Tendencia" />
                <CheckField name="isNew" label="Nuevo" />
                <CheckField name="isActive" label="Activo" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#B8860B]/20 text-[#A0A0A0] text-sm font-semibold hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-[#D4A017] hover:bg-[#F0D060] text-black text-sm font-bold uppercase tracking-wide disabled:opacity-50 transition-all"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
