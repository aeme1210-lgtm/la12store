import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/utils";
import { AdminOrderStatus } from "@/components/admin/AdminOrderStatus";

export default async function AdminPedidos() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

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
      <div className="mb-6">
        <h1
          className="text-3xl font-black text-white uppercase"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          Pedidos
        </h1>
        <p className="text-[#666666] text-sm mt-1">{orders.length} pedidos en total</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-[#141414] rounded-xl border border-[#B8860B]/10 p-12 text-center">
            <p className="text-[#666666]">No hay pedidos aún</p>
          </div>
        ) : (
          orders.map((order: (typeof orders)[number]) => (
            <div
              key={order.id}
              className="bg-[#141414] rounded-xl border border-[#B8860B]/10 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className="text-white font-bold"
                      style={{ fontFamily: "var(--font-oswald)" }}
                    >
                      {order.orderNumber}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor[order.status] ?? "bg-gray-500/10 text-gray-400"}`}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-[#A0A0A0] text-sm">{order.customerName}</p>
                  <p className="text-[#666666] text-xs">{order.customerPhone}</p>
                  {order.city && (
                    <p className="text-[#666666] text-xs">
                      {order.city}, {order.department}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p
                    className="text-[#D4A017] font-bold text-xl"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {formatCOP(order.total)}
                  </p>
                  <p className="text-[#666666] text-xs">
                    {new Date(order.createdAt).toLocaleDateString("es-CO")}
                  </p>
                  {order.paymentMethod && (
                    <p className="text-[#A0A0A0] text-xs capitalize">
                      {order.paymentMethod}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mt-3 pt-3 border-t border-[#B8860B]/10 space-y-1">
                {order.items.map((item: (typeof order.items)[number]) => (
                  <p key={item.id} className="text-[#A0A0A0] text-xs">
                    • {item.product.name} — Talla: {item.size} · {item.version}
                    {item.dorsalName && ` · Dorsal: ${item.dorsalName} #${item.dorsalNumber}`}
                    {" "}× {item.quantity}
                  </p>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <AdminOrderStatus orderId={order.id} currentStatus={order.status} />
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(order.customerName)}%2C%20te%20contactamos%20de%20La%2012%20Store%20sobre%20tu%20pedido%20${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-3 py-1.5 rounded-lg hover:bg-[#25D366]/20 transition-colors"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
