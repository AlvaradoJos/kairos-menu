import type { MenuSection } from '../features/menu/types';

export const FIXTURE_MENU: MenuSection[] = [
  {
    id: 'desayunos',
    title: 'Desayunos',
    hasUnpricedExtras: true,
    items: [{ id: 'tipico', name: 'Típico', price: 1800 }],
  },
  {
    id: 'tacos',
    title: 'Tacos',
    items: [
      {
        id: 'taco',
        name: 'Taco',
        price: 1000,
        choice: { label: 'Proteína', options: ['Carne', 'Pollo'] },
        extras: [
          { id: 'papas', label: 'Papas fritas', price: 1200 },
          { id: 'aros', label: 'Aros de cebolla', price: 1200 },
        ],
      },
    ],
  },
  {
    id: 'papas',
    title: 'Papas',
    items: [
      {
        id: 'salchipapas',
        name: 'Salchipapas',
        sizes: [
          { id: 'regular', label: 'Regular', price: 2000 },
          { id: 'grande', label: 'Grande', price: 3500 },
        ],
      },
    ],
  },
];
