// Tipos del menú que usa toda la app. Los arma src/data/menu.ts a partir de menu.json.
// Los campos que terminan en "En" son el texto en inglés: opcionales; si faltan, se muestra el español.

/** Colones enteros, sin decimales. */
export type Colones = number;

export interface Size {
  id: string;
  label: string;
  labelEn?: string;
  price: Colones;
}

export interface Extra {
  id: string;
  label: string;
  labelEn?: string;
  price: Colones;
}

/** Elección que no cambia el precio, p. ej. carne o pollo. El carrito guarda la opción en español. */
export interface Choice {
  label: string;
  labelEn?: string;
  options: string[];
  /** Misma posición que `options`: optionsEn[i] es la traducción de options[i]. */
  optionsEn?: string[];
}

export interface MenuItem {
  id: string;
  /** Nombre propio del menú impreso: no se traduce. */
  name: string;
  description?: string;
  descriptionEn?: string;
  /** Precio fijo. Ausente si el platillo tiene `sizes`. */
  price?: Colones;
  sizes?: Size[];
  choice?: Choice;
  extras?: Extra[];
  /** Precio que el negocio todavía no confirma; el texto explica la duda. */
  pending?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  titleEn?: string;
  items: MenuItem[];
  /** Aviso al final de la sección. */
  note?: string;
  noteEn?: string;
  /** La sección ofrece adicionales sin lista de precios (se piden en las notas). */
  hasUnpricedExtras?: boolean;
}
