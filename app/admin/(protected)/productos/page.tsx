export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/utils";
import { AdminProductActions } from "@/components/admin/AdminProductActions";
import { Plus } from "lucide-react";

export default async function AdminProductos() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-black text-white uppercase"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Productos
          </h1>
          <p className="text-[#666666] text-sm mt-1">{products.length} productos en total</p>
        </div>
        <AdminProductActions mode="create" />
      </div>

      <div className="bg-[#141414] rounded-xl border border-[#8A6435]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#8A6435]/10">
                {["Producto", "Liga", "Tipo", "Precio Fan", "Estado", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[#666666] text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product: (typeof products)[number]) => (
                <tr
                  key={product.id}
                  className="border-b border-[#8A6435]/5 hover:bg-[#1A1A1A] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p
                        className="text-white font-semibold"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {product.name}
                      </p>
                      <p className="text-[#666666] text-xs">{product.team}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#A0A0A0]">{product.league}</td>
                  <td className="px-4 py-3 text-[#A0A0A0]">{product.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#A47C42] font-bold"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {formatCOP(product.isRetro ? (product.priceRetro ?? 170000) : (product.priceFan ?? 150000))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.isActive ? (
                        <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded-full">
                          Inactivo
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="bg-[#A47C42]/10 text-[#A47C42] text-xs px-2 py-0.5 rounded-full">
                          Destacado
                        </span>
                      )}
                      {product.isTrending && (
                        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                          Tendencia
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminProductActions mode="edit" product={product} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
