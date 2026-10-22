import { describe, expect, it } from 'vitest';
import { FIXTURE_MENU } from '../../../test/fixtureMenu';
import type { CartLine } from '../cart';
import { CART_STORAGE_KEY, loadCart, saveCart, type KeyValueStore } from '../storage';

function memoryStore(initial?: string): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(CART_STORAGE_KEY, initial);
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error('bloqueado');
  },
  setItem: () => {
    throw new Error('lleno');
  },
};

const tipico: CartLine = { itemId: 'tipico', extraIds: [], quantity: 2 };
const taco: CartLine = { itemId: 'taco', choice: 'Pollo', extraIds: ['papas'], quantity: 1, note: 'sin repollo' };

describe('saveCart y loadCart', () => {
  it('guarda y recupera el carrito', () => {
    const store = memoryStore();
    saveCart(store, [tipico, taco]);
    expect(loadCart(store, FIXTURE_MENU)).toEqual([tipico, taco]);
  });

  it('devuelve un carrito vacío si no hay nada guardado', () => {
    expect(loadCart(memoryStore(), FIXTURE_MENU)).toEqual([]);
  });

  it('funciona sin almacenamiento disponible', () => {
    expect(loadCart(null, FIXTURE_MENU)).toEqual([]);
    expect(() => saveCart(null, [tipico])).not.toThrow();
  });

  it('no se rompe si el almacenamiento lanza errores', () => {
    expect(loadCart(throwingStore, FIXTURE_MENU)).toEqual([]);
    expect(() => saveCart(throwingStore, [tipico])).not.toThrow();
  });

  it('ignora JSON dañado', () => {
    expect(loadCart(memoryStore('{no es json'), FIXTURE_MENU)).toEqual([]);
  });

  it('ignora datos que no son una lista', () => {
    expect(loadCart(memoryStore('{"itemId":"tipico"}'), FIXTURE_MENU)).toEqual([]);
  });

  it('descarta líneas inválidas y conserva las válidas', () => {
    const raw = JSON.stringify([
      tipico,
      { itemId: 'no-existe', extraIds: [], quantity: 1 },
      { itemId: 'salchipapas', sizeId: 'mediana', extraIds: [], quantity: 1 },
      { itemId: 'tipico', extraIds: [], quantity: 0 },
      { itemId: 'tipico', extraIds: [], quantity: 1.5 },
      { itemId: 'tipico', extraIds: 'papas', quantity: 1 },
      { itemId: 'tipico', extraIds: [], quantity: 1, note: 42 },
      null,
      'texto',
    ]);
    expect(loadCart(memoryStore(raw), FIXTURE_MENU)).toEqual([tipico]);
  });

  it('combina líneas repetidas al cargar', () => {
    const raw = JSON.stringify([tipico, tipico]);
    expect(loadCart(memoryStore(raw), FIXTURE_MENU)).toEqual([{ ...tipico, quantity: 4 }]);
  });
});
