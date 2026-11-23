// Lógica del carrito: líneas, precios y cambios. Funciones puras: reciben el carrito y devuelven uno nuevo.
// La usan useCart, el mensaje de WhatsApp y los componentes. Los precios salen siempre del menú (MENU).

import type { Colones, Extra, MenuItem, MenuSection, Size } from '../menu/types';

/** Una línea del carrito: qué platillo, con qué opciones y cuántos. Se guarda tal cual en localStorage. */
export interface CartLine {
  itemId: string;
  sizeId?: string;
  choice?: string;
  extraIds: string[];
  /** Texto tal como lo escribió el cliente; se recorta al comparar y al enviar. */
  note?: string;
  quantity: number;
}

/** Una línea ya cruzada con el menú: trae el platillo, el tamaño y los adicionales con sus precios. */
export interface ResolvedLine {
  line: CartLine;
  section: MenuSection;
  item: MenuItem;
  size?: Size;
  extras: Extra[];
  /** Precio base o del tamaño, por unidad, sin adicionales. */
  unitBase: Colones;
}

/**
 * Busca en el menú todo lo que la línea menciona. Devuelve null si algo no cuadra: el platillo ya no
 * existe, falta el tamaño o sobra, la opción no es de la lista o un adicional no es de ese platillo.
 * Así una línea vieja del localStorage (de un menú que cambió) nunca se cobra con un precio inventado:
 * el carrito, el total y el mensaje simplemente la ignoran.
 */
export function resolveLine(menu: MenuSection[], line: CartLine): ResolvedLine | null {
  for (const section of menu) {
    const item = section.items.find((i) => i.id === line.itemId);
    if (!item) continue;

    let size: Size | undefined;
    if (item.sizes) {
      size = item.sizes.find((s) => s.id === line.sizeId);
      if (!size) return null;
    } else if (line.sizeId !== undefined) {
      return null;
    }

    if (item.choice) {
      if (line.choice === undefined || !item.choice.options.includes(line.choice)) return null;
    } else if (line.choice !== undefined) {
      return null;
    }

    const extras: Extra[] = [];
    for (const id of line.extraIds) {
      const extra = item.extras?.find((e) => e.id === id);
      if (!extra) return null;
      extras.push(extra);
    }

    return { line, section, item, size, extras, unitBase: size ? size.price : (item.price ?? 0) };
  }
  return null;
}

/** Precio de la línea: (base o tamaño + adicionales) × cantidad. 0 si la línea no es válida. */
export function lineTotal(menu: MenuSection[], line: CartLine): Colones {
  const resolved = resolveLine(menu, line);
  if (!resolved) return 0;
  const extrasPrice = resolved.extras.reduce((sum, e) => sum + e.price, 0);
  return (resolved.unitBase + extrasPrice) * line.quantity;
}

/** Deja la línea en una forma única (adicionales ordenados, sin nota vacía) para poder compararla. */
function normalize(line: CartLine): CartLine {
  const normalized: CartLine = {
    itemId: line.itemId,
    extraIds: [...new Set(line.extraIds)].sort(),
    quantity: line.quantity,
  };
  if (line.sizeId !== undefined) normalized.sizeId = line.sizeId;
  if (line.choice !== undefined) normalized.choice = line.choice;
  if (line.note !== undefined && line.note.trim() !== '') normalized.note = line.note;
  return normalized;
}

/** Huella de la línea: dos líneas con la misma huella son el mismo pedido y se suman. */
function lineKey(line: CartLine): string {
  return JSON.stringify([line.itemId, line.sizeId ?? null, line.choice ?? null, line.extraIds, line.note?.trim() ?? null]);
}

/** Normaliza las líneas y combina las iguales sumando cantidades, respetando el orden. */
export function mergeLines(lines: CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();
  for (const raw of lines) {
    const line = normalize(raw);
    const key = lineKey(line);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, { ...existing, quantity: existing.quantity + line.quantity });
    } else {
      merged.set(key, line);
    }
  }
  return [...merged.values()];
}

/** Agrega una línea; si ya hay una igual, suma la cantidad. */
export function addLine(cart: CartLine[], line: CartLine): CartLine[] {
  return mergeLines([...cart, line]);
}

/** Cambia la cantidad. Con 0 o menos, quita la línea. */
export function setQuantity(cart: CartLine[], index: number, quantity: number): CartLine[] {
  if (index < 0 || index >= cart.length) return cart;
  const whole = Math.floor(quantity);
  if (!Number.isFinite(whole) || whole < 1) return removeLine(cart, index);
  return cart.map((line, i) => (i === index ? { ...line, quantity: whole } : line));
}

/** Cambia solo la nota. No combina líneas: hacerlo mientras el cliente escribe le movería la línea que edita. */
export function setNote(cart: CartLine[], index: number, note: string): CartLine[] {
  if (index < 0 || index >= cart.length) return cart;
  return cart.map((line, i) => (i === index ? { ...line, note: note.trim() === '' ? undefined : note } : line));
}

/** Quita la línea en esa posición. */
export function removeLine(cart: CartLine[], index: number): CartLine[] {
  return cart.filter((_, i) => i !== index);
}

/** Suma de todas las líneas válidas. */
export function cartTotal(menu: MenuSection[], cart: CartLine[]): Colones {
  return cart.reduce((sum, line) => sum + lineTotal(menu, line), 0);
}

/** Cantidad de platillos (no de líneas): 2 tacos + 1 burrito = 3. */
export function itemCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

/** Hay notas en una sección con adicionales sin precio (Desayunos): el negocio debe confirmar el costo. */
export function needsPriceConfirmation(menu: MenuSection[], cart: CartLine[]): boolean {
  return cart.some((line) => {
    if (!line.note?.trim()) return false;
    return resolveLine(menu, line)?.section.hasUnpricedExtras === true;
  });
}
