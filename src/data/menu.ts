import source from '../../menu.json';
import { formatColones } from '../features/menu/price';
import type { Extra, MenuItem, MenuSection } from '../features/menu/types';

// Fuente: menu.json en la raíz del repo. Para cambiar precios o platillos, editar solo ese archivo.

interface SourceItem {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  opciones?: { id: string; nombre: string; precio: number }[];
  elegir?: { etiqueta: string; opciones: string[] };
  por_confirmar?: string;
}

interface SourceSection {
  id: string;
  nombre: string;
  nota?: string;
  adicionales?: { id: string; nombre: string; precio: number }[];
  adicionales_sin_precio?: boolean;
  items: SourceItem[];
}

const UNPRICED_EXTRAS_HINT = 'Pídelos en las notas de tu pedido y te confirmamos el precio.';

function toItem(src: SourceItem, extras: Extra[] | undefined): MenuItem {
  const item: MenuItem = { id: src.id, name: src.nombre };
  if (src.descripcion) item.description = src.descripcion;
  if (src.opciones) item.sizes = src.opciones.map((o) => ({ id: o.id, label: o.nombre, price: o.precio }));
  else item.price = src.precio;
  if (src.elegir) item.choice = { label: src.elegir.etiqueta, options: src.elegir.opciones };
  if (extras) item.extras = extras;
  if (src.por_confirmar) item.pending = src.por_confirmar;
  return item;
}

function sectionNote(src: SourceSection, extras: Extra[] | undefined): string | undefined {
  if (!src.nota) return undefined;
  const note = extras ? src.nota.replace('{precio}', formatColones(extras[0].price)) : src.nota;
  const withPeriod = /[.!]$/.test(note) ? note : `${note}.`;
  return src.adicionales_sin_precio ? `${withPeriod} ${UNPRICED_EXTRAS_HINT}` : withPeriod;
}

function toSection(src: SourceSection): MenuSection {
  const extras = src.adicionales?.map((a) => ({ id: a.id, label: a.nombre, price: a.precio }));
  const section: MenuSection = {
    id: src.id,
    title: src.nombre,
    items: src.items.map((i) => toItem(i, extras)),
  };
  const note = sectionNote(src, extras);
  if (note) section.note = note;
  if (src.adicionales_sin_precio) section.hasUnpricedExtras = true;
  return section;
}

export const MENU: MenuSection[] = (source.categorias as SourceSection[]).map(toSection);
