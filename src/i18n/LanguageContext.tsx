// Contexto del idioma: guarda qué idioma eligió el cliente y entrega el diccionario a los componentes.
// main.tsx envuelve la app con <LanguageProvider>; cada componente llama useLanguage().
// Sin provider (por ejemplo en una prueba de un solo componente) se usa español.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { browserStore } from '../features/cart/storage';
import { en } from './en';
import { es, type Dictionary } from './es';
import { initialLanguage, loadLanguage, saveLanguage, type Lang } from './language';

const DICTIONARIES: Record<Lang, Dictionary> = { es, en };

interface LanguageValue {
  lang: Lang;
  setLang(lang: Lang): void;
  /** Diccionario del idioma actual: t.order.title, t.menu.add(nombre)… */
  t: Dictionary;
}

const LanguageContext = createContext<LanguageValue>({ lang: 'es', setLang: () => {}, t: es });

/** Da el idioma a toda la app, lo recuerda en localStorage y actualiza <html lang> y el título. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [store] = useState(browserStore);
  const [lang, setLang] = useState<Lang>(() =>
    initialLanguage(loadLanguage(store), typeof navigator === 'undefined' ? undefined : navigator.language),
  );

  useEffect(() => {
    // El lector de pantalla usa <html lang> para pronunciar bien el texto.
    document.documentElement.lang = lang;
    document.title = DICTIONARIES[lang].meta.title;
  }, [lang]);

  // Se guarda solo cuando el cliente elige con el botón. El idioma que vino del navegador no se guarda:
  // si después cambia el idioma del celular, la página lo sigue.
  function chooseLanguage(next: Lang) {
    saveLanguage(store, next);
    setLang(next);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: chooseLanguage, t: DICTIONARIES[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Idioma actual, la función para cambiarlo y el diccionario (`t`). */
export function useLanguage(): LanguageValue {
  return useContext(LanguageContext);
}
