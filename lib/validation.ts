/**
 * validation.ts
 * Esquemas Zod para todos los endpoints API. Centralizar aquí
 * facilita auditoría y reutilización.
 */
import { z } from "zod";

// ── Productos ──────────────────────────────────────────────────────────────

export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(300).trim(),
  team: z.string().min(1).max(150).trim(),
  league: z.string().min(1).max(100).trim(),
  type: z.string().min(1).max(80).trim(),
  season: z.string().max(30).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  slug: z.string().max(300).trim().optional(),
  priceFan: z.number().int().min(0).max(99_999_999).optional(),
  pricePlayer: z.number().int().min(0).max(99_999_999).optional(),
  priceRetro: z.number().int().min(0).max(99_999_999).optional(),
  images: z.string().max(10_000).optional(), // JSON array serializado
  sizes: z.string().max(500).optional(),      // JSON array serializado
  hasPlayer: z.boolean().optional(),
  isRetro: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isActive: z.boolean().optional(),
  stock: z.number().int().min(0).max(99_999).optional(),
});

// Actualización parcial: todos los campos son opcionales
export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductQuerySchema = z.object({
  q: z.string().max(200).trim().optional(),
  liga: z.string().max(100).trim().optional(),
  tipo: z.string().max(80).trim().optional(),
  page: z.coerce.number().int().min(1).max(9999).default(1),
});

// ── Pedidos ────────────────────────────────────────────────────────────────

const OrderItemSchema = z.object({
  productId: z.string().min(1).max(36),
  quantity: z.number().int().min(1).max(99),
  size: z.string().min(1).max(10).trim(),
  version: z.string().min(1).max(60).trim(),
  dorsalName: z.string().max(50).trim().optional(),
  dorsalNumber: z.string().max(10).trim().optional(),
  price: z.number().int().min(0).max(99_999_999),
});

export const OrderCreateSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  phone: z.string().min(7).max(25).trim(),
  email: z.string().email().max(200).trim().optional().or(z.literal("")),
  address: z.string().max(400).trim().optional(),
  city: z.string().max(100).trim().optional(),
  department: z.string().max(100).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
  paymentMethod: z.string().max(60).trim().optional(),
  subtotal: z.number().int().min(0).max(999_999_999),
  shipping: z.number().int().min(0).max(99_999_999).optional(),
  total: z.number().int().min(0).max(999_999_999),
  items: z.array(OrderItemSchema).min(1).max(50),
});

export const OrderUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

// ── Admin login ─────────────────────────────────────────────────────────────

export const AdminLoginSchema = z.object({
  email: z.string().email().max(200).trim(),
  password: z.string().min(1).max(200),
});
