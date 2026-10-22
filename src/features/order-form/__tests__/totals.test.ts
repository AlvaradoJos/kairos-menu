import { describe, expect, it } from 'vitest';
import { FIXTURE_MENU } from '../../../test/fixtureMenu';
import type { CartLine } from '../../cart/cart';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../totals';
import { EMPTY_FORM, type OrderForm } from '../validation';

const cart: CartLine[] = [{ itemId: 'tipico', extraIds: [], quantity: 1 }];
const recoger: OrderForm = { ...EMPTY_FORM, type: 'recoger' };
const express: OrderForm = { ...EMPTY_FORM, type: 'express' };

describe('deliveryFeeFor', () => {
  it('solo aplica a express con costo definido', () => {
    expect(deliveryFeeFor(express, 1000)).toBe(1000);
    expect(deliveryFeeFor(express, undefined)).toBeUndefined();
    expect(deliveryFeeFor(recoger, 1000)).toBeUndefined();
  });
});

describe('orderTotal', () => {
  it('suma el envío solo cuando aplica', () => {
    expect(orderTotal(FIXTURE_MENU, cart, recoger, 1000)).toBe(1800);
    expect(orderTotal(FIXTURE_MENU, cart, express, 1000)).toBe(2800);
    expect(orderTotal(FIXTURE_MENU, cart, express, undefined)).toBe(1800);
  });
});

describe('orderWarnings', () => {
  it('no avisa nada en un pedido para recoger sin notas de desayuno', () => {
    expect(orderWarnings(FIXTURE_MENU, cart, recoger, undefined)).toEqual([]);
  });

  it('avisa costo de envío por confirmar si es express sin costo definido', () => {
    expect(orderWarnings(FIXTURE_MENU, cart, express, undefined)).toEqual(['Costo de envío por confirmar']);
    expect(orderWarnings(FIXTURE_MENU, cart, express, 1000)).toEqual([]);
  });

  it('avisa adicionales por confirmar con nota en desayuno', () => {
    const conNota: CartLine[] = [{ itemId: 'tipico', extraIds: [], quantity: 1, note: 'huevo extra' }];
    expect(orderWarnings(FIXTURE_MENU, conNota, express, undefined)).toEqual([
      'Adicionales por confirmar',
      'Costo de envío por confirmar',
    ]);
  });
});

describe('orderWarnings con precios por confirmar', () => {
  it('avisa qué platillos tienen el precio por confirmar', async () => {
    const { MENU } = await import('../../../data/menu');
    const conPendiente: CartLine[] = [
      { itemId: 'la-rascacielos', extraIds: [], quantity: 1 },
      { itemId: 'papas-fritas', sizeId: 'grande', extraIds: [], quantity: 1 },
      { itemId: 'quesoburguesa', extraIds: [], quantity: 1 },
    ];
    expect(orderWarnings(MENU, conPendiente, recoger, undefined)).toEqual([
      'Precio por confirmar: La Rascacielos, Papas Fritas',
    ]);
  });
});
