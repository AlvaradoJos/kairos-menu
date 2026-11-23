// Guardar y leer el carrito en localStorage para que sobreviva a recargar la página.
// Lo usa useCart. También lo reusa el idioma (LanguageContext) para abrir el almacenamiento.

import type { MenuSection } from '../menu/types';
import { mergeLines, resolveLine, type CartLine } from './cart';

/** Clave del carrito en localStorage. No cambiarla: los carritos guardados se perderían. */
export const CART_STORAGE_KEY = 'kairos.cart.v1';

/** Lo mínimo de localStorage que se usa; en las pruebas se reemplaza por un objeto en memoria. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

/** Revisa un valor leído del almacenamiento: si no tiene la forma de una línea, da null. */
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
  // Cualquiera puede editar el localStorage, y en modo privado leerlo puede lanzar un error:
  // se desconfía de todo lo que venga de ahí y ante un problema se empieza con el carrito vacío.
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

  // Se quedan solo las líneas con forma correcta y que todavía existen en el menú (ver resolveLine).
  const lines: CartLine[] = [];
  for (const value of data) {
    const line = toLine(value);
    if (line && resolveLine(menu, line)) lines.push(line);
  }
  return mergeLines(lines);
}

/** Guarda el carrito. Si no se puede, no pasa nada: sigue en memoria mientras la página esté abierta. */
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
