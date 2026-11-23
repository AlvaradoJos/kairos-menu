// Qué idioma ve el cliente y cómo se recuerda. Lo usa LanguageContext.tsx.
// La elección se guarda en localStorage (clave kairos.lang.v1) para que sobreviva a recargar la página.

import type { KeyValueStore } from '../features/cart/storage';

/** Idiomas de la página. El mensaje al negocio va siempre en español (ADR 0007). */
export type Lang = 'es' | 'en';

export const LANG_STORAGE_KEY = 'kairos.lang.v1';

function isLang(value: unknown): value is Lang {
  return value === 'es' || value === 'en';
}

/**
 * Idioma al abrir la página, en este orden: el que el cliente eligió antes; si no hay,
 * inglés cuando el navegador está en inglés ("en", "en-US"…); si no, español.
 */
export function initialLanguage(stored: string | null, browserLanguage: string | undefined): Lang {
  if (isLang(stored)) return stored;
  if (browserLanguage?.toLowerCase().startsWith('en')) return 'en';
  return 'es';
}

/** Lee el idioma guardado; null si no hay o si el valor no sirve. */
export function loadLanguage(store: KeyValueStore | null): Lang | null {
  if (!store) return null;
  // Con el almacenamiento bloqueado (modo privado, permisos) getItem lanza un error: se ignora.
  try {
    const value = store.getItem(LANG_STORAGE_KEY);
    return isLang(value) ? value : null;
  } catch {
    return null;
  }
}

/** Guarda el idioma. Si no se puede, la página sigue funcionando y solo no lo recuerda. */
export function saveLanguage(store: KeyValueStore | null, lang: Lang): void {
  if (!store) return;
  try {
    store.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Almacenamiento lleno o bloqueado.
  }
}
