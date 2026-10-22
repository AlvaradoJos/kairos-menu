import type { Colones, Extra, MenuItem, MenuSection, Size } from '../menu/types';

export interface CartLine {
  itemId: string;
  sizeId?: string;
  choice?: string;
  extraIds: string[];
  /** Texto tal como lo escribió el cliente; se recorta al comparar y al enviar. */
  note?: string;
  quantity: number;
}

export interface ResolvedLine {
  line: CartLine;
  section: MenuSection;
  item: MenuItem;
  size?: Size;
  extras: Extra[];
  /** Precio base o del tamaño, por unidad, sin adicionales. */
  unitBase: Colones;
}

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

export function lineTotal(menu: MenuSection[], line: CartLine): Colones {
  const resolved = resolveLine(menu, line);
  if (!resolved) return 0;
  const extrasPrice = resolved.extras.reduce((sum, e) => sum + e.price, 0);
  return (resolved.unitBase + extrasPrice) * line.quantity;
}

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

export function addLine(cart: CartLine[], line: CartLine): CartLine[] {
  return mergeLines([...cart, line]);
}

export function setQuantity(cart: CartLine[], index: number, quantity: number): CartLine[] {
  if (index < 0 || index >= cart.length) return cart;
  const whole = Math.floor(quantity);
  if (!Number.isFinite(whole) || whole < 1) return removeLine(cart, index);
  return cart.map((line, i) => (i === index ? { ...line, quantity: whole } : line));
}

export function setNote(cart: CartLine[], index: number, note: string): CartLine[] {
  if (index < 0 || index >= cart.length) return cart;
  return mergeLines(cart.map((line, i) => (i === index ? { ...line, note } : line)));
}

export function removeLine(cart: CartLine[], index: number): CartLine[] {
  return cart.filter((_, i) => i !== index);
}

export function cartTotal(menu: MenuSection[], cart: CartLine[]): Colones {
  return cart.reduce((sum, line) => sum + lineTotal(menu, line), 0);
}

export function itemCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function needsPriceConfirmation(menu: MenuSection[], cart: CartLine[]): boolean {
  return cart.some((line) => {
    if (!line.note?.trim()) return false;
    return resolveLine(menu, line)?.section.hasUnpricedExtras === true;
  });
}
