import { describe, expect, it } from 'vitest';
import { formatColones, hasOptions, startingPrice } from '../price';
import type { MenuItem } from '../types';

describe('formatColones', () => {
  it('antepone ₡ y usa punto de miles', () => {
    expect(formatColones(800)).toBe('₡800');
    expect(formatColones(3800)).toBe('₡3.800');
    expect(formatColones(12000)).toBe('₡12.000');
    expect(formatColones(1234567)).toBe('₡1.234.567');
  });
});

describe('startingPrice', () => {
  it('da el precio fijo', () => {
    expect(startingPrice({ id: 'a', name: 'A', price: 1700 })).toEqual({ amount: 1700, hasSizes: false });
  });

  it('con tamaños, da el más barato para mostrarlo como "desde"', () => {
    const item: MenuItem = {
      id: 'b',
      name: 'B',
      sizes: [
        { id: 'grande', label: 'Grande', price: 3500 },
        { id: 'regular', label: 'Regular', price: 2000 },
      ],
    };
    expect(startingPrice(item)).toEqual({ amount: 2000, hasSizes: true });
  });
});

describe('hasOptions', () => {
  it('es falso para un platillo simple', () => {
    expect(hasOptions({ id: 'a', name: 'A', price: 1000 })).toBe(false);
  });

  it('es verdadero con tamaños, elección o adicionales', () => {
    expect(hasOptions({ id: 'a', name: 'A', sizes: [{ id: 'r', label: 'R', price: 1 }] })).toBe(true);
    expect(hasOptions({ id: 'a', name: 'A', price: 1, choice: { label: 'P', options: ['X', 'Y'] } })).toBe(true);
    expect(hasOptions({ id: 'a', name: 'A', price: 1, extras: [{ id: 'e', label: 'E', price: 1 }] })).toBe(true);
  });

  it('es falso con una lista de adicionales vacía', () => {
    expect(hasOptions({ id: 'a', name: 'A', price: 1, extras: [] })).toBe(false);
  });
});
