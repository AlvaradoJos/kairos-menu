// Escoge el texto del menú en el idioma de la página. Lo usan los componentes que muestran el menú.
// Los datos vienen de MENU (src/data/menu.ts). Si falta el inglés, se muestra el español.
// El carrito y el mensaje no usan esto: guardan y mandan los valores en español.

import type { Choice, Extra, MenuItem, MenuSection, Size } from '../features/menu/types';
import type { Lang } from './language';

function pick(spanish: string, english: string | undefined, lang: Lang): string {
  return lang === 'en' && english ? english : spanish;
}

/** Nombre de la categoría. */
export function sectionTitle(section: MenuSection, lang: Lang): string {
  return pick(section.title, section.titleEn, lang);
}

/** Aviso al final de la categoría, si tiene. */
export function sectionNote(section: MenuSection, lang: Lang): string | undefined {
  if (!section.note) return undefined;
  return pick(section.note, section.noteEn, lang);
}

/** Descripción del platillo, si tiene. El nombre del platillo no se traduce. */
export function itemDescription(item: MenuItem, lang: Lang): string | undefined {
  if (!item.description) return undefined;
  return pick(item.description, item.descriptionEn, lang);
}

/** Nombre de un tamaño, p. ej. "Regulares" / "Regular". */
export function sizeLabel(size: Size, lang: Lang): string {
  return pick(size.label, size.labelEn, lang);
}

/** Nombre de un adicional, p. ej. "Papas fritas" / "Fries". */
export function extraLabel(extra: Extra, lang: Lang): string {
  return pick(extra.label, extra.labelEn, lang);
}

/** Título de la elección, p. ej. "Proteína" / "Protein". */
export function choiceLabel(choice: Choice, lang: Lang): string {
  return pick(choice.label, choice.labelEn, lang);
}

/**
 * Traduce una opción de la elección. El carrito guarda la opción en español ("Pollo"),
 * así que se busca su posición en `options` y se toma la misma posición en `optionsEn`.
 */
export function choiceOption(choice: Choice, option: string, lang: Lang): string {
  const index = choice.options.indexOf(option);
  return pick(option, index >= 0 ? choice.optionsEn?.[index] : undefined, lang);
}
