// Precios del menú: formato en colones y el precio que se muestra en cada tarjeta.
// Lo usan los componentes y el mensaje. Los precios salen de menu.json a través de MENU.

import type { Colones, MenuItem } from './types';

/** ₡3.800: punto de miles, sin decimales. Igual en español y en inglés. */
export function formatColones(amount: Colones): string {
  return `₡${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/**
 * Precio de la tarjeta del platillo. Con tamaños es el más barato y la interfaz
 * lo muestra como "desde ₡2.000" / "from ₡2.000".
 */
export function startingPrice(item: MenuItem): { amount: Colones; hasSizes: boolean } {
  if (item.sizes && item.sizes.length > 0) {
    return { amount: Math.min(...item.sizes.map((s) => s.price)), hasSizes: true };
  }
  return { amount: item.price ?? 0, hasSizes: false };
}

/** Si el platillo abre la ventana de opciones (tamaño, elección o adicionales) antes de agregarlo. */
export function hasOptions(item: MenuItem): boolean {
  return Boolean(item.sizes?.length || item.choice || item.extras?.length);
}
