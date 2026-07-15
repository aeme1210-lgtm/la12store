export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Código de pedido L12-YYYYMMDD-XXXX. La parte aleatoria es de 4 dígitos;
 * la comprobación de colisión real (contra pedidos ya existentes) se hace
 * en el endpoint que crea el pedido (`app/api/pedidos/route.ts`), porque
 * requiere acceso a la base de datos — esta función solo genera el formato.
 */
export function generateOrderCode(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `L12-${y}${m}${d}-${rand}`;
}

// Cálculo de precio: usar getProductPrice/getStartingPrice de "@/lib/pricing".
// Mensajes/link de WhatsApp: usar buildOrderMessage/whatsAppLink de "@/lib/whatsapp".
