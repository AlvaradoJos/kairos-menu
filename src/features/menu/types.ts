/** Colones enteros, sin decimales. */
export type Colones = number;

export interface Size {
  id: string;
  label: string;
  price: Colones;
}

export interface Extra {
  id: string;
  label: string;
  price: Colones;
}

/** Elección que no cambia el precio, p. ej. carne o pollo. */
export interface Choice {
  label: string;
  options: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
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
  items: MenuItem[];
  /** Aviso al final de la sección. */
  note?: string;
  /** La sección ofrece adicionales sin lista de precios (se piden en las notas). */
  hasUnpricedExtras?: boolean;
}
