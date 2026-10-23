import { describe, expect, it } from 'vitest';
import { FIXTURE_MENU } from '../../../test/fixtureMenu';
import type { MenuSection } from '../../menu/types';
import {
  addLine,
  cartTotal,
  itemCount,
  lineTotal,
  needsPriceConfirmation,
  removeLine,
  resolveLine,
  setNote,
  setQuantity,
  type CartLine,
} from '../cart';

const tipico = (quantity = 1, note?: string): CartLine => ({ itemId: 'tipico', extraIds: [], quantity, note });
const taco = (extraIds: string[], quantity = 1, note?: string): CartLine => ({
  itemId: 'taco',
  choice: 'Carne',
  extraIds,
  quantity,
  note,
});
const salchipapas = (sizeId: string, quantity = 1): CartLine => ({ itemId: 'salchipapas', sizeId, extraIds: [], quantity });

describe('resolveLine', () => {
  it('encuentra platillo, sección, tamaño y adicionales', () => {
    const r = resolveLine(FIXTURE_MENU, { ...taco(['papas']) });
    expect(r?.item.id).toBe('taco');
    expect(r?.section.id).toBe('tacos');
    expect(r?.extras.map((e) => e.id)).toEqual(['papas']);
    expect(r?.unitBase).toBe(1000);
  });

  it('devuelve null si el platillo no existe', () => {
    expect(resolveLine(FIXTURE_MENU, { itemId: 'no-existe', extraIds: [], quantity: 1 })).toBeNull();
  });

  it('devuelve null si falta el tamaño o no existe', () => {
    expect(resolveLine(FIXTURE_MENU, { itemId: 'salchipapas', extraIds: [], quantity: 1 })).toBeNull();
    expect(resolveLine(FIXTURE_MENU, salchipapas('mediana'))).toBeNull();
  });

  it('devuelve null si trae tamaño un platillo sin tamaños', () => {
    expect(resolveLine(FIXTURE_MENU, { ...tipico(), sizeId: 'grande' })).toBeNull();
  });

  it('devuelve null si la elección falta o no está entre las opciones', () => {
    expect(resolveLine(FIXTURE_MENU, { itemId: 'taco', extraIds: [], quantity: 1 })).toBeNull();
    expect(resolveLine(FIXTURE_MENU, { itemId: 'taco', choice: 'Cerdo', extraIds: [], quantity: 1 })).toBeNull();
  });

  it('devuelve null si trae elección un platillo sin elección', () => {
    expect(resolveLine(FIXTURE_MENU, { ...tipico(), choice: 'Carne' })).toBeNull();
  });

  it('devuelve null si un adicional no existe para ese platillo', () => {
    expect(resolveLine(FIXTURE_MENU, taco(['duplicar']))).toBeNull();
  });
});

describe('lineTotal', () => {
  it('multiplica el precio fijo por la cantidad', () => {
    expect(lineTotal(FIXTURE_MENU, tipico(2))).toBe(3600);
  });

  it('usa el precio del tamaño', () => {
    expect(lineTotal(FIXTURE_MENU, salchipapas('grande'))).toBe(3500);
  });

  it('suma adicionales por unidad', () => {
    expect(lineTotal(FIXTURE_MENU, taco(['papas', 'aros'], 2))).toBe(6800);
  });

  it('es 0 para una línea inválida', () => {
    expect(lineTotal(FIXTURE_MENU, { itemId: 'no-existe', extraIds: [], quantity: 3 })).toBe(0);
  });

  it('usa el precio actual del menú, no uno guardado', () => {
    const line = tipico(1);
    const encarecido: MenuSection[] = FIXTURE_MENU.map((s) =>
      s.id === 'desayunos' ? { ...s, items: [{ id: 'tipico', name: 'Típico', price: 2000 }] } : s,
    );
    expect(lineTotal(FIXTURE_MENU, line)).toBe(1800);
    expect(lineTotal(encarecido, line)).toBe(2000);
  });
});

