// Totales y avisos del pedido. Los usan OrderView (pantalla) y message.ts (WhatsApp).
// Los precios salen del menú (MENU) a través del carrito; el envío, de config.ts.

import type { Dictionary } from '../../i18n/es';
import { cartTotal, needsPriceConfirmation, resolveLine, type CartLine } from '../cart/cart';
import type { Colones, MenuItem, MenuSection } from '../menu/types';
import type { OrderForm } from './validation';

/** Costo del envío: solo en express y solo si el negocio lo definió. */
export function deliveryFeeFor(form: OrderForm, deliveryFee: Colones | undefined): Colones | undefined {
  return form.type === 'express' ? deliveryFee : undefined;
}

/** Total del pedido: carrito más envío, si aplica. */
export function orderTotal(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): Colones {
  return cartTotal(menu, cart) + (deliveryFeeFor(form, deliveryFee) ?? 0);
}

/** Un aviso del pedido, sin texto: warningText lo escribe en el idioma que toque. */
export type OrderWarning =
  | { kind: 'pendingPrice'; names: string[] }
  | { kind: 'unpricedExtras' }
  | { kind: 'deliveryFeePending' };

/** Avisos para el restaurante y el cliente; se muestran en la página y al final del mensaje. */
export function orderWarnings(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): OrderWarning[] {
  const warnings: OrderWarning[] = [];

  // Platillos con precio por confirmar, cada uno una vez aunque esté en varias líneas.
  const pendingItems = new Set<MenuItem>();
  for (const line of cart) {
    const item = resolveLine(menu, line)?.item;
    if (item?.pending) pendingItems.add(item);
  }
  if (pendingItems.size > 0) {
    warnings.push({ kind: 'pendingPrice', names: [...pendingItems].map((item) => item.name) });
  }

  if (needsPriceConfirmation(menu, cart)) warnings.push({ kind: 'unpricedExtras' });
  if (form.type === 'express' && deliveryFee === undefined) warnings.push({ kind: 'deliveryFeePending' });
  return warnings;
}

/** Escribe un aviso con el diccionario dado: `t` en la página, `es` en el mensaje. */
export function warningText(warning: OrderWarning, t: Dictionary): string {
  switch (warning.kind) {
    case 'pendingPrice':
      return t.warnings.pendingPrice(warning.names.join(', '));
    case 'unpricedExtras':
      return t.warnings.unpricedExtras;
    case 'deliveryFeePending':
      return t.warnings.deliveryFeePending;
  }
}
