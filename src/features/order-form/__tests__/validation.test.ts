import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, hasErrors, validateOrderForm, type OrderForm } from '../validation';

const valid: OrderForm = { ...EMPTY_FORM, name: 'Ana', type: 'recoger', payment: 'efectivo' };

describe('validateOrderForm', () => {
  it('marca nombre, tipo y pago en un formulario vacío', () => {
    expect(validateOrderForm(EMPTY_FORM)).toEqual({
      name: 'Falta el nombre',
      type: 'Falta el tipo de pedido',
      payment: 'Falta el método de pago',
    });
  });

  it('acepta un pedido para recoger sin dirección', () => {
    expect(validateOrderForm(valid)).toEqual({});
  });

  it('pide dirección si es express', () => {
    expect(validateOrderForm({ ...valid, type: 'express' })).toEqual({ address: 'Falta la dirección' });
  });

  it('acepta express con dirección', () => {
    expect(validateOrderForm({ ...valid, type: 'express', address: 'Barrio X' })).toEqual({});
  });

  it('trata como vacíos los campos de solo espacios', () => {
    expect(validateOrderForm({ ...valid, name: '   ' })).toEqual({ name: 'Falta el nombre' });
    expect(validateOrderForm({ ...valid, type: 'express', address: ' \n ' })).toEqual({ address: 'Falta la dirección' });
  });
});

describe('hasErrors', () => {
  it('detecta si hay algún error', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ name: 'Falta el nombre' })).toBe(true);
  });
});