describe('addLine', () => {
  it('agrega una línea nueva', () => {
    expect(addLine([], tipico())).toEqual([{ itemId: 'tipico', extraIds: [], quantity: 1 }]);
  });

  it('combina líneas iguales aunque los adicionales vengan en otro orden', () => {
    const cart = addLine(addLine([], taco(['aros', 'papas'], 1)), taco(['papas', 'aros'], 2));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
    expect(cart[0].extraIds).toEqual(['aros', 'papas']);
  });

  it('no combina líneas con notas distintas', () => {
    const cart = addLine(addLine([], tipico(1, 'sin pan')), tipico(1));
    expect(cart).toHaveLength(2);
  });

  it('combina notas que solo difieren en espacios', () => {
    const cart = addLine(addLine([], tipico(1, 'sin pan')), tipico(1, '  sin pan '));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('guarda una nota vacía o de solo espacios como undefined', () => {
    expect(addLine([], tipico(1, '   '))[0].note).toBeUndefined();
  });
});

describe('setQuantity', () => {
  const cart = [tipico(2), salchipapas('regular')];

  it('cambia la cantidad', () => {
    expect(setQuantity(cart, 0, 5)[0].quantity).toBe(5);
  });

  it('quita la línea con 0 o menos', () => {
    expect(setQuantity(cart, 0, 0)).toEqual([salchipapas('regular')]);
    expect(setQuantity(cart, 0, -2)).toEqual([salchipapas('regular')]);
  });

  it('redondea los decimales hacia abajo', () => {
    expect(setQuantity(cart, 0, 2.7)[0].quantity).toBe(2);
    expect(setQuantity(cart, 0, 0.5)).toEqual([salchipapas('regular')]);
  });

  it('ignora un índice fuera de rango', () => {
    expect(setQuantity(cart, 7, 3)).toBe(cart);
  });
});

describe('setNote', () => {
  it('guarda el texto tal cual, con espacios', () => {
    expect(setNote([tipico()], 0, 'sin cebolla ')[0].note).toBe('sin cebolla ');
  });

  it('borra la nota si queda vacía', () => {
    expect(setNote([tipico(1, 'algo')], 0, '  ')[0].note).toBeUndefined();
  });

  it('no combina líneas mientras se escribe la nota', () => {
    const cart = setNote([tipico(1), tipico(1, 'sin pan')], 1, '');
    expect(cart).toHaveLength(2);
    expect(cart[1].quantity).toBe(1);
  });
});

describe('removeLine', () => {
  it('quita la línea indicada', () => {
    expect(removeLine([tipico(), salchipapas('grande')], 0)).toEqual([salchipapas('grande')]);
  });
});

describe('cartTotal e itemCount', () => {
  const cart = [tipico(2), taco(['papas']), salchipapas('grande')];

  it('suma todas las líneas', () => {
    expect(cartTotal(FIXTURE_MENU, cart)).toBe(3600 + 2200 + 3500);
  });

  it('cuenta unidades, no líneas', () => {
    expect(itemCount(cart)).toBe(4);
  });

  it('es 0 con el carrito vacío', () => {
    expect(cartTotal(FIXTURE_MENU, [])).toBe(0);
    expect(itemCount([])).toBe(0);
  });
});

describe('needsPriceConfirmation', () => {
  it('es verdadero si un desayuno trae nota', () => {
    expect(needsPriceConfirmation(FIXTURE_MENU, [tipico(1, 'huevo extra')])).toBe(true);
  });

  it('es falso si el desayuno no trae nota o es de solo espacios', () => {
    expect(needsPriceConfirmation(FIXTURE_MENU, [tipico()])).toBe(false);
    expect(needsPriceConfirmation(FIXTURE_MENU, [tipico(1, '   ')])).toBe(false);
  });

  it('es falso si la nota es de otra sección', () => {
    expect(needsPriceConfirmation(FIXTURE_MENU, [taco([], 1, 'sin repollo')])).toBe(false);
  });
});

describe('con el menú real', () => {
  it('suma papas o aros por ₡1200 y duplicar nachos por ₡2000', async () => {
    const { MENU } = await import('../../../data/menu');
    expect(lineTotal(MENU, { itemId: 'la-boss-burguer', choice: 'Carne', extraIds: ['papas'], quantity: 1 })).toBe(5000);
    expect(lineTotal(MENU, { itemId: 'taco-sencillo', choice: 'Pollo', extraIds: ['papas', 'aros'], quantity: 2 })).toBe(6800);
    expect(lineTotal(MENU, { itemId: 'nachos-de-la-casa', choice: 'Carne', extraIds: ['duplicar'], quantity: 1 })).toBe(5000);
    expect(lineTotal(MENU, { itemId: 'alitas', sizeId: '12', extraIds: ['aros'], quantity: 1 })).toBe(7900);
  });
});
