import { describe, expect, it } from 'vitest';
import type { KeyValueStore } from '../../features/cart/storage';
import { initialLanguage, LANG_STORAGE_KEY, loadLanguage, saveLanguage } from '../language';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const brokenStore: KeyValueStore = {
  getItem: () => {
    throw new Error('bloqueado');
  },
  setItem: () => {
    throw new Error('bloqueado');
  },
};

describe('initialLanguage', () => {
  it('usa primero el idioma guardado', () => {
    expect(initialLanguage('en', 'es-CR')).toBe('en');
    expect(initialLanguage('es', 'en-US')).toBe('es');
  });

  it('sin idioma guardado, usa inglés si el navegador está en inglés', () => {
    expect(initialLanguage(null, 'en-US')).toBe('en');
    expect(initialLanguage(null, 'EN')).toBe('en');
  });

  it('en cualquier otro caso, español', () => {
    expect(initialLanguage(null, 'es-CR')).toBe('es');
    expect(initialLanguage(null, 'fr-FR')).toBe('es');
    expect(initialLanguage(null, undefined)).toBe('es');
    expect(initialLanguage('xx', 'fr')).toBe('es');
  });
});

describe('loadLanguage y saveLanguage', () => {
  it('guarda y lee el idioma con la clave kairos.lang.v1', () => {
    const store = memoryStore();
    saveLanguage(store, 'en');
    expect(store.data).toEqual({ [LANG_STORAGE_KEY]: 'en' });
    expect(LANG_STORAGE_KEY).toBe('kairos.lang.v1');
    expect(loadLanguage(store)).toBe('en');
  });

  it('ignora un valor guardado que no es un idioma', () => {
    expect(loadLanguage(memoryStore({ [LANG_STORAGE_KEY]: 'fr' }))).toBeNull();
  });

  it('sigue funcionando sin almacenamiento o con el almacenamiento bloqueado', () => {
    expect(loadLanguage(null)).toBeNull();
    expect(loadLanguage(brokenStore)).toBeNull();
    expect(() => saveLanguage(brokenStore, 'en')).not.toThrow();
    expect(() => saveLanguage(null, 'en')).not.toThrow();
  });
});
