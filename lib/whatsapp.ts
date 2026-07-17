import { formatCOP } from "@/lib/utils";

/**
 * Fuente de verdad única del número de WhatsApp del negocio.
 * No hardcodear este número en ningún otro archivo — importar desde aquí.
 */
export const WHATSAPP_NUMBER = "573008443885";
export const WHATSAPP_DISPLAY = "+57 300 844 3885";

export interface WhatsAppOrderItem {
  name: string;
  url: string;
  size: string;
  version: string;
  dorsalName?: string;
  dorsalNumber?: string;
  patches?: string;
  quantity: number;
  unitPrice: number;
}

export interface WhatsAppOrderDetails {
  items: WhatsAppOrderItem[];
  subtotal: number;
  city?: string;
  notes?: string;
  orderNumber?: string;
  paymentMethod?: string;
}

function formatItem(item: WhatsAppOrderItem, index: number): string {
  const lines = [
    `${index + 1}. ${item.name}`,
    `   Link: ${item.url}`,
    `   Talla: ${item.size} | Versión: ${item.version}`,
  ];
  if (item.dorsalName || item.dorsalNumber) {
    lines.push(`   Dorsal: ${item.dorsalName ?? "-"} #${item.dorsalNumber ?? "-"}`);
  }
  if (item.patches) {
    lines.push(`   Parches: ${item.patches}`);
  }
  lines.push(
    `   Cantidad: ${item.quantity} | Precio unitario: ${formatCOP(item.unitPrice)}`
  );
  return lines.join("\n");
}

/** Único builder de mensaje de pedido — usado por consulta rápida, carrito y checkout. */
export function buildOrderMessage(details: WhatsAppOrderDetails): string {
  const parts = ["Hola! Quiero hacer este pedido en La 12 Store:", ""];
  details.items.forEach((item, i) => parts.push(formatItem(item, i), ""));
  parts.push(`Subtotal: ${formatCOP(details.subtotal)}`);
  parts.push("Envío: GRATIS · $0");
  if (details.orderNumber) parts.push(`N° de pedido: ${details.orderNumber}`);
  if (details.city) parts.push(`Ciudad: ${details.city}`);
  if (details.paymentMethod) parts.push(`Método de pago: ${details.paymentMethod}`);
  if (details.notes) parts.push(`Notas: ${details.notes}`);
  return parts.join("\n");
}

export function whatsAppLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
