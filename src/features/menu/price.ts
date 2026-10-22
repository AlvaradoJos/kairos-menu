import type { Colones, MenuItem } from './types';

/** ₡3.800: punto de miles, sin decimales. */
export function formatColones(amount: Colones): string {
  return `₡${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function displayPrice(item: MenuItem): string {
  if (item.sizes && item.sizes.length > 0) {
    return `desde ${formatColones(Math.min(...item.sizes.map((s) => s.price)))}`;
  }
  return formatColones(item.price ?? 0);
}

export function hasOptions(item: MenuItem): boolean {
  return Boolean(item.sizes?.length || item.choice || item.extras?.length);
}
