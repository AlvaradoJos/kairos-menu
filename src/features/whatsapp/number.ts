// Validación del número de WhatsApp del negocio. La usa config.ts.

/**
 * Lee el número de WhatsApp de la variable de entorno `VITE_WHATSAPP_NUMBER`.
 * Acepta dígitos, +, espacios y guiones; devuelve solo los dígitos (10 a 15, con código de país)
 * o `undefined` si falta o no es válido. Sin número, el sitio muestra "Número pendiente".
 */
export function parseWhatsappNumber(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value || !/^\+?[\d\s-]+$/.test(value)) return undefined;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 ? digits : undefined;
}
