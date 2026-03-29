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

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `L12-${year}-${rand}`;
}

export function getProductPrice(product: {
  priceFan?: number | null;
  pricePlayer?: number | null;
  priceRetro?: number | null;
  isRetro: boolean;
}, version?: string): number {
  if (product.isRetro) return product.priceRetro ?? 170000;
  if (version === "Player") return product.pricePlayer ?? 180000;
  return product.priceFan ?? 150000;
}

export function buildWhatsAppMessage(text: string): string {
  return `https://wa.me/573008443885?text=${encodeURIComponent(text)}`;
}
