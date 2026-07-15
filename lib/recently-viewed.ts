"use client";

/**
 * "Vistos recientemente" — 100% local (localStorage), sin servicio externo,
 * tal como pide el brief. Guarda solo los campos mínimos necesarios para
 * pintar una miniatura, no vuelve a consultar la BD.
 */

const STORAGE_KEY = "la12-recently-viewed";
const MAX_ITEMS = 8;

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  viewedAt: number;
}

export function recordView(item: Omit<RecentlyViewedItem, "viewedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((i) => i.id !== item.id);
    const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage puede fallar en modo privado — no es crítico, se ignora.
  }
}

export function getRecentlyViewed(excludeId?: string): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as RecentlyViewedItem[];
    return excludeId ? items.filter((i) => i.id !== excludeId) : items;
  } catch {
    return [];
  }
}
