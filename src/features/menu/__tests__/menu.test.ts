import { describe, expect, it } from 'vitest';
import { MENU } from '../../../data/menu';
import source from '../../../../menu.json';

const allItems = MENU.flatMap((s) => s.items);

function isPositiveInteger(n: unknown): boolean {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

describe('MENU', () => {
  it('tiene las 11 secciones del menú impreso, en orden', () => {
    expect(MENU.map((s) => s.title)).toEqual([
      'Desayunos',
      'Almuerzos',
      'Sándwich',
      'Tacos',
      'Nachos',
      'Burritos',
      'Quesadillas',
      'Antojitos',
      'Papas fritas',
      'Pollo Frito',
      'Hamburguesas',
    ]);
  });

  it('tiene los 51 platillos del menú impreso', () => {
    expect(allItems).toHaveLength(51);
  });

  it('cada platillo tiene price o sizes, nunca los dos ni ninguno', () => {
    for (const item of allItems) {
      expect(item.price === undefined, item.id).not.toBe(item.sizes === undefined);
    }
  });

  it('todos los precios son enteros positivos', () => {
    for (const item of allItems) {
      if (item.price !== undefined) expect(isPositiveInteger(item.price), item.id).toBe(true);
      for (const size of item.sizes ?? []) expect(isPositiveInteger(size.price), `${item.id}/${size.id}`).toBe(true);
      for (const extra of item.extras ?? []) expect(isPositiveInteger(extra.price), `${item.id}/${extra.id}`).toBe(true);
    }
  });

  it('no repite ids de sección ni de platillo', () => {
    const sectionIds = MENU.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const itemIds = allItems.map((i) => i.id);
    expect(new Set(itemIds).size).toBe(itemIds.length);
  });

  it('no repite ids de tamaño ni de adicional dentro de un platillo', () => {
    for (const item of allItems) {
      const sizeIds = (item.sizes ?? []).map((s) => s.id);
      expect(new Set(sizeIds).size, item.id).toBe(sizeIds.length);
      const extraIds = (item.extras ?? []).map((e) => e.id);
      expect(new Set(extraIds).size, item.id).toBe(extraIds.length);
    }
  });

  it('las elecciones tienen al menos dos opciones', () => {
    for (const item of allItems) {
      if (item.choice) expect(item.choice.options.length, item.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('nombres y precios salen tal cual de menu.json', () => {
    const fromJson = source.categorias.flatMap((c) =>
      c.items.map((i) => ({
        name: i.nombre,
        prices: 'opciones' in i && i.opciones ? i.opciones.map((o) => o.precio) : [i.precio],
      })),
    );
    expect(allItems.map((i) => ({ name: i.name, prices: i.sizes ? i.sizes.map((s) => s.price) : [i.price] }))).toEqual(
      fromJson,
    );
  });

  it('respeta precios puntuales del menú impreso', () => {
    const byId = new Map(allItems.map((i) => [i.id, i]));
    expect(byId.get('la-rascacielos')?.price).toBe(3800);
    expect(byId.get('papas-fritas')?.sizes).toEqual([
      { id: 'regular', label: 'Regulares', price: 1000 },
      { id: 'grande', label: 'Grandes', price: 2700 },
    ]);
    expect(byId.get('alitas')?.sizes?.map((s) => s.price)).toEqual([3500, 6700, 9900]);
    expect(byId.get('bacon-cheese')?.choice?.options).toEqual(['Carne', 'Pechuga de pollo']);
  });

  it('ofrece papas o aros por ₡1200 y duplicar nachos por ₡2000 donde lo dice el menú', () => {
    const extrasOf = (sectionId: string) =>
      MENU.find((s) => s.id === sectionId)!.items.map((i) => i.extras?.map((e) => `${e.id}:${e.price}`));
    for (const id of ['tacos', 'quesadillas', 'pollo-frito', 'hamburguesas']) {
      for (const extras of extrasOf(id)) expect(extras, id).toEqual(['papas:1200', 'aros:1200']);
    }
    for (const extras of extrasOf('nachos')) expect(extras).toEqual(['duplicar:2000']);
    for (const id of ['desayunos', 'almuerzos', 'sandwich', 'burritos', 'antojitos', 'papas']) {
      for (const extras of extrasOf(id)) expect(extras, id).toBeUndefined();
    }
  });

  it('marca como por confirmar los precios que Jose no ha confirmado', () => {
    expect(allItems.filter((i) => i.pending).map((i) => i.id)).toEqual(['papas-fritas', 'la-rascacielos']);
  });

  it('arma las notas de sección con el precio del adicional, ya formateado', () => {
    const noteOf = (id: string) => MENU.find((s) => s.id === id)?.note;
    expect(noteOf('tacos')).toBe('Agrégale papas fritas o aros de cebolla por ₡1.200 adicionales.');
    expect(noteOf('nachos')).toBe('Duplicá su tamaño por ₡2.000 adicionales.');
    expect(noteOf('desayunos')).toBe(
      '¡Agrégale adicionales desde los 500 colones! Pídelos en las notas de tu pedido y te confirmamos el precio.',
    );
    expect(noteOf('almuerzos')).toBeUndefined();
  });

  it('solo Desayunos marca adicionales sin precio', () => {
    expect(MENU.filter((s) => s.hasUnpricedExtras).map((s) => s.id)).toEqual(['desayunos']);
  });
});
