import type { MenuSection } from '../menu/types';
import { mergeLines, resolveLine, type CartLine } from './cart';

export const CART_STORAGE_KEY = 'kairos.cart.v1';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function toLine(value: unknown): CartLine | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.itemId !== 'string') return null;
  if (!isOptionalString(v.sizeId) || !isOptionalString(v.choice) || !isOptionalString(v.note)) return null;
  if (!Array.isArray(v.extraIds) || !v.extraIds.every((id) => typeof id === 'string')) return null;
  if (typeof v.quantity !== 'number' || !Number.isInteger(v.quantity) || v.quantity < 1) return null;
  return {
    itemId: v.itemId,
    sizeId: v.sizeId,
    choice: v.choice,
    extraIds: v.extraIds as string[],
    note: v.note,
    quantity: v.quantity,
  };
}

/** Lee el carrito guardado. Ante cualquier problema devuelve solo las líneas que siguen siendo válidas. */
export function loadCart(store: KeyValueStore | null, menu: MenuSection[]): CartLine[] {
  if (!store) return [];
  let raw: string | null;
  try {
    raw = store.getItem(CART_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines = data
    .map(toLine)
    .filter((line): line is CartLine => line !== null && resolveLine(menu, line) !== null);
  return mergeLines(lines);
}

export function saveCart(store: KeyValueStore | null, cart: CartLine[]): void {
  if (!store) return;
  try {
    store.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Almacenamiento lleno o bloqueado: el carrito sigue funcionando en memoria.
  }
}

/** `localStorage` si está disponible; `null` en modo privado o con el almacenamiento bloqueado. */
export function browserStore(): KeyValueStore | null {
  try {
    const store = window.localStorage;
    store.getItem(CART_STORAGE_KEY);
    return store;
  } catch {
    return null;
  }
}
