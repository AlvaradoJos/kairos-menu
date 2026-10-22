import { resolveLine, type CartLine } from '../cart/cart';
import { formatColones } from '../menu/price';
import type { Colones, MenuSection } from '../menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../order-form/totals';
import { ORDER_TYPE_LABEL, PAYMENT_LABEL, type OrderForm } from '../order-form/validation';

const GREETING = "¡Hola Kairos Food's! Quiero hacer un pedido 🍔";

export function buildOrderMessage(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): string {
  const out: string[] = [GREETING, ''];

  for (const line of cart) {
    const resolved = resolveLine(menu, line);
    if (!resolved) continue;
    const details = [resolved.size?.label, line.choice].filter((d): d is string => Boolean(d));
    const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';
    out.push(`${line.quantity}× ${resolved.item.name}${suffix} — ${formatColones(resolved.unitBase * line.quantity)}`);
    for (const extra of resolved.extras) {
      out.push(`   + ${extra.label} — ${formatColones(extra.price * line.quantity)}`);
    }
    const note = line.note?.trim();
    if (note) out.push(`   Nota: ${note}`);
  }

  const fee = deliveryFeeFor(form, deliveryFee);
  if (fee !== undefined) out.push(`Envío — ${formatColones(fee)}`);

  out.push('', `Total: ${formatColones(orderTotal(menu, cart, form, deliveryFee))}`, '');

  out.push(`Nombre: ${form.name.trim()}`);
  if (form.type) out.push(`Tipo: ${ORDER_TYPE_LABEL[form.type]}`);
  if (form.type === 'express') {
    out.push(`Dirección: ${form.address.trim()}`);
    if (form.reference.trim()) out.push(`Referencia: ${form.reference.trim()}`);
  }
  if (form.type === 'recoger' && form.pickupTime) out.push(`Hora: ${form.pickupTime}`);
  if (form.payment) out.push(`Pago: ${PAYMENT_LABEL[form.payment]}`);
  if (form.comment.trim()) out.push(`Comentario: ${form.comment.trim()}`);

  const warnings = orderWarnings(menu, cart, form, deliveryFee);
  if (warnings.length > 0) out.push('', ...warnings.map((w) => `⚠️ ${w}`));

  return out.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
