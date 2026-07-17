import type { OrderStatus } from "@/lib/order-status";

/**
 * Reporta el avance del cliente por los estados honestos del pedido
 * (ver lib/order-status.ts). Es "fire and forget": si falla (sin red, por
 * ejemplo) no bloquea el flujo del checkout — el estado más importante
 * (PENDING_VERIFICATION) se reintenta desde el paso 5 igual.
 */
export async function reportClientStatus(
  orderId: string,
  status: OrderStatus,
  extra?: { receiptFileName?: string; receiptShareMethod?: "web_share" | "direct_chat" }
): Promise<boolean> {
  try {
    const res = await fetch(`/api/pedidos/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
