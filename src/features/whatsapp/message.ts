// Mensaje de WhatsApp del pedido y el enlace que lo abre. Lo usan OrderView y Header.
// Los datos vienen del carrito, del menú (MENU) y del formulario; el número, de config.ts.

import { es } from '../../i18n/es';
import type { Lang } from '../../i18n/language';
import { resolveLine, type CartLine } from '../cart/cart';
import { mapsLink, wazeLink } from '../location/location';
import { formatColones } from '../menu/price';
import type { Colones, MenuSection } from '../menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings, warningText } from '../order-form/totals';
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

/**
 * Arma el texto del pedido que recibe el negocio: platillos, total, datos del cliente y avisos.
 * Siempre en español, aunque el cliente use la página en inglés (ADR 0007).
 */
export function buildOrderMessage(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
  customerLang: Lang = 'es',
): string {
  const out: string[] = [GREETING, ''];

  for (const line of cart) {
    const resolved = resolveLine(menu, line);
    if (!resolved) continue;
    const details: string[] = [];
    if (resolved.size) details.push(resolved.size.label);
    if (line.choice) details.push(line.choice);
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
    if (form.location) {
      out.push(`Ubicación (Google Maps): ${mapsLink(form.location)}`);
      out.push(`Waze: ${wazeLink(form.location)}`);
    }
  }
  if (form.type === 'recoger' && form.pickupTime) out.push(`Hora: ${form.pickupTime}`);
  if (form.payment) out.push(`Pago: ${PAYMENT_LABEL[form.payment]}`);
  if (oneLine(form.comment)) out.push(`Comentario: ${oneLine(form.comment)}`);
  // El mensaje no se traduce: así lo lee igual quien atiende. Esta línea avisa en qué idioma responder.
  if (customerLang === 'en') out.push('Idioma del cliente: inglés');

  const warnings = orderWarnings(menu, cart, form, deliveryFee);
  if (warnings.length > 0) out.push('', ...warnings.map((warning) => warningText(warning, es)));

  return out.join('\n');
}

/**
 * Enlace que abre WhatsApp con el mensaje escrito. Usa api.whatsapp.com/send y no el atajo wa.me:
 * la redirección de wa.me cambia los emojis (p. ej. los que el cliente escribe en una nota) por "�" (D-01).
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  // El número va solo con dígitos y el código de país, como pide WhatsApp (sin +, espacios ni guiones).
  // encodeURIComponent convierte tildes, ₡, &, # y saltos de línea en %XX: sin eso, un "&" o un "#"
  // en una nota cortaría el mensaje y las tildes podrían llegar dañadas.
  const base = `https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, '')}`;
  return message ? `${base}&text=${encodeURIComponent(message)}` : base;
}
