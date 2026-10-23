import { describe, expect, it } from 'vitest';
import { MENU } from '../../../data/menu';
import type { CartLine } from '../../cart/cart';
import { EMPTY_FORM, type OrderForm } from '../../order-form/validation';
import { buildOrderMessage, buildWhatsAppUrl } from '../message';

const SPEC_CART: CartLine[] = [
  { itemId: 'bacon-cheese', choice: 'Pechuga de pollo', extraIds: ['papas'], quantity: 1 },
  { itemId: 'taco-sencillo', choice: 'Carne', extraIds: [], quantity: 2 },
  { itemId: 'papipollo', sizeId: 'grande', extraIds: [], quantity: 1, note: 'sin pico de gallo' },
];

const SPEC_FORM: OrderForm = {
  ...EMPTY_FORM,
  name: 'Ana',
  type: 'express',
  address: 'Barrio X, 200 m sur de la iglesia',
  payment: 'sinpe',
  comment: 'tocar el timbre',
};

describe('buildOrderMessage', () => {
  it('reproduce exactamente el ejemplo de la especificación', () => {
    expect(buildOrderMessage(MENU, SPEC_CART, SPEC_FORM, undefined)).toBe(
      [
        "¡Hola Kairos Food's! Quiero hacer un pedido 🍔",
        '',
        '1× Bacon & Chesse (Pechuga de pollo) — ₡3.800',
        '   + Papas fritas — ₡1.200',
        '2× Taco sencillo (Carne) — ₡2.000',
        '1× Papipollo (Grandes) — ₡5.000',
        '   Nota: sin pico de gallo',
        '',
        'Total: ₡12.000',
        '',
        'Nombre: Ana',
        'Tipo: Express',
        'Dirección: Barrio X, 200 m sur de la iglesia',
        'Pago: SINPE Móvil',
        'Comentario: tocar el timbre',
        '',
        '⚠️ Costo de envío por confirmar',
      ].join('\n'),
    );
  });

  it('multiplica los adicionales por la cantidad', () => {
    const cart: CartLine[] = [{ itemId: 'taco-sencillo', choice: 'Pollo', extraIds: ['aros'], quantity: 3 }];
    const message = buildOrderMessage(MENU, cart, SPEC_FORM, undefined);
    expect(message).toContain('3× Taco sencillo (Pollo) — ₡3.000\n   + Aros de cebolla — ₡3.600');
    expect(message).toContain('Total: ₡6.600');
  });

  it('agrega la línea de envío y la suma al total cuando hay costo', () => {
    const message = buildOrderMessage(MENU, SPEC_CART, SPEC_FORM, 1000);
    expect(message).toContain('Envío — ₡1.000\n\nTotal: ₡13.000');
    expect(message).not.toContain('⚠️');
  });

  it('para recoger muestra la hora, no la dirección ni avisos', () => {
    const form: OrderForm = { ...SPEC_FORM, type: 'recoger', pickupTime: '18:30', comment: '' };
    const message = buildOrderMessage(MENU, SPEC_CART, form, 1000);
    expect(message).toContain('Tipo: Para recoger\nHora: 18:30\nPago: SINPE Móvil');
    expect(message).not.toContain('Dirección');
    expect(message).not.toContain('Envío');
    expect(message).not.toContain('Comentario');
    expect(message).not.toContain('⚠️');
  });

  it('omite la hora si no se indicó', () => {
    const form: OrderForm = { ...SPEC_FORM, type: 'recoger', pickupTime: '' };
    expect(buildOrderMessage(MENU, SPEC_CART, form, undefined)).not.toContain('Hora');
  });

  it('incluye la referencia si es express y la trae', () => {
    const form: OrderForm = { ...SPEC_FORM, reference: 'portón negro' };
    expect(buildOrderMessage(MENU, SPEC_CART, form, undefined)).toContain(
      'Dirección: Barrio X, 200 m sur de la iglesia\nReferencia: portón negro',
    );
  });

  it('recorta espacios de nombre, notas y comentario', () => {
    const cart: CartLine[] = [{ itemId: 'empanadas', extraIds: [], quantity: 1, note: '  de carne  ' }];
    const form: OrderForm = { ...SPEC_FORM, name: '  Ana  ', comment: '  tocar  ' };
    const message = buildOrderMessage(MENU, cart, form, undefined);
    expect(message).toContain('   Nota: de carne\n');
    expect(message).toContain('Nombre: Ana\n');
    expect(message).toContain('Comentario: tocar\n');
  });

  it('avisa adicionales por confirmar con nota en desayuno', () => {
    const cart: CartLine[] = [{ itemId: 'tipico', extraIds: [], quantity: 1, note: 'huevo extra' }];
    const message = buildOrderMessage(MENU, cart, SPEC_FORM, undefined);
    expect(message.endsWith('\n\n⚠️ Adicionales por confirmar\n⚠️ Costo de envío por confirmar')).toBe(true);
  });

  it('ignora líneas que ya no existen en el menú', () => {
    const cart: CartLine[] = [...SPEC_CART, { itemId: 'no-existe', extraIds: [], quantity: 1 }];
    expect(buildOrderMessage(MENU, cart, SPEC_FORM, undefined)).toContain('Total: ₡12.000');
  });
});

describe('buildOrderMessage con saltos de línea', () => {
  it('pone notas, dirección y comentario en una sola línea', () => {
    const cart: CartLine[] = [{ itemId: 'empanadas', extraIds: [], quantity: 1, note: 'de carne\n\nbien tostadas' }];
    const form: OrderForm = { ...SPEC_FORM, address: 'Barrio X\ncasa verde', comment: 'tocar\r\nfuerte' };
    const message = buildOrderMessage(MENU, cart, form, undefined);
    expect(message).toContain('   Nota: de carne, bien tostadas\n');
    expect(message).toContain('Dirección: Barrio X, casa verde\n');
    expect(message).toContain('Comentario: tocar, fuerte\n');
  });
});

describe('buildWhatsAppUrl', () => {
  it('deja solo los dígitos del número', () => {
    expect(buildWhatsAppUrl('+506 8888-7777', 'hola')).toBe('https://wa.me/50688887777?text=hola');
  });

  it('omite el texto si el mensaje está vacío', () => {
    expect(buildWhatsAppUrl('50688887777', '')).toBe('https://wa.me/50688887777');
  });

  it('codifica caracteres especiales y el texto llega idéntico', () => {
    const message = 'Calle 5 & 7 #3, ñandú?\nTotal: ₡1.000 🍔 100%';
    const url = buildWhatsAppUrl('50688887777', message);
    const text = url.slice('https://wa.me/50688887777?text='.length);
    expect(text).not.toMatch(/[\s&#?]/);
    expect(decodeURIComponent(text)).toBe(message);
  });
});
