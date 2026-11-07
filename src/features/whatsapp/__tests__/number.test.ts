import { describe, expect, it } from 'vitest';
import { parseWhatsappNumber } from '../number';

// Números sintéticos: nunca usar el número real del negocio en pruebas.
describe('parseWhatsappNumber', () => {
  it('devuelve undefined si la variable no está definida', () => {
    expect(parseWhatsappNumber(undefined)).toBeUndefined();
  });

  it('devuelve undefined si la variable está vacía o solo tiene espacios', () => {
    expect(parseWhatsappNumber('')).toBeUndefined();
    expect(parseWhatsappNumber('   ')).toBeUndefined();
  });

  it('acepta un número en formato internacional solo con dígitos', () => {
    expect(parseWhatsappNumber('50688887777')).toBe('50688887777');
  });

  it('quita +, espacios y guiones', () => {
    expect(parseWhatsappNumber(' +506 8888-7777 ')).toBe('50688887777');
  });

  it('rechaza un número sin código de país (menos de 10 dígitos)', () => {
    expect(parseWhatsappNumber('88887777')).toBeUndefined();
  });

  it('rechaza más de 15 dígitos (máximo de E.164)', () => {
    expect(parseWhatsappNumber('5068888777712345')).toBeUndefined();
  });

  it('rechaza letras u otros caracteres', () => {
    expect(parseWhatsappNumber('506XXXXXXXX')).toBeUndefined();
    expect(parseWhatsappNumber('506(8888)7777')).toBeUndefined();
  });
});
