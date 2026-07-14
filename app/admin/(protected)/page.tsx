export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/utils";
import { Package, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, recentOrders, pendingOrders] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.count({ where: { status: "pending" } }),
    ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { in: ["confirmed", "shipped", "delivered"] } },
  });

  const stats = [
    {
      label: "Productos activos",
      value: totalProducts,
      icon: Package,
      color: "text-[#D4A017]",
    },
    {
      label: "Total pedidos",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-[#22C55E]",
    },
    {
      label: "Pendientes",
      value: pendingOrders,
      icon: TrendingUp,
      color: "text-[#C70101]",
    },
    {
      label: "Ingresos confirmados",
      value: formatCOP(totalRevenue._sum.total ?? 0),
      icon: DollarSign,
      color: "text-[#D4A017]",
    },
  ];

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    shipped: "Enviado",
    delivered: "Entregado",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-blue-500/10 text-blue-400",
    shipped: "bg-purple-500/10 text-purple-400",
    delivered: "bg-green-500/10 text-green-400",
  };

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-black text-white uppercase"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Dashboard
        </h1>
        <p className="text-[#666666] text-sm mt-1">La 12 Store — Panel de control</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#141414] rounded-xl border border-[#B8860B]/10 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#666666] text-xs uppercase tracking-wider">
                {stat.label}
              </p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p
              className={`text-2xl font-bold ${stat.color}`}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#141414] rounded-xl border border-[#B8860B]/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-white font-bold uppercase tracking-wider text-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Pedidos Recientes
          </h2>
          <a
            href="/admin/pedidos"
            className="text-[#D4A017] text-xs hover:text-[#F0D060] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Ver todos →
          </a>
        </div>

        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-[#666666] text-sm text-center py-8">
              No hay pedidos aún
            </p>
          ) : (
            recentOrders.map((order: (typeof recentOrders)[number]) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-[#B8860B]/10 last:border-0"
              >
                <div>
                  <p
                    className="text-white text-sm font-semibold"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {order.orderNumber}
                  </p>
                  <p className="text-[#666666] text-xs">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[order.status] ?? "bg-gray-500/10 text-gray-400"}`}
                  >
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  <span
                    className="text-[#D4A017] text-sm font-bold"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {formatCOP(order.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
