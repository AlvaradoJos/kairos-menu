import { resolveLine, type CartLine } from '../cart/cart';
import { formatColones } from '../menu/price';
import type { Colones, MenuSection } from '../menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../order-form/totals';
import { ORDER_TYPE_LABEL, PAYMENT_LABEL, type OrderForm } from '../order-form/validation';

// Sin emojis: al abrir el enlace de WhatsApp se ven como "�". Volver a probar en un celular real antes de reponerlos.
const GREETING = "¡Hola Kairos Food's! Quiero hacer un pedido";

/** Texto del cliente en una sola línea: un salto de línea se lee en la cocina como otro platillo. */
function oneLine(text: string): string {
  return text
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

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
    const note = oneLine(line.note ?? '');
    if (note) out.push(`   Nota: ${note}`);
  }

  const fee = deliveryFeeFor(form, deliveryFee);
  if (fee !== undefined) out.push(`Envío — ${formatColones(fee)}`);

  out.push('', `Total: ${formatColones(orderTotal(menu, cart, form, deliveryFee))}`, '');

  out.push(`Nombre: ${oneLine(form.name)}`);
  if (form.type) out.push(`Tipo: ${ORDER_TYPE_LABEL[form.type]}`);
  if (form.type === 'express') {
    out.push(`Dirección: ${oneLine(form.address)}`);
    if (oneLine(form.reference)) out.push(`Referencia: ${oneLine(form.reference)}`);
  }
  if (form.type === 'recoger' && form.pickupTime) out.push(`Hora: ${form.pickupTime}`);
  if (form.payment) out.push(`Pago: ${PAYMENT_LABEL[form.payment]}`);
  if (oneLine(form.comment)) out.push(`Comentario: ${oneLine(form.comment)}`);

  const warnings = orderWarnings(menu, cart, form, deliveryFee);
  if (warnings.length > 0) out.push('', ...warnings);

  return out.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
