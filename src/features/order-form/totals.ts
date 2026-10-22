import { cartTotal, needsPriceConfirmation, resolveLine, type CartLine } from '../cart/cart';
import type { Colones, MenuSection } from '../menu/types';
import type { OrderForm } from './validation';

export function deliveryFeeFor(form: OrderForm, deliveryFee: Colones | undefined): Colones | undefined {
  return form.type === 'express' ? deliveryFee : undefined;
}

export function orderTotal(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): Colones {
  return cartTotal(menu, cart) + (deliveryFeeFor(form, deliveryFee) ?? 0);
}

/** Avisos para el restaurante y el cliente; se muestran en la página y al final del mensaje. */
export function orderWarnings(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): string[] {
  const warnings: string[] = [];
  const pending = [...new Set(cart.map((line) => resolveLine(menu, line)?.item).filter((item) => item?.pending))];
  if (pending.length > 0) warnings.push(`Precio por confirmar: ${pending.map((item) => item!.name).join(', ')}`);
  if (needsPriceConfirmation(menu, cart)) warnings.push('Adicionales por confirmar');
  if (form.type === 'express' && deliveryFee === undefined) warnings.push('Costo de envío por confirmar');
  return warnings;
}
