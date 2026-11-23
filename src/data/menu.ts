// Convierte menu.json (la única fuente de platillos y precios) en los tipos de la app (MENU).
// Lo usan App, el carrito y el mensaje. Para cambiar precios o platillos, editar solo menu.json.
// Los campos _en de menu.json pasan a los campos "En" de los tipos; si faltan, la página muestra el español.

import source from '../../menu.json';
import { formatColones } from '../features/menu/price';
import type { Extra, MenuItem, MenuSection } from '../features/menu/types';
import { en } from '../i18n/en';
import { es } from '../i18n/es';

/** Forma de un platillo en menu.json (nombres de campo en español, como el menú impreso). */
interface SourceItem {
  id: string;
  nombre: string;
  descripcion?: string;
  descripcion_en?: string;
  precio?: number;
  opciones?: { id: string; nombre: string; nombre_en?: string; precio: number }[];
  elegir?: { etiqueta: string; etiqueta_en?: string; opciones: string[]; opciones_en?: string[] };
  por_confirmar?: string;
}

/** Forma de una categoría en menu.json. */
interface SourceSection {
  id: string;
  nombre: string;
  nombre_en?: string;
  nota?: string;
  nota_en?: string;
  adicionales?: { id: string; nombre: string; nombre_en?: string; precio: number }[];
  adicionales_sin_precio?: boolean;
  items: SourceItem[];
}

function toItem(src: SourceItem, extras: Extra[] | undefined): MenuItem {
  const item: MenuItem = { id: src.id, name: src.nombre };
  if (src.descripcion) item.description = src.descripcion;
  if (src.descripcion_en) item.descriptionEn = src.descripcion_en;
  if (src.opciones) {
    item.sizes = src.opciones.map((o) => ({ id: o.id, label: o.nombre, labelEn: o.nombre_en, price: o.precio }));
  } else {
    item.price = src.precio;
  }
  if (src.elegir) {
    item.choice = {
      label: src.elegir.etiqueta,
      labelEn: src.elegir.etiqueta_en,
      options: src.elegir.opciones,
      optionsEn: src.elegir.opciones_en,
    };
  }
  if (extras) item.extras = extras;
  if (src.por_confirmar) item.pending = src.por_confirmar;
  return item;
}

/**
 * Arma la nota de una sección en un idioma: cambia {precio} por el precio del primer adicional,
 * le pone punto final y, si los adicionales no tienen precio, agrega cómo pedirlos.
 */
function buildNote(text: string | undefined, src: SourceSection, extras: Extra[] | undefined, hint: string) {
  if (!text) return undefined;
  const note = extras ? text.replace('{precio}', formatColones(extras[0].price)) : text;
  const withPeriod = /[.!]$/.test(note) ? note : `${note}.`;
  return src.adicionales_sin_precio ? `${withPeriod} ${hint}` : withPeriod;
}

function toSection(src: SourceSection): MenuSection {
  const extras = src.adicionales?.map((a) => ({ id: a.id, label: a.nombre, labelEn: a.nombre_en, price: a.precio }));
  const section: MenuSection = {
    id: src.id,
    title: src.nombre,
    items: src.items.map((i) => toItem(i, extras)),
  };
  if (src.nombre_en) section.titleEn = src.nombre_en;
  const note = buildNote(src.nota, src, extras, es.menu.unpricedExtrasHint);
  if (note) section.note = note;
  const noteEn = buildNote(src.nota_en, src, extras, en.menu.unpricedExtrasHint);
  if (noteEn) section.noteEn = noteEn;
  if (src.adicionales_sin_precio) section.hasUnpricedExtras = true;
  return section;
}

/** El menú completo, en el orden del menú impreso. */
export const MENU: MenuSection[] = (source.categorias as SourceSection[]).map(toSection);
