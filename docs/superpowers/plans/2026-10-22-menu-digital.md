# Menú digital de Kairos Food's — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Una página web estática, pensada primero para celular, donde los clientes ven el menú de Kairos Food's, arman su pedido y lo envían ya redactado al WhatsApp del restaurante.

**Architecture:** Sitio estático con Vite + React + TypeScript. Toda la lógica (menú, carrito, validación, totales, mensaje) son funciones puras en `src/features/*` con pruebas en `__tests__/`. Los componentes de `src/components/` solo muestran datos y llaman a esas funciones. El menú vive en `src/data/menu.ts` y los datos del negocio en `src/config.ts`.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library (jsdom), CSS plano con variables.

**Spec:** `docs/superpowers/specs/2026-10-22-menu-digital-design.md`

**Dónde correr los comandos:** todos los comandos se corren en Git Bash desde la raíz del repo, `C:\Users\eljos\Downloads\kairos` (`cd /c/Users/eljos/Downloads/kairos`).

## Global Constraints

- Precios en colones enteros, sin decimales; se muestran como `₡3800` (sin separador de miles, igual que el menú impreso).
- Cada platillo tiene `price` o `sizes`, nunca los dos ni ninguno.
- Los componentes no calculan precios ni arman el texto del pedido: todo sale de `src/features/*`.
- Los colores salen de variables CSS en `src/styles/tokens.css`; no hay valores hex fuera de ese archivo.
- No se inventan datos del negocio: WhatsApp, costo de envío, horario, dirección y redes quedan `undefined` / vacíos en `src/config.ts` hasta que el dueño los dé.
- Mientras `whatsappNumber` no esté definido, el botón de enviar queda desactivado con el texto "Número pendiente".
- El carrito nunca se vacía solo; solo con "Sí, vaciar carrito".
- Nombres del menú impreso con estas correcciones: "Chesse" → "Cheese", "mozarella" → "mozzarella", "Tortillas frita" → "Tortillas fritas". "Burguer" se mantiene.
- Pensado primero para celular: campos con `font-size: 16px` (evita el zoom de iOS), botones táctiles de al menos 44px.
- Antes de cada commit con código: `npm test` y `npm run typecheck` en verde.

## Review Focus

1. **Carrito guardado cuando cambia un precio:** el carrito guarda solo ids, así que al recargar el total debe usar el precio actual del menú, no uno viejo. Prueba en Task 2.
2. **`localStorage` dañado o bloqueado** (modo privado, JSON corrupto, datos de una versión vieja): la página arranca con el carrito vacío o con las líneas válidas, sin romperse. Pruebas en Task 3.
3. **Campos con solo espacios** en nombre o dirección: cuentan como vacíos. Pruebas en Task 4.
4. **Caracteres especiales en notas, dirección o comentario** (`&`, `#`, `ñ`, emoji, saltos de línea) y número con `+`, espacios o guiones: el link de WhatsApp sigue siendo válido y el texto llega idéntico. Pruebas en Task 5.
5. **Cantidad bajada a 0, negativa o con decimales:** 0 o menos quita la línea; los decimales se redondean hacia abajo. Pruebas en Task 2.

---

### Task 1: Proyecto base y datos del menú

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`
- Create: `public/logo.png` (copia de `assets/brand/logo.png`)
- Create: `src/features/menu/types.ts`, `src/features/menu/price.ts`, `src/data/menu.ts`
- Test: `src/features/menu/__tests__/menu.test.ts`, `src/features/menu/__tests__/price.test.ts`

**Interfaces:**
- Produces:
  - `type Colones = number`
  - `interface Size { id: string; label: string; price: Colones }`
  - `interface Extra { id: string; label: string; price: Colones }`
  - `interface Choice { label: string; options: string[] }`
  - `interface MenuItem { id: string; name: string; description?: string; price?: Colones; sizes?: Size[]; choice?: Choice; extras?: Extra[] }`
  - `interface MenuSection { id: string; title: string; items: MenuItem[]; note?: string; hasUnpricedExtras?: boolean }`
  - `MENU: MenuSection[]` (en `src/data/menu.ts`)
  - `formatColones(amount: Colones): string`, `displayPrice(item: MenuItem): string`, `hasOptions(item: MenuItem): boolean` (en `src/features/menu/price.ts`)

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "kairos-menu",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest
```

Expected: termina sin errores y crea `package-lock.json`.

- [ ] **Step 3: Crear archivos de configuración**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

`.gitignore`:

```
node_modules
dist
```

`index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Menú de Kairos Food's. Pide desde tu celular y envía tu pedido por WhatsApp." />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Poppins:wght@400;600;700;800&display=swap"
    />
    <title>Kairos Food's · Menú</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (temporal; Task 6 lo reemplaza):

```tsx
export default function App() {
  return <img src="/logo.png" alt="Kairos Food's" width={220} height={220} />;
}
```

Copiar el logo:

```bash
mkdir -p public && cp assets/brand/logo.png public/logo.png
```

- [ ] **Step 4: Verificar que compila**

Run: `npm run build`
Expected: termina con `✓ built in ...` y crea `dist/`.

- [ ] **Step 5: Escribir las pruebas del menú (fallan)**

`src/features/menu/__tests__/menu.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { MENU } from '../../../data/menu';

const allItems = MENU.flatMap((s) => s.items);

function isPositiveInteger(n: unknown): boolean {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

describe('MENU', () => {
  it('tiene las 11 secciones del menú impreso, en orden', () => {
    expect(MENU.map((s) => s.title)).toEqual([
      'Desayunos',
      'Almuerzos',
      'Sándwich',
      'Tacos',
      'Nachos',
      'Burritos',
      'Quesadillas',
      'Antojitos',
      'Papas fritas',
      'Pollo frito',
      'Hamburguesas',
    ]);
  });

  it('tiene los 51 platillos del menú impreso', () => {
    expect(allItems).toHaveLength(51);
  });

  it('cada platillo tiene price o sizes, nunca los dos ni ninguno', () => {
    for (const item of allItems) {
      expect(item.price === undefined, item.id).not.toBe(item.sizes === undefined);
    }
  });

  it('todos los precios son enteros positivos', () => {
    for (const item of allItems) {
      if (item.price !== undefined) expect(isPositiveInteger(item.price), item.id).toBe(true);
      for (const size of item.sizes ?? []) expect(isPositiveInteger(size.price), `${item.id}/${size.id}`).toBe(true);
      for (const extra of item.extras ?? []) expect(isPositiveInteger(extra.price), `${item.id}/${extra.id}`).toBe(true);
    }
  });

  it('no repite ids de sección ni de platillo', () => {
    const sectionIds = MENU.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    const itemIds = allItems.map((i) => i.id);
    expect(new Set(itemIds).size).toBe(itemIds.length);
  });

  it('no repite ids de tamaño ni de adicional dentro de un platillo', () => {
    for (const item of allItems) {
      const sizeIds = (item.sizes ?? []).map((s) => s.id);
      expect(new Set(sizeIds).size, item.id).toBe(sizeIds.length);
      const extraIds = (item.extras ?? []).map((e) => e.id);
      expect(new Set(extraIds).size, item.id).toBe(extraIds.length);
    }
  });

  it('las elecciones tienen al menos dos opciones', () => {
    for (const item of allItems) {
      if (item.choice) expect(item.choice.options.length, item.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('respeta precios puntuales del menú impreso', () => {
    const byId = new Map(allItems.map((i) => [i.id, i]));
    expect(byId.get('la-rascacielos')?.price).toBe(3800);
    expect(byId.get('papas-fritas')?.sizes).toEqual([
      { id: 'regular', label: 'Regular', price: 1000 },
      { id: 'grande', label: 'Grande', price: 2700 },
    ]);
    expect(byId.get('alitas')?.sizes?.map((s) => s.price)).toEqual([3500, 6700, 9900]);
    expect(byId.get('bacon-cheese')?.choice?.options).toEqual(['Carne', 'Pechuga de pollo']);
  });

  it('solo Desayunos marca adicionales sin precio', () => {
    expect(MENU.filter((s) => s.hasUnpricedExtras).map((s) => s.id)).toEqual(['desayunos']);
  });
});
```

`src/features/menu/__tests__/price.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { displayPrice, formatColones, hasOptions } from '../price';
import type { MenuItem } from '../types';

describe('formatColones', () => {
  it('antepone ₡ y no usa separador de miles', () => {
    expect(formatColones(3800)).toBe('₡3800');
    expect(formatColones(12000)).toBe('₡12000');
  });
});

describe('displayPrice', () => {
  it('muestra el precio fijo', () => {
    expect(displayPrice({ id: 'a', name: 'A', price: 1700 })).toBe('₡1700');
  });

  it('muestra "desde" el tamaño más barato', () => {
    const item: MenuItem = {
      id: 'b',
      name: 'B',
      sizes: [
        { id: 'grande', label: 'Grande', price: 3500 },
        { id: 'regular', label: 'Regular', price: 2000 },
      ],
    };
    expect(displayPrice(item)).toBe('desde ₡2000');
  });
});

describe('hasOptions', () => {
  it('es falso para un platillo simple', () => {
    expect(hasOptions({ id: 'a', name: 'A', price: 1000 })).toBe(false);
  });

  it('es verdadero con tamaños, elección o adicionales', () => {
    expect(hasOptions({ id: 'a', name: 'A', sizes: [{ id: 'r', label: 'R', price: 1 }] })).toBe(true);
    expect(hasOptions({ id: 'a', name: 'A', price: 1, choice: { label: 'P', options: ['X', 'Y'] } })).toBe(true);
    expect(hasOptions({ id: 'a', name: 'A', price: 1, extras: [{ id: 'e', label: 'E', price: 1 }] })).toBe(true);
  });

  it('es falso con una lista de adicionales vacía', () => {
    expect(hasOptions({ id: 'a', name: 'A', price: 1, extras: [] })).toBe(false);
  });
});
```

- [ ] **Step 6: Correr las pruebas y confirmar que fallan**

Run: `npm test`
Expected: FAIL, no se encuentran `../../../data/menu` ni `../price`.

- [ ] **Step 7: Escribir tipos, helpers de precio y el menú**

`src/features/menu/types.ts`:

```ts
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
```

`src/features/menu/price.ts`:

```ts
import type { Colones, MenuItem } from './types';

export function formatColones(amount: Colones): string {
  return `₡${amount}`;
}

export function displayPrice(item: MenuItem): string {
  if (item.sizes && item.sizes.length > 0) {
    return `desde ${formatColones(Math.min(...item.sizes.map((s) => s.price)))}`;
  }
  return formatColones(item.price ?? 0);
}

export function hasOptions(item: MenuItem): boolean {
  return Boolean(item.sizes?.length || item.choice || item.extras?.length);
}
```

`src/data/menu.ts`:

```ts
import type { Choice, Extra, MenuItem, MenuSection, Size } from '../features/menu/types';

// Fuente: docs/MENU.md (transcrito de assets/menu/). Para cambiar precios, editar solo este archivo.

const PAPAS_O_AROS: Extra[] = [
  { id: 'papas', label: 'Papas fritas', price: 1200 },
  { id: 'aros', label: 'Aros de cebolla', price: 1200 },
];
const DUPLICAR: Extra[] = [{ id: 'duplicar', label: 'Duplicar tamaño', price: 2000 }];

const CARNE_POLLO: Choice = { label: 'Proteína', options: ['Carne', 'Pollo'] };
const CARNE_QUESO: Choice = { label: 'Relleno', options: ['Carne', 'Queso'] };
const CARNE_PECHUGA: Choice = { label: 'Proteína', options: ['Carne', 'Pechuga de pollo'] };

const NOTE_PAPAS_O_AROS = 'Agrégale papas fritas o aros de cebolla por ₡1200 adicionales.';

function regularGrande(regular: number, grande: number): Size[] {
  return [
    { id: 'regular', label: 'Regular', price: regular },
    { id: 'grande', label: 'Grande', price: grande },
  ];
}

function unidades(seis: number, doce: number, dieciocho: number): Size[] {
  return [
    { id: '6', label: '6 unidades', price: seis },
    { id: '12', label: '12 unidades', price: doce },
    { id: '18', label: '18 unidades', price: dieciocho },
  ];
}

function withExtras(items: MenuItem[], extras: Extra[]): MenuItem[] {
  return items.map((item) => ({ ...item, extras }));
}

export const MENU: MenuSection[] = [
  {
    id: 'desayunos',
    title: 'Desayunos',
    hasUnpricedExtras: true,
    note: 'Agrégale adicionales desde ₡500. Pídelos en las notas de tu pedido y te confirmamos el precio.',
    items: [
      { id: 'tipico', name: 'Típico', description: 'Pinto, huevo, maduro, pan y café', price: 1800 },
      { id: 'prensadas', name: 'Prensadas', description: 'Tortillas fritas con queso', price: 800 },
      { id: 'tortillas-con-queso', name: 'Tortillas con queso', price: 1500 },
      { id: 'burrito-desayuno', name: 'Burrito', description: 'Tortilla de harina, huevo, gallo pinto y natilla', price: 2000 },
      { id: 'sandwich-desayuno', name: 'Sándwich', description: 'Huevo, queso', price: 1700 },
      { id: 'hamburguesa-desayuno', name: 'Hamburguesa', description: 'Huevo, tocineta, queso', price: 2200 },
    ],
  },
  {
    id: 'almuerzos',
    title: 'Almuerzos',
    items: [
      {
        id: 'casado',
        name: 'Casados',
        description: 'Arroz, frijoles, guarnición, ensalada, plátano maduro, proteína y bebida',
        price: 2950,
      },
      { id: 'plato-del-dia', name: 'Plato del día', description: 'Preguntar por nuestro platillo especial del día', price: 2950 },
    ],
  },
  {
    id: 'sandwich',
    title: 'Sándwich',
    items: [
      {
        id: 'chicken-pizza-sandwich',
        name: 'Chicken Pizza Sándwich',
        description: 'Pan artesanal, pechuga de pollo, tocineta, pepperoni, queso mozzarella y salsa de pizza',
        price: 3800,
      },
      {
        id: 'twister-sandwich',
        name: 'Twister Sándwich',
        description: 'Pan artesanal, carne o pollo mechado, salsa de queso, tomate, lechuga y salsas',
        price: 2500,
        choice: CARNE_POLLO,
      },
      {
        id: 'chicken-philly-sandwich',
        name: 'Chicken Philly Sándwich',
        description: 'Pan artesanal, cebolla y chile dulce a la plancha, queso mozzarella, pechuga de pollo y salsas',
        price: 3800,
      },
      { id: 'jamon-y-queso', name: 'Jamón y Queso', description: 'Pan artesanal, jamón, queso, tomate, lechuga y salsas', price: 2000 },
    ],
  },
  {
    id: 'tacos',
    title: 'Tacos',
    note: NOTE_PAPAS_O_AROS,
    items: withExtras(
      [
        {
          id: 'taco-sencillo',
          name: 'Taco sencillo',
          description: 'Tortilla de maíz, carne o pollo mechado, repollo y salsas',
          price: 1000,
          choice: CARNE_POLLO,
        },
        { id: 'taco-de-queso', name: 'Taco de Queso', description: 'Tortilla de harina, queso, repollo y salsas', price: 1000 },
        {
          id: 'supertaco',
          name: 'Supertaco',
          description: 'Tortilla de maíz grande, carne o pollo mechado, repollo y salsas',
          price: 1850,
          choice: CARNE_POLLO,
        },
        {
          id: 'orden-tacos-de-queso',
          name: 'Orden de tacos de Queso',
          description: '20 taquitos de queso en tortilla de harina acompañados de una salsa chipotle y una ranch',
          price: 4200,
        },
      ],
      PAPAS_O_AROS,
    ),
  },
  {
    id: 'nachos',
    title: 'Nachos',
    note: 'Duplicá su tamaño por ₡2000 adicionales.',
    items: withExtras(
      [
        {
          id: 'nachos-de-la-casa',
          name: 'Nachos de la Casa',
          description: 'Tortilla de maíz, frijoles, pollo o carne mechada, natilla, pico de gallo y salsa de queso',
          price: 3000,
          choice: CARNE_POLLO,
        },
        {
          id: 'nachos-supremos',
          name: 'Nachos Supremos',
          description: 'Tortilla de maíz, frijoles, pollo o carne mechada, natilla, pico de gallo, salsa de queso y queso mozzarella',
          price: 3500,
          choice: CARNE_POLLO,
        },
      ],
      DUPLICAR,
    ),
  },
  {
    id: 'burritos',
    title: 'Burritos',
    items: [
      {
        id: 'burrito-sencillo',
        name: 'Burrito sencillo',
        description: 'Tortilla de harina, pollo o carne, queso mozzarella y frijoles',
        price: 1300,
        choice: CARNE_POLLO,
      },
      {
        id: 'twister-burrito',
        name: 'Twister burrito',
        description: 'Tortilla de harina, carne o pollo mechado, frijoles, tomate, lechuga, salsa de queso',
        price: 2600,
        choice: CARNE_POLLO,
      },
      {
        id: 'pollo-ranch',
        name: 'Pollo Ranch',
        description: 'Tortilla de harina, pechuga de pollo frita, tomate, lechuga, pepinillos, salsa de queso y salsa ranch',
        price: 3000,
      },
      {
        id: 'tejano-bbq',
        name: 'Tejano BBQ',
        description: 'Tortilla de harina, pechuga de pollo frita, tocineta, papas tostadas, salsa de queso y bbq',
        price: 3000,
      },
    ],
  },
  {
    id: 'quesadillas',
    title: 'Quesadillas',
    note: NOTE_PAPAS_O_AROS,
    items: withExtras(
      [
        {
          id: 'quesadilla',
          name: 'Quesadilla de pollo o carne',
          description: 'Tortilla de harina, carne o pollo mechado, queso mozzarella, pico de gallo, natilla y salsa de queso',
          price: 3500,
          choice: CARNE_POLLO,
        },
      ],
      PAPAS_O_AROS,
    ),
  },
  {
    id: 'antojitos',
    title: 'Antojitos',
    items: [
      { id: 'aros-de-cebolla', name: 'Orden de Aros de Cebolla', description: '14 crujientes aros de cebolla', price: 3000 },
      { id: 'enyucados', name: 'Enyucados', description: 'Carne o queso, repollo y salsas', price: 1800, choice: CARNE_QUESO },
      { id: 'empanadas', name: 'Empanadas', price: 1200 },
      {
        id: 'mozzarella-sticks',
        name: 'Mozzarella Sticks',
        description: '6 palitos de mozzarella acompañados de salsa de pizza',
        price: 3500,
      },
      {
        id: 'patacones',
        name: 'Orden de Patacones',
        description: '6 patacones, carne mechada, frijoles molidos y pico de gallo',
        price: 3800,
      },
    ],
  },
  {
    id: 'papas',
    title: 'Papas fritas',
    items: [
      { id: 'papas-fritas', name: 'Papas Fritas', sizes: regularGrande(1000, 2700) },
      { id: 'cheese-papas', name: 'Cheese Papas', description: 'Papas fritas, salsa de queso', sizes: regularGrande(1800, 3000) },
      { id: 'salchipapas', name: 'Salchipapas', description: 'Papas fritas, salchicha y salsas', sizes: regularGrande(2000, 3500) },
      {
        id: 'cheese-bacon-papas',
        name: 'Cheese Bacon Papas',
        description: 'Papas fritas, tocineta y salsa de queso',
        sizes: regularGrande(2500, 4300),
      },
      {
        id: 'papicarne',
        name: 'Papicarne',
        description: 'Papas fritas, carne mechada, pico de gallo y salsas',
        sizes: regularGrande(3000, 5000),
      },
      {
        id: 'papipollo',
        name: 'Papipollo',
        description: 'Papas fritas, pollo mechado, pico de gallo y salsas',
        sizes: regularGrande(3000, 5000),
      },
      {
        id: 'papas-pizza',
        name: 'Papas Pizza',
        description: 'Papas fritas, pepperoni, tocineta y salsa de pizza',
        sizes: regularGrande(3000, 5000),
      },
      {
        id: 'chicken-cheese-papas',
        name: 'Chicken Cheese Papas',
        description: 'Papas fritas, trocitos de pollo, tocineta y salsa de queso',
        sizes: regularGrande(3000, 5000),
      },
    ],
  },
  {
    id: 'pollo-frito',
    title: 'Pollo frito',
    note: NOTE_PAPAS_O_AROS,
    items: withExtras(
      [
        { id: 'alitas', name: 'Alitas', sizes: unidades(3500, 6700, 9900) },
        { id: 'boneless-nuggets', name: 'Boneless-Nuggets', sizes: unidades(3200, 5900, 9000) },
        { id: 'strips-de-pollo', name: 'Strips de Pollo (200 grs)', description: 'Con acompañamiento', price: 4000 },
        { id: 'pollo-frito-2pz', name: 'Pollo Frito (2pz)', price: 1700 },
      ],
      PAPAS_O_AROS,
    ),
  },
  {
    id: 'hamburguesas',
    title: 'Hamburguesas',
    note: NOTE_PAPAS_O_AROS,
    items: withExtras(
      [
        {
          id: 'quesoburguesa',
          name: 'Quesoburguesa',
          description: 'Pan artesanal, torta de carne, queso amarillo, tomate, lechuga, cebolla, salsas',
          price: 1700,
        },
        {
          id: 'doble-quesoburguesa',
          name: 'Doble Quesoburguesa',
          description: 'Pan artesanal, doble torta de carne, queso amarillo, tomate, lechuga, cebolla, salsas',
          price: 2600,
        },
        {
          id: 'burguer-con-jamon',
          name: 'Burguer c/ jamón',
          description: 'Pan artesanal, torta de carne, jamón, queso amarillo, tomate, lechuga, cebolla, salsas',
          price: 1900,
        },
        {
          id: 'pollo-burguer',
          name: 'Pollo burguer',
          description: 'Pan artesanal, pechuga de pollo, queso blanco, lechuga, mayonesa',
          price: 2000,
        },
        {
          id: 'bacon-cheese',
          name: 'Bacon & Cheese',
          description: 'Pan artesanal, torta de carne 150 grs o pechuga de pollo, queso amarillo, tocineta, aros de cebolla y aderezo a elegir',
          price: 3800,
          choice: CARNE_PECHUGA,
        },
        {
          id: 'la-explosiva',
          name: 'La Explosiva',
          description: 'Pan artesanal, torta de carne 150 grs, queso mozzarella, cebolla y hongos asados y mayonesa',
          price: 3800,
        },
        {
          id: 'pollo-crispy-kool',
          name: 'Pollo Crispy Kool',
          description: 'Pan artesanal, pechuga de pollo frita, queso amarillo, ensalada coleslaw, pepinillos, chile dulce y aderezo a elegir',
          price: 3800,
        },
        {
          id: 'la-boss-burguer',
          name: 'La Boss Burguer',
          description: 'Pan artesanal, torta de carne 150 grs o pechuga de pollo, queso amarillo, tomate, lechuga, cebolla y aderezo ranch',
          price: 3800,
          choice: CARNE_PECHUGA,
        },
        {
          id: 'pizza-burguer',
          name: 'Pizza Burguer',
          description: 'Pan artesanal, torta de carne 150 grs o pechuga de pollo, queso mozzarella, tocineta, pepperoni, salsa de pizza',
          price: 3800,
          choice: CARNE_PECHUGA,
        },
        {
          id: 'teriyaki-burguer',
          name: 'Teriyaki Burguer',
          description: 'Pan artesanal, torta de carne de 150 grs, queso amarillo, cebolla y champiñones asados, rodaja de piña, aderezo teriyaki',
          price: 3800,
        },
        {
          id: 'la-rascacielos',
          name: 'La Rascacielos',
          description: 'Pan artesanal, triple torta de carne de 150 grs, triple porción de tocineta, triple porción de queso amarillo, aderezo a elegir',
          price: 3800,
        },
      ],
      PAPAS_O_AROS,
    ),
  },
];
```

- [ ] **Step 8: Correr pruebas y chequeo de tipos**

Run: `npm test && npm run typecheck`
Expected: PASS en las dos suites; `tsc` sin errores.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html .gitignore public src
git commit -m "Proyecto base con Vite y datos del menú" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Lógica del carrito

**Files:**
- Create: `src/features/cart/cart.ts`
- Create: `src/test/fixtureMenu.ts`
- Test: `src/features/cart/__tests__/cart.test.ts`

**Interfaces:**
- Consumes: `MenuSection`, `MenuItem`, `Size`, `Extra`, `Colones` de `src/features/menu/types.ts`.
- Produces (en `src/features/cart/cart.ts`):
  - `interface CartLine { itemId: string; sizeId?: string; choice?: string; extraIds: string[]; note?: string; quantity: number }`
  - `interface ResolvedLine { line: CartLine; section: MenuSection; item: MenuItem; size?: Size; extras: Extra[]; unitBase: Colones }`
  - `resolveLine(menu: MenuSection[], line: CartLine): ResolvedLine | null`
  - `lineTotal(menu: MenuSection[], line: CartLine): Colones`
  - `mergeLines(lines: CartLine[]): CartLine[]`
  - `addLine(cart: CartLine[], line: CartLine): CartLine[]`
  - `setQuantity(cart: CartLine[], index: number, quantity: number): CartLine[]`
  - `setNote(cart: CartLine[], index: number, note: string): CartLine[]`
  - `removeLine(cart: CartLine[], index: number): CartLine[]`
  - `cartTotal(menu: MenuSection[], cart: CartLine[]): Colones`
  - `itemCount(cart: CartLine[]): number`
  - `needsPriceConfirmation(menu: MenuSection[], cart: CartLine[]): boolean`
- Produces (en `src/test/fixtureMenu.ts`): `FIXTURE_MENU: MenuSection[]`

Nota sobre `note`: se guarda tal como lo escribe el cliente (sin recortar) para que se puedan teclear espacios entre palabras. Se recorta solo para comparar líneas y al armar el mensaje. Una nota vacía o de solo espacios se guarda como `undefined`.

- [ ] **Step 1: Crear el menú de prueba**

`src/test/fixtureMenu.ts`:

```ts
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
```

- [ ] **Step 2: Escribir las pruebas (fallan)**

`src/features/cart/__tests__/cart.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { FIXTURE_MENU } from '../../../test/fixtureMenu';
import type { MenuSection } from '../../menu/types';
import {
  addLine,
  cartTotal,
  itemCount,
  lineTotal,
  needsPriceConfirmation,
  removeLine,
  resolveLine,
  setNote,
  setQuantity,
  type CartLine,
} from '../cart';

const tipico = (quantity = 1, note?: string): CartLine => ({ itemId: 'tipico', extraIds: [], quantity, note });
const taco = (extraIds: string[], quantity = 1, note?: string): CartLine => ({
  itemId: 'taco',
  choice: 'Carne',
  extraIds,
  quantity,
  note,
});
const salchipapas = (sizeId: string, quantity = 1): CartLine => ({ itemId: 'salchipapas', sizeId, extraIds: [], quantity });

describe('resolveLine', () => {
  it('encuentra platillo, sección, tamaño y adicionales', () => {
    const r = resolveLine(FIXTURE_MENU, { ...taco(['papas']) });
    expect(r?.item.id).toBe('taco');
    expect(r?.section.id).toBe('tacos');
    expect(r?.extras.map((e) => e.id)).toEqual(['papas']);
    expect(r?.unitBase).toBe(1000);
  });

  it('devuelve null si el platillo no existe', () => {
    expect(resolveLine(FIXTURE_MENU, { itemId: 'no-existe', extraIds: [], quantity: 1 })).toBeNull();
  });

  it('devuelve null si falta el tamaño o no existe', () => {
    expect(resolveLine(FIXTURE_MENU, { itemId: 'salchipapas', extraIds: [], quantity: 1 })).toBeNull();
    expect(resolveLine(FIXTURE_MENU, salchipapas('mediana'))).toBeNull();
  });

  it('devuelve null si trae tamaño un platillo sin tamaños', () => {
    expect(resolveLine(FIXTURE_MENU, { ...tipico(), sizeId: 'grande' })).toBeNull();
  });

  it('devuelve null si la elección falta o no está entre las opciones', () => {
    expect(resolveLine(FIXTURE_MENU, { itemId: 'taco', extraIds: [], quantity: 1 })).toBeNull();
    expect(resolveLine(FIXTURE_MENU, { itemId: 'taco', choice: 'Cerdo', extraIds: [], quantity: 1 })).toBeNull();
  });

  it('devuelve null si trae elección un platillo sin elección', () => {
    expect(resolveLine(FIXTURE_MENU, { ...tipico(), choice: 'Carne' })).toBeNull();
  });

  it('devuelve null si un adicional no existe para ese platillo', () => {
    expect(resolveLine(FIXTURE_MENU, taco(['duplicar']))).toBeNull();
  });
});

describe('lineTotal', () => {
  it('multiplica el precio fijo por la cantidad', () => {
    expect(lineTotal(FIXTURE_MENU, tipico(2))).toBe(3600);
  });

  it('usa el precio del tamaño', () => {
    expect(lineTotal(FIXTURE_MENU, salchipapas('grande'))).toBe(3500);
  });

  it('suma adicionales por unidad', () => {
    expect(lineTotal(FIXTURE_MENU, taco(['papas', 'aros'], 2))).toBe(6800);
  });

  it('es 0 para una línea inválida', () => {
    expect(lineTotal(FIXTURE_MENU, { itemId: 'no-existe', extraIds: [], quantity: 3 })).toBe(0);
  });

  it('usa el precio actual del menú, no uno guardado', () => {
    const line = tipico(1);
    const encarecido: MenuSection[] = FIXTURE_MENU.map((s) =>
      s.id === 'desayunos' ? { ...s, items: [{ id: 'tipico', name: 'Típico', price: 2000 }] } : s,
    );
    expect(lineTotal(FIXTURE_MENU, line)).toBe(1800);
    expect(lineTotal(encarecido, line)).toBe(2000);
  });
});

describe('addLine', () => {
  it('agrega una línea nueva', () => {
    expect(addLine([], tipico())).toEqual([{ itemId: 'tipico', extraIds: [], quantity: 1 }]);
  });

  it('combina líneas iguales aunque los adicionales vengan en otro orden', () => {
    const cart = addLine(addLine([], taco(['aros', 'papas'], 1)), taco(['papas', 'aros'], 2));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
    expect(cart[0].extraIds).toEqual(['aros', 'papas']);
  });

  it('no combina líneas con notas distintas', () => {
    const cart = addLine(addLine([], tipico(1, 'sin pan')), tipico(1));
    expect(cart).toHaveLength(2);
  });

  it('combina notas que solo difieren en espacios', () => {
    const cart = addLine(addLine([], tipico(1, 'sin pan')), tipico(1, '  sin pan '));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('guarda una nota vacía o de solo espacios como undefined', () => {
    expect(addLine([], tipico(1, '   '))[0].note).toBeUndefined();
  });
});

describe('setQuantity', () => {
  const cart = [tipico(2), salchipapas('regular')];

  it('cambia la cantidad', () => {
    expect(setQuantity(cart, 0, 5)[0].quantity).toBe(5);
  });

  it('quita la línea con 0 o menos', () => {
    expect(setQuantity(cart, 0, 0)).toEqual([salchipapas('regular')]);
    expect(setQuantity(cart, 0, -2)).toEqual([salchipapas('regular')]);
  });

  it('redondea los decimales hacia abajo', () => {
    expect(setQuantity(cart, 0, 2.7)[0].quantity).toBe(2);
    expect(setQuantity(cart, 0, 0.5)).toEqual([salchipapas('regular')]);
  });

  it('ignora un índice fuera de rango', () => {
    expect(setQuantity(cart, 7, 3)).toBe(cart);
  });
});

describe('setNote', () => {
  it('guarda el texto tal cual, con espacios', () => {
    expect(setNote([tipico()], 0, 'sin cebolla ')[0].note).toBe('sin cebolla ');
  });

  it('borra la nota si queda vacía', () => {
    expect(setNote([tipico(1, 'algo')], 0, '  ')[0].note).toBeUndefined();
  });

  it('combina con otra línea si queda igual', () => {
    const cart = setNote([tipico(1), tipico(1, 'sin pan')], 1, '');
    expect(cart).toEqual([{ itemId: 'tipico', extraIds: [], quantity: 2 }]);
  });
});

describe('removeLine', () => {
  it('quita la línea indicada', () => {
    expect(removeLine([tipico(), salchipapas('grande')], 0)).toEqual([salchipapas('grande')]);
  });
});

describe('cartTotal e itemCount', () => {
  const cart = [tipico(2), taco(['papas']), salchipapas('grande')];

  it('suma todas las líneas', () => {
    expect(cartTotal(FIXTURE_MENU, cart)).toBe(3600 + 2200 + 3500);
  });

  it('cuenta unidades, no líneas', () => {
    expect(itemCount(cart)).toBe(4);
  });

  it('es 0 con el carrito vacío', () => {
    expect(cartTotal(FIXTURE_MENU, [])).toBe(0);
    expect(itemCount([])).toBe(0);
  });
});

describe('needsPriceConfirmation', () => {
  it('es verdadero si un desayuno trae nota', () => {
    expect(needsPriceConfirmation(FIXTURE_MENU, [tipico(1, 'huevo extra')])).toBe(true);
  });

  it('es falso si el desayuno no trae nota o es de solo espacios', () => {
    expect(needsPriceConfirmation(FIXTURE_MENU, [tipico()])).toBe(false);
    expect(needsPriceConfirmation(FIXTURE_MENU, [tipico(1, '   ')])).toBe(false);
  });

  it('es falso si la nota es de otra sección', () => {
    expect(needsPriceConfirmation(FIXTURE_MENU, [taco([], 1, 'sin repollo')])).toBe(false);
  });
});
```

- [ ] **Step 3: Correr y confirmar que fallan**

Run: `npm test -- src/features/cart`
Expected: FAIL, no se encuentra `../cart`.

- [ ] **Step 4: Implementar `src/features/cart/cart.ts`**

```ts
import type { Colones, Extra, MenuItem, MenuSection, Size } from '../menu/types';

export interface CartLine {
  itemId: string;
  sizeId?: string;
  choice?: string;
  extraIds: string[];
  /** Texto tal como lo escribió el cliente; se recorta al comparar y al enviar. */
  note?: string;
  quantity: number;
}

export interface ResolvedLine {
  line: CartLine;
  section: MenuSection;
  item: MenuItem;
  size?: Size;
  extras: Extra[];
  /** Precio base o del tamaño, por unidad, sin adicionales. */
  unitBase: Colones;
}

export function resolveLine(menu: MenuSection[], line: CartLine): ResolvedLine | null {
  for (const section of menu) {
    const item = section.items.find((i) => i.id === line.itemId);
    if (!item) continue;

    let size: Size | undefined;
    if (item.sizes) {
      size = item.sizes.find((s) => s.id === line.sizeId);
      if (!size) return null;
    } else if (line.sizeId !== undefined) {
      return null;
    }

    if (item.choice) {
      if (line.choice === undefined || !item.choice.options.includes(line.choice)) return null;
    } else if (line.choice !== undefined) {
      return null;
    }

    const extras: Extra[] = [];
    for (const id of line.extraIds) {
      const extra = item.extras?.find((e) => e.id === id);
      if (!extra) return null;
      extras.push(extra);
    }

    return { line, section, item, size, extras, unitBase: size ? size.price : (item.price ?? 0) };
  }
  return null;
}

export function lineTotal(menu: MenuSection[], line: CartLine): Colones {
  const resolved = resolveLine(menu, line);
  if (!resolved) return 0;
  const extrasPrice = resolved.extras.reduce((sum, e) => sum + e.price, 0);
  return (resolved.unitBase + extrasPrice) * line.quantity;
}

function normalize(line: CartLine): CartLine {
  const normalized: CartLine = {
    itemId: line.itemId,
    extraIds: [...new Set(line.extraIds)].sort(),
    quantity: line.quantity,
  };
  if (line.sizeId !== undefined) normalized.sizeId = line.sizeId;
  if (line.choice !== undefined) normalized.choice = line.choice;
  if (line.note !== undefined && line.note.trim() !== '') normalized.note = line.note;
  return normalized;
}

function lineKey(line: CartLine): string {
  return JSON.stringify([line.itemId, line.sizeId ?? null, line.choice ?? null, line.extraIds, line.note?.trim() ?? null]);
}

/** Normaliza las líneas y combina las iguales sumando cantidades, respetando el orden. */
export function mergeLines(lines: CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();
  for (const raw of lines) {
    const line = normalize(raw);
    const key = lineKey(line);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, { ...existing, quantity: existing.quantity + line.quantity });
    } else {
      merged.set(key, line);
    }
  }
  return [...merged.values()];
}

export function addLine(cart: CartLine[], line: CartLine): CartLine[] {
  return mergeLines([...cart, line]);
}

export function setQuantity(cart: CartLine[], index: number, quantity: number): CartLine[] {
  if (index < 0 || index >= cart.length) return cart;
  const whole = Math.floor(quantity);
  if (!Number.isFinite(whole) || whole < 1) return removeLine(cart, index);
  return cart.map((line, i) => (i === index ? { ...line, quantity: whole } : line));
}

export function setNote(cart: CartLine[], index: number, note: string): CartLine[] {
  if (index < 0 || index >= cart.length) return cart;
  return mergeLines(cart.map((line, i) => (i === index ? { ...line, note } : line)));
}

export function removeLine(cart: CartLine[], index: number): CartLine[] {
  return cart.filter((_, i) => i !== index);
}

export function cartTotal(menu: MenuSection[], cart: CartLine[]): Colones {
  return cart.reduce((sum, line) => sum + lineTotal(menu, line), 0);
}

export function itemCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function needsPriceConfirmation(menu: MenuSection[], cart: CartLine[]): boolean {
  return cart.some((line) => {
    if (!line.note?.trim()) return false;
    return resolveLine(menu, line)?.section.hasUnpricedExtras === true;
  });
}
```

- [ ] **Step 5: Correr pruebas y tipos**

Run: `npm test && npm run typecheck`
Expected: PASS; `tsc` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/features/cart src/test
git commit -m "Lógica del carrito con tamaños, adicionales y notas" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Guardar el carrito en el celular

**Files:**
- Create: `src/features/cart/storage.ts`, `src/features/cart/useCart.ts`
- Test: `src/features/cart/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: `CartLine`, `resolveLine`, `mergeLines`, `addLine`, `setQuantity`, `setNote`, `cartTotal`, `itemCount` de `src/features/cart/cart.ts`.
- Produces (en `storage.ts`):
  - `CART_STORAGE_KEY = 'kairos.cart.v1'`
  - `interface KeyValueStore { getItem(key: string): string | null; setItem(key: string, value: string): void }`
  - `loadCart(store: KeyValueStore | null, menu: MenuSection[]): CartLine[]`
  - `saveCart(store: KeyValueStore | null, cart: CartLine[]): void`
  - `browserStore(): KeyValueStore | null`
- Produces (en `useCart.ts`):
  - `useCart(menu: MenuSection[]): { lines: CartLine[]; total: Colones; count: number; add(line: CartLine): void; setQuantity(index: number, quantity: number): void; setNote(index: number, note: string): void; clear(): void }`

- [ ] **Step 1: Escribir las pruebas (fallan)**

`src/features/cart/__tests__/storage.test.ts`:

```ts
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
```

- [ ] **Step 2: Correr y confirmar que fallan**

Run: `npm test -- src/features/cart/__tests__/storage.test.ts`
Expected: FAIL, no se encuentra `../storage`.

- [ ] **Step 3: Implementar `src/features/cart/storage.ts`**

```ts
import type { MenuSection } from '../menu/types';
import { mergeLines, resolveLine, type CartLine } from './cart';

export const CART_STORAGE_KEY = 'kairos.cart.v1';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function toLine(value: unknown): CartLine | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.itemId !== 'string') return null;
  if (!isOptionalString(v.sizeId) || !isOptionalString(v.choice) || !isOptionalString(v.note)) return null;
  if (!Array.isArray(v.extraIds) || !v.extraIds.every((id) => typeof id === 'string')) return null;
  if (typeof v.quantity !== 'number' || !Number.isInteger(v.quantity) || v.quantity < 1) return null;
  return {
    itemId: v.itemId,
    sizeId: v.sizeId,
    choice: v.choice,
    extraIds: v.extraIds as string[],
    note: v.note,
    quantity: v.quantity,
  };
}

/** Lee el carrito guardado. Ante cualquier problema devuelve solo las líneas que siguen siendo válidas. */
export function loadCart(store: KeyValueStore | null, menu: MenuSection[]): CartLine[] {
  if (!store) return [];
  let raw: string | null;
  try {
    raw = store.getItem(CART_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines = data
    .map(toLine)
    .filter((line): line is CartLine => line !== null && resolveLine(menu, line) !== null);
  return mergeLines(lines);
}

export function saveCart(store: KeyValueStore | null, cart: CartLine[]): void {
  if (!store) return;
  try {
    store.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Almacenamiento lleno o bloqueado: el carrito sigue funcionando en memoria.
  }
}

/** `localStorage` si está disponible; `null` en modo privado o con el almacenamiento bloqueado. */
export function browserStore(): KeyValueStore | null {
  try {
    const store = window.localStorage;
    store.getItem(CART_STORAGE_KEY);
    return store;
  } catch {
    return null;
  }
}
```

Nota: `mergeLines` (vía `normalize`) quita las claves `undefined` de `sizeId`, `choice` y `note`, así que el resultado coincide con `toEqual` en las pruebas.

- [ ] **Step 4: Implementar `src/features/cart/useCart.ts`**

```ts
import { useEffect, useState } from 'react';
import type { MenuSection } from '../menu/types';
import * as Cart from './cart';
import { browserStore, loadCart, saveCart } from './storage';

export function useCart(menu: MenuSection[]) {
  const [store] = useState(browserStore);
  const [lines, setLines] = useState(() => loadCart(store, menu));

  useEffect(() => {
    saveCart(store, lines);
  }, [store, lines]);

  return {
    lines,
    total: Cart.cartTotal(menu, lines),
    count: Cart.itemCount(lines),
    add: (line: Cart.CartLine) => setLines((current) => Cart.addLine(current, line)),
    setQuantity: (index: number, quantity: number) => setLines((current) => Cart.setQuantity(current, index, quantity)),
    setNote: (index: number, note: string) => setLines((current) => Cart.setNote(current, index, note)),
    clear: () => setLines([]),
  };
}
```

- [ ] **Step 5: Correr pruebas y tipos**

Run: `npm test && npm run typecheck`
Expected: PASS; `tsc` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/features/cart
git commit -m "Guardar el carrito en el celular" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Formulario del pedido y totales

**Files:**
- Create: `src/features/order-form/validation.ts`, `src/features/order-form/totals.ts`
- Test: `src/features/order-form/__tests__/validation.test.ts`, `src/features/order-form/__tests__/totals.test.ts`

**Interfaces:**
- Consumes: `CartLine`, `cartTotal`, `needsPriceConfirmation` de `src/features/cart/cart.ts`; `Colones`, `MenuSection`.
- Produces (en `validation.ts`):
  - `type OrderType = 'recoger' | 'express'`
  - `type PaymentMethod = 'efectivo' | 'sinpe' | 'tarjeta'`
  - `interface OrderForm { name: string; type: OrderType | ''; address: string; reference: string; pickupTime: string; payment: PaymentMethod | ''; comment: string }`
  - `EMPTY_FORM: OrderForm`
  - `type FormErrors = Partial<Record<'name' | 'type' | 'address' | 'payment', string>>`
  - `validateOrderForm(form: OrderForm): FormErrors`
  - `hasErrors(errors: FormErrors): boolean`
  - `ORDER_TYPE_LABEL: Record<OrderType, string>`, `PAYMENT_LABEL: Record<PaymentMethod, string>`
- Produces (en `totals.ts`):
  - `deliveryFeeFor(form: OrderForm, deliveryFee: Colones | undefined): Colones | undefined`
  - `orderTotal(menu: MenuSection[], cart: CartLine[], form: OrderForm, deliveryFee: Colones | undefined): Colones`
  - `orderWarnings(menu: MenuSection[], cart: CartLine[], form: OrderForm, deliveryFee: Colones | undefined): string[]`

- [ ] **Step 1: Escribir las pruebas (fallan)**

`src/features/order-form/__tests__/validation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, hasErrors, validateOrderForm, type OrderForm } from '../validation';

const valid: OrderForm = { ...EMPTY_FORM, name: 'Ana', type: 'recoger', payment: 'efectivo' };

describe('validateOrderForm', () => {
  it('marca nombre, tipo y pago en un formulario vacío', () => {
    expect(validateOrderForm(EMPTY_FORM)).toEqual({
      name: 'Falta el nombre',
      type: 'Falta el tipo de pedido',
      payment: 'Falta el método de pago',
    });
  });

  it('acepta un pedido para recoger sin dirección', () => {
    expect(validateOrderForm(valid)).toEqual({});
  });

  it('pide dirección si es express', () => {
    expect(validateOrderForm({ ...valid, type: 'express' })).toEqual({ address: 'Falta la dirección' });
  });

  it('acepta express con dirección', () => {
    expect(validateOrderForm({ ...valid, type: 'express', address: 'Barrio X' })).toEqual({});
  });

  it('trata como vacíos los campos de solo espacios', () => {
    expect(validateOrderForm({ ...valid, name: '   ' })).toEqual({ name: 'Falta el nombre' });
    expect(validateOrderForm({ ...valid, type: 'express', address: ' \n ' })).toEqual({ address: 'Falta la dirección' });
  });
});

describe('hasErrors', () => {
  it('detecta si hay algún error', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ name: 'Falta el nombre' })).toBe(true);
  });
});
```

`src/features/order-form/__tests__/totals.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { FIXTURE_MENU } from '../../../test/fixtureMenu';
import type { CartLine } from '../../cart/cart';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../totals';
import { EMPTY_FORM, type OrderForm } from '../validation';

const cart: CartLine[] = [{ itemId: 'tipico', extraIds: [], quantity: 1 }];
const recoger: OrderForm = { ...EMPTY_FORM, type: 'recoger' };
const express: OrderForm = { ...EMPTY_FORM, type: 'express' };

describe('deliveryFeeFor', () => {
  it('solo aplica a express con costo definido', () => {
    expect(deliveryFeeFor(express, 1000)).toBe(1000);
    expect(deliveryFeeFor(express, undefined)).toBeUndefined();
    expect(deliveryFeeFor(recoger, 1000)).toBeUndefined();
  });
});

describe('orderTotal', () => {
  it('suma el envío solo cuando aplica', () => {
    expect(orderTotal(FIXTURE_MENU, cart, recoger, 1000)).toBe(1800);
    expect(orderTotal(FIXTURE_MENU, cart, express, 1000)).toBe(2800);
    expect(orderTotal(FIXTURE_MENU, cart, express, undefined)).toBe(1800);
  });
});

describe('orderWarnings', () => {
  it('no avisa nada en un pedido para recoger sin notas de desayuno', () => {
    expect(orderWarnings(FIXTURE_MENU, cart, recoger, undefined)).toEqual([]);
  });

  it('avisa costo de envío por confirmar si es express sin costo definido', () => {
    expect(orderWarnings(FIXTURE_MENU, cart, express, undefined)).toEqual(['Costo de envío por confirmar']);
    expect(orderWarnings(FIXTURE_MENU, cart, express, 1000)).toEqual([]);
  });

  it('avisa adicionales por confirmar con nota en desayuno', () => {
    const conNota: CartLine[] = [{ itemId: 'tipico', extraIds: [], quantity: 1, note: 'huevo extra' }];
    expect(orderWarnings(FIXTURE_MENU, conNota, express, undefined)).toEqual([
      'Adicionales por confirmar',
      'Costo de envío por confirmar',
    ]);
  });
});
```

- [ ] **Step 2: Correr y confirmar que fallan**

Run: `npm test -- src/features/order-form`
Expected: FAIL, no se encuentran `../validation` ni `../totals`.

- [ ] **Step 3: Implementar `src/features/order-form/validation.ts`**

```ts
export type OrderType = 'recoger' | 'express';
export type PaymentMethod = 'efectivo' | 'sinpe' | 'tarjeta';

export interface OrderForm {
  name: string;
  type: OrderType | '';
  address: string;
  reference: string;
  /** "HH:MM" del input de hora; vacío si no la indica. */
  pickupTime: string;
  payment: PaymentMethod | '';
  comment: string;
}

export const EMPTY_FORM: OrderForm = {
  name: '',
  type: '',
  address: '',
  reference: '',
  pickupTime: '',
  payment: '',
  comment: '',
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  recoger: 'Para recoger',
  express: 'Express',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  sinpe: 'SINPE Móvil',
  tarjeta: 'Tarjeta',
};

export type FormErrors = Partial<Record<'name' | 'type' | 'address' | 'payment', string>>;

export function validateOrderForm(form: OrderForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Falta el nombre';
  if (!form.type) errors.type = 'Falta el tipo de pedido';
  if (form.type === 'express' && !form.address.trim()) errors.address = 'Falta la dirección';
  if (!form.payment) errors.payment = 'Falta el método de pago';
  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
```

- [ ] **Step 4: Implementar `src/features/order-form/totals.ts`**

```ts
import { cartTotal, needsPriceConfirmation, type CartLine } from '../cart/cart';
import type { Colones, MenuSection } from '../menu/types';
import type { OrderForm } from './validation';

export function deliveryFeeFor(form: OrderForm, deliveryFee: Colones | undefined): Colones | undefined {
  return form.type === 'express' ? deliveryFee : undefined;
}

export function orderTotal(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): Colones {
  return cartTotal(menu, cart) + (deliveryFeeFor(form, deliveryFee) ?? 0);
}

/** Avisos para el restaurante y el cliente; se muestran en la página y al final del mensaje. */
export function orderWarnings(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): string[] {
  const warnings: string[] = [];
  if (needsPriceConfirmation(menu, cart)) warnings.push('Adicionales por confirmar');
  if (form.type === 'express' && deliveryFee === undefined) warnings.push('Costo de envío por confirmar');
  return warnings;
}
```

- [ ] **Step 5: Correr pruebas y tipos**

Run: `npm test && npm run typecheck`
Expected: PASS; `tsc` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/features/order-form
git commit -m "Validación del formulario y totales del pedido" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Mensaje y link de WhatsApp

**Files:**
- Create: `src/config.ts`, `src/features/whatsapp/message.ts`
- Test: `src/features/whatsapp/__tests__/message.test.ts`

**Interfaces:**
- Consumes: `MENU`; `CartLine`, `resolveLine` (cart); `OrderForm`, `ORDER_TYPE_LABEL`, `PAYMENT_LABEL` (validation); `deliveryFeeFor`, `orderTotal`, `orderWarnings` (totals); `formatColones` (price).
- Produces:
  - `interface BusinessConfig { whatsappNumber?: string; deliveryFee?: Colones; hours?: string; address?: string; socials: { label: string; url: string }[] }` y `config: BusinessConfig` (en `src/config.ts`)
  - `buildOrderMessage(menu: MenuSection[], cart: CartLine[], form: OrderForm, deliveryFee: Colones | undefined): string`
  - `buildWhatsAppUrl(phone: string, message: string): string`

- [ ] **Step 1: Crear `src/config.ts`**

```ts
import type { Colones } from './features/menu/types';

export interface BusinessConfig {
  /** Formato internacional, solo dígitos o con +, espacios o guiones. Ej.: "50688887777". */
  whatsappNumber?: string;
  /** Costo del envío express. Sin definir: el mensaje dice "por confirmar". */
  deliveryFee?: Colones;
  hours?: string;
  address?: string;
  socials: { label: string; url: string }[];
}

// Datos pendientes del dueño. No inventar: dejar sin definir hasta tenerlos.
export const config: BusinessConfig = {
  socials: [],
};
```

- [ ] **Step 2: Escribir las pruebas (fallan)**

`src/features/whatsapp/__tests__/message.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { MENU } from '../../../data/menu';
import type { CartLine } from '../../cart/cart';
import { EMPTY_FORM, type OrderForm } from '../../order-form/validation';
import { buildOrderMessage, buildWhatsAppUrl } from '../message';

const SPEC_CART: CartLine[] = [
  { itemId: 'bacon-cheese', choice: 'Pechuga de pollo', extraIds: ['papas'], quantity: 1 },
  { itemId: 'taco-sencillo', choice: 'Carne', extraIds: [], quantity: 2 },
  { itemId: 'papipollo', sizeId: 'grande', extraIds: [], quantity: 1, note: 'sin pico de gallo' },
];

const SPEC_FORM: OrderForm = {
  ...EMPTY_FORM,
  name: 'Ana',
  type: 'express',
  address: 'Barrio X, 200 m sur de la iglesia',
  payment: 'sinpe',
  comment: 'tocar el timbre',
};

describe('buildOrderMessage', () => {
  it('reproduce exactamente el ejemplo de la especificación', () => {
    expect(buildOrderMessage(MENU, SPEC_CART, SPEC_FORM, undefined)).toBe(
      [
        "¡Hola Kairos Food's! Quiero hacer un pedido 🍔",
        '',
        '1× Bacon & Cheese (Pechuga de pollo) — ₡3800',
        '   + Papas fritas — ₡1200',
        '2× Taco sencillo (Carne) — ₡2000',
        '1× Papipollo (Grande) — ₡5000',
        '   Nota: sin pico de gallo',
        '',
        'Total: ₡12000',
        '',
        'Nombre: Ana',
        'Tipo: Express',
        'Dirección: Barrio X, 200 m sur de la iglesia',
        'Pago: SINPE Móvil',
        'Comentario: tocar el timbre',
        '',
        '⚠️ Costo de envío por confirmar',
      ].join('\n'),
    );
  });

  it('multiplica los adicionales por la cantidad', () => {
    const cart: CartLine[] = [{ itemId: 'taco-sencillo', choice: 'Pollo', extraIds: ['aros'], quantity: 3 }];
    const message = buildOrderMessage(MENU, cart, SPEC_FORM, undefined);
    expect(message).toContain('3× Taco sencillo (Pollo) — ₡3000\n   + Aros de cebolla — ₡3600');
    expect(message).toContain('Total: ₡6600');
  });

  it('agrega la línea de envío y la suma al total cuando hay costo', () => {
    const message = buildOrderMessage(MENU, SPEC_CART, SPEC_FORM, 1000);
    expect(message).toContain('Envío — ₡1000\n\nTotal: ₡13000');
    expect(message).not.toContain('⚠️');
  });

  it('para recoger muestra la hora, no la dirección ni avisos', () => {
    const form: OrderForm = { ...SPEC_FORM, type: 'recoger', pickupTime: '18:30', comment: '' };
    const message = buildOrderMessage(MENU, SPEC_CART, form, 1000);
    expect(message).toContain('Tipo: Para recoger\nHora: 18:30\nPago: SINPE Móvil');
    expect(message).not.toContain('Dirección');
    expect(message).not.toContain('Envío');
    expect(message).not.toContain('Comentario');
    expect(message).not.toContain('⚠️');
  });

  it('omite la hora si no se indicó', () => {
    const form: OrderForm = { ...SPEC_FORM, type: 'recoger', pickupTime: '' };
    expect(buildOrderMessage(MENU, SPEC_CART, form, undefined)).not.toContain('Hora');
  });

  it('incluye la referencia si es express y la trae', () => {
    const form: OrderForm = { ...SPEC_FORM, reference: 'portón negro' };
    expect(buildOrderMessage(MENU, SPEC_CART, form, undefined)).toContain(
      'Dirección: Barrio X, 200 m sur de la iglesia\nReferencia: portón negro',
    );
  });

  it('recorta espacios de nombre, notas y comentario', () => {
    const cart: CartLine[] = [{ itemId: 'empanadas', extraIds: [], quantity: 1, note: '  de carne  ' }];
    const form: OrderForm = { ...SPEC_FORM, name: '  Ana  ', comment: '  tocar  ' };
    const message = buildOrderMessage(MENU, cart, form, undefined);
    expect(message).toContain('   Nota: de carne\n');
    expect(message).toContain('Nombre: Ana\n');
    expect(message).toContain('Comentario: tocar\n');
  });

  it('avisa adicionales por confirmar con nota en desayuno', () => {
    const cart: CartLine[] = [{ itemId: 'tipico', extraIds: [], quantity: 1, note: 'huevo extra' }];
    const message = buildOrderMessage(MENU, cart, SPEC_FORM, undefined);
    expect(message.endsWith('\n\n⚠️ Adicionales por confirmar\n⚠️ Costo de envío por confirmar')).toBe(true);
  });

  it('ignora líneas que ya no existen en el menú', () => {
    const cart: CartLine[] = [...SPEC_CART, { itemId: 'no-existe', extraIds: [], quantity: 1 }];
    expect(buildOrderMessage(MENU, cart, SPEC_FORM, undefined)).toContain('Total: ₡12000');
  });
});

describe('buildWhatsAppUrl', () => {
  it('deja solo los dígitos del número', () => {
    expect(buildWhatsAppUrl('+506 8888-7777', 'hola')).toBe('https://wa.me/50688887777?text=hola');
  });

  it('omite el texto si el mensaje está vacío', () => {
    expect(buildWhatsAppUrl('50688887777', '')).toBe('https://wa.me/50688887777');
  });

  it('codifica caracteres especiales y el texto llega idéntico', () => {
    const message = 'Calle 5 & 7 #3, ñandú?\nTotal: ₡1000 🍔 100%';
    const url = buildWhatsAppUrl('50688887777', message);
    const text = url.slice('https://wa.me/50688887777?text='.length);
    expect(text).not.toMatch(/[\s&#?]/);
    expect(decodeURIComponent(text)).toBe(message);
  });
});
```

- [ ] **Step 3: Correr y confirmar que fallan**

Run: `npm test -- src/features/whatsapp`
Expected: FAIL, no se encuentra `../message`.

- [ ] **Step 4: Implementar `src/features/whatsapp/message.ts`**

```ts
import { resolveLine, type CartLine } from '../cart/cart';
import { formatColones } from '../menu/price';
import type { Colones, MenuSection } from '../menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../order-form/totals';
import { ORDER_TYPE_LABEL, PAYMENT_LABEL, type OrderForm } from '../order-form/validation';

const GREETING = "¡Hola Kairos Food's! Quiero hacer un pedido 🍔";

export function buildOrderMessage(
  menu: MenuSection[],
  cart: CartLine[],
  form: OrderForm,
  deliveryFee: Colones | undefined,
): string {
  const out: string[] = [GREETING, ''];

  for (const line of cart) {
    const resolved = resolveLine(menu, line);
    if (!resolved) continue;
    const details = [resolved.size?.label, line.choice].filter((d): d is string => Boolean(d));
    const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';
    out.push(`${line.quantity}× ${resolved.item.name}${suffix} — ${formatColones(resolved.unitBase * line.quantity)}`);
    for (const extra of resolved.extras) {
      out.push(`   + ${extra.label} — ${formatColones(extra.price * line.quantity)}`);
    }
    const note = line.note?.trim();
    if (note) out.push(`   Nota: ${note}`);
  }

  const fee = deliveryFeeFor(form, deliveryFee);
  if (fee !== undefined) out.push(`Envío — ${formatColones(fee)}`);

  out.push('', `Total: ${formatColones(orderTotal(menu, cart, form, deliveryFee))}`, '');

  out.push(`Nombre: ${form.name.trim()}`);
  if (form.type) out.push(`Tipo: ${ORDER_TYPE_LABEL[form.type]}`);
  if (form.type === 'express') {
    out.push(`Dirección: ${form.address.trim()}`);
    if (form.reference.trim()) out.push(`Referencia: ${form.reference.trim()}`);
  }
  if (form.type === 'recoger' && form.pickupTime) out.push(`Hora: ${form.pickupTime}`);
  if (form.payment) out.push(`Pago: ${PAYMENT_LABEL[form.payment]}`);
  if (form.comment.trim()) out.push(`Comentario: ${form.comment.trim()}`);

  const warnings = orderWarnings(menu, cart, form, deliveryFee);
  if (warnings.length > 0) out.push('', ...warnings.map((w) => `⚠️ ${w}`));

  return out.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
```

- [ ] **Step 5: Correr pruebas y tipos**

Run: `npm test && npm run typecheck`
Expected: PASS; `tsc` sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/config.ts src/features/whatsapp
git commit -m "Mensaje y link de WhatsApp del pedido" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Estilos, encabezado, secciones y menú

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/app.css`
- Create: `src/components/Header.tsx`, `src/components/SectionNav.tsx`, `src/components/MenuSectionView.tsx`, `src/components/ItemCard.tsx`, `src/components/Footer.tsx`
- Modify: `src/main.tsx` (importar estilos), `src/App.tsx` (reemplazar completo)

**Interfaces:**
- Consumes: `MENU`, `config`, `BusinessConfig`, `displayPrice`, `buildWhatsAppUrl`, `MenuItem`, `MenuSection`.
- Produces:
  - `Header(props: { whatsappNumber?: string })`
  - `SectionNav(props: { sections: MenuSection[] })`
  - `MenuSectionView(props: { section: MenuSection; onAdd(item: MenuItem): void })`
  - `ItemCard(props: { item: MenuItem; onAdd(item: MenuItem): void })`
  - `Footer(props: { config: BusinessConfig })`

"Pedir por WhatsApp" en el encabezado abre un chat directo con el restaurante (sin pedido armado) y solo aparece si `whatsappNumber` está definido.

- [ ] **Step 1: Crear `src/styles/tokens.css`**

```css
:root {
  color-scheme: dark;

  --color-bg: #0a0a0a;
  --color-surface: #161616;
  --color-surface-2: #222222;
  --color-border: #2e2e2e;
  --color-red: #e3101a;
  --color-red-strong: #b80c14;
  --color-smoke: rgba(227, 16, 26, 0.35);
  --color-yellow: #ffe500;
  --color-on-yellow: #000000;
  --color-text: #ffffff;
  --color-text-muted: #c9c9c9;
  --color-error: #ff6b6b;
  --color-backdrop: rgba(0, 0, 0, 0.7);
  --color-shadow: rgba(0, 0, 0, 0.6);

  --font-display: 'Kaushan Script', cursive;
  --font-body: 'Poppins', system-ui, sans-serif;

  --radius: 14px;
  --gutter: 16px;
}
```

- [ ] **Step 2: Crear `src/styles/app.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}

button,
input,
textarea {
  font: inherit;
  color: inherit;
}

img {
  display: block;
  max-width: 100%;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 20px;
  border: 2px solid transparent;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.btn--primary {
  background: var(--color-red);
  color: var(--color-text);
}
.btn--primary:active {
  background: var(--color-red-strong);
}
.btn--outline {
  background: transparent;
  border-color: var(--color-yellow);
  color: var(--color-yellow);
}
.btn--block {
  width: 100%;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.link-btn {
  min-height: 44px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  text-decoration: underline;
  cursor: pointer;
}

/* Encabezado */
.header {
  padding: 32px var(--gutter) 28px;
  text-align: center;
  background:
    radial-gradient(ellipse at 15% 0%, var(--color-smoke) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 35%, var(--color-smoke) 0%, transparent 55%),
    var(--color-bg);
}
.header__logo {
  width: min(220px, 60vw);
  height: auto;
  margin: 0 auto;
  border-radius: var(--radius);
}
.header__tagline {
  margin: 16px 0 20px;
  color: var(--color-text-muted);
}
.header__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

/* Barra de secciones */
.section-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px var(--gutter);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  scrollbar-width: none;
}
.section-nav::-webkit-scrollbar {
  display: none;
}
.section-nav a {
  flex: 0 0 auto;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
.section-nav a.is-active {
  background: var(--color-yellow);
  color: var(--color-on-yellow);
}

/* Menú */
.menu {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--gutter) 40px;
}
.menu-section {
  padding-top: 28px;
  scroll-margin-top: 64px;
}
.menu-section__title {
  margin: 0 0 12px;
  color: var(--color-yellow);
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 400;
}
.menu-section__items {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 720px) {
  .menu-section__items {
    grid-template-columns: 1fr 1fr;
  }
}
.menu-section__note {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--color-yellow);
  color: var(--color-on-yellow);
  font-weight: 700;
  text-align: center;
}

.item-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.item-card__name {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
}
.item-card__description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.item-card__side {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}
.price-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--color-yellow);
  color: var(--color-on-yellow);
  font-weight: 800;
  white-space: nowrap;
}
.add-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--color-red);
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

/* Pie */
.footer {
  padding: 32px var(--gutter) 120px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  text-align: center;
}
.footer p {
  margin: 4px 0;
}
.footer a {
  color: var(--color-yellow);
}
```

- [ ] **Step 3: Importar los estilos en `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: Crear los componentes**

`src/components/Header.tsx`:

```tsx
import { buildWhatsAppUrl } from '../features/whatsapp/message';

interface Props {
  whatsappNumber?: string;
}

export function Header({ whatsappNumber }: Props) {
  return (
    <header className="header">
      <img className="header__logo" src="/logo.png" alt="Kairos Food's" width={220} height={220} />
      <p className="header__tagline">Desayunos, almuerzos, hamburguesas, tacos y más. Pide desde tu celular.</p>
      <div className="header__actions">
        <a className="btn btn--outline" href="#menu">
          Ver menú
        </a>
        {whatsappNumber && (
          <a
            className="btn btn--primary"
            href={buildWhatsAppUrl(whatsappNumber, '')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir por WhatsApp
          </a>
        )}
      </div>
    </header>
  );
}
```

`src/components/SectionNav.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import type { MenuSection } from '../features/menu/types';

interface Props {
  sections: MenuSection[];
}

export function SectionNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id);
  const navRef = useRef<HTMLElement>(null);

  // Marca la sección que está en el centro de la pantalla.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  // Centra el botón activo en la barra sin mover la página.
  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>('.is-active');
    if (!nav || !chip) return;
    nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav className="section-nav" aria-label="Secciones del menú" ref={navRef}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={section.id === active ? 'is-active' : undefined}
          aria-current={section.id === active ? 'true' : undefined}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
```

`src/components/ItemCard.tsx`:

```tsx
import { displayPrice } from '../features/menu/price';
import type { MenuItem } from '../features/menu/types';

interface Props {
  item: MenuItem;
  onAdd(item: MenuItem): void;
}

export function ItemCard({ item, onAdd }: Props) {
  return (
    <article className="item-card">
      <div>
        <h3 className="item-card__name">{item.name}</h3>
        {item.description && <p className="item-card__description">{item.description}</p>}
      </div>
      <div className="item-card__side">
        <span className="price-pill">{displayPrice(item)}</span>
        <button type="button" className="add-btn" onClick={() => onAdd(item)} aria-label={`Agregar ${item.name}`}>
          +
        </button>
      </div>
    </article>
  );
}
```

`src/components/MenuSectionView.tsx`:

```tsx
import type { MenuItem, MenuSection } from '../features/menu/types';
import { ItemCard } from './ItemCard';

interface Props {
  section: MenuSection;
  onAdd(item: MenuItem): void;
}

export function MenuSectionView({ section, onAdd }: Props) {
  return (
    <section className="menu-section" id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2 className="menu-section__title" id={`${section.id}-title`}>
        {section.title}
      </h2>
      <div className="menu-section__items">
        {section.items.map((item) => (
          <ItemCard key={item.id} item={item} onAdd={onAdd} />
        ))}
      </div>
      {section.note && <p className="menu-section__note">{section.note}</p>}
    </section>
  );
}
```

`src/components/Footer.tsx`:

```tsx
import { Fragment } from 'react';
import type { BusinessConfig } from '../config';

interface Props {
  config: BusinessConfig;
}

export function Footer({ config }: Props) {
  return (
    <footer className="footer">
      {config.hours && <p>Horario: {config.hours}</p>}
      {config.address && <p>{config.address}</p>}
      {config.socials.length > 0 && (
        <p>
          {config.socials.map((social, i) => (
            <Fragment key={social.url}>
              {i > 0 && ' · '}
              <a href={social.url} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            </Fragment>
          ))}
        </p>
      )}
      <p>Kairos Food's</p>
    </footer>
  );
}
```

- [ ] **Step 5: Reemplazar `src/App.tsx`**

```tsx
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MenuSectionView } from './components/MenuSectionView';
import { SectionNav } from './components/SectionNav';
import { config } from './config';
import { MENU } from './data/menu';

export default function App() {
  return (
    <>
      <Header whatsappNumber={config.whatsappNumber} />
      <SectionNav sections={MENU} />
      <main className="menu" id="menu">
        {MENU.map((section) => (
          <MenuSectionView key={section.id} section={section} onAdd={() => {}} />
        ))}
      </main>
      <Footer config={config} />
    </>
  );
}
```

- [ ] **Step 6: Verificar tipos, pruebas y compilación**

Run: `npm run typecheck && npm test && npm run build`
Expected: todo en verde.

- [ ] **Step 7: Revisar en el navegador**

Run: `npm run dev` y abrir la URL que imprime (normalmente `http://localhost:5173`) con el ancho de un celular (390 px en las herramientas de desarrollo).

Revisar:
- El logo se ve centrado sobre fondo negro con humo rojo suave.
- La barra de secciones queda pegada arriba al hacer scroll, se desliza de lado y marca la sección visible.
- Tocar una sección baja hasta ella sin que el título quede tapado por la barra.
- Las tarjetas muestran nombre, descripción, precio en óvalo amarillo ("desde ₡1000" en papas) y el botón +.
- No hay scroll horizontal de la página.
- No aparece "Pedir por WhatsApp" (el número no está definido).

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "Encabezado, barra de secciones y menú con la identidad de Kairos" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Ventana de opciones y barra del carrito

**Files:**
- Create: `src/components/useLockBodyScroll.ts`, `src/components/ItemSheet.tsx`, `src/components/CartBar.tsx`
- Modify: `src/styles/app.css` (agregar al final), `src/App.tsx` (reemplazar completo), `package.json` (dependencias de prueba)
- Test: `src/components/__tests__/ItemSheet.test.tsx`

**Interfaces:**
- Consumes: `useCart` (Task 3), `CartLine`, `lineTotal`, `formatColones`, `hasOptions`, `MenuItem`, `MenuSection`.
- Produces:
  - `useLockBodyScroll(): void`
  - `ItemSheet(props: { menu: MenuSection[]; item: MenuItem; onAdd(line: CartLine): void; onClose(): void })`
  - `CartBar(props: { count: number; total: Colones; onOpen(): void })`

- [ ] **Step 1: Instalar dependencias de prueba de componentes**

```bash
npm install -D jsdom @testing-library/react @testing-library/dom @testing-library/user-event
```

- [ ] **Step 2: Escribir la prueba de la ventana (falla)**

`src/components/__tests__/ItemSheet.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MENU } from '../../data/menu';
import type { MenuItem } from '../../features/menu/types';
import { ItemSheet } from '../ItemSheet';

afterEach(cleanup);

function item(id: string): MenuItem {
  const found = MENU.flatMap((s) => s.items).find((i) => i.id === id);
  if (!found) throw new Error(`no existe ${id}`);
  return found;
}

describe('ItemSheet', () => {
  it('actualiza el precio con el tamaño y la cantidad, y agrega la línea', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemSheet menu={MENU} item={item('papipollo')} onAdd={onAdd} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Agregar · ₡3000' })).toBeTruthy();
    await user.click(screen.getByLabelText(/Grande/));
    await user.click(screen.getByRole('button', { name: 'Sumar uno' }));
    await user.click(screen.getByRole('button', { name: 'Agregar · ₡10000' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: 'papipollo', sizeId: 'grande', extraIds: [], quantity: 2 }),
    );
  });

  it('elige proteína y suma adicionales', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ItemSheet menu={MENU} item={item('bacon-cheese')} onAdd={onAdd} onClose={() => {}} />);

    await user.click(screen.getByLabelText('Pechuga de pollo'));
    await user.click(screen.getByLabelText(/Papas fritas/));
    await user.type(screen.getByLabelText('Notas'), 'sin tomate');
    await user.click(screen.getByRole('button', { name: 'Agregar · ₡5000' }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 'bacon-cheese',
        choice: 'Pechuga de pollo',
        extraIds: ['papas'],
        note: 'sin tomate',
        quantity: 1,
      }),
    );
  });

  it('no deja bajar la cantidad de 1', async () => {
    const user = userEvent.setup();
    render(<ItemSheet menu={MENU} item={item('papipollo')} onAdd={() => {}} onClose={() => {}} />);
    const minus = screen.getByRole('button', { name: 'Restar uno' }) as HTMLButtonElement;
    expect(minus.disabled).toBe(true);
    await user.click(minus);
    expect(screen.getByRole('button', { name: 'Agregar · ₡3000' })).toBeTruthy();
  });

  it('se cierra con Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ItemSheet menu={MENU} item={item('papipollo')} onAdd={() => {}} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Correr y confirmar que falla**

Run: `npm test -- src/components`
Expected: FAIL, no se encuentra `../ItemSheet`.

- [ ] **Step 4: Implementar los componentes**

`src/components/useLockBodyScroll.ts`:

```ts
import { useEffect } from 'react';

/** Evita que la página de atrás se desplace mientras hay una ventana abierta. */
export function useLockBodyScroll(): void {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}
```

`src/components/ItemSheet.tsx`:

```tsx
import { useEffect, useId, useState } from 'react';
import { lineTotal, type CartLine } from '../features/cart/cart';
import { formatColones } from '../features/menu/price';
import type { MenuItem, MenuSection } from '../features/menu/types';
import { useLockBodyScroll } from './useLockBodyScroll';

interface Props {
  menu: MenuSection[];
  item: MenuItem;
  onAdd(line: CartLine): void;
  onClose(): void;
}

export function ItemSheet({ menu, item, onAdd, onClose }: Props) {
  const titleId = useId();
  const noteId = useId();
  const [sizeId, setSizeId] = useState(item.sizes?.[0]?.id);
  const [choice, setChoice] = useState(item.choice?.options[0]);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  useLockBodyScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const line: CartLine = { itemId: item.id, sizeId, choice, extraIds, note, quantity };
  const total = lineTotal(menu, line);

  function toggleExtra(id: string) {
    setExtraIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__header">
          <div>
            <h2 className="sheet__title" id={titleId}>
              {item.name}
            </h2>
            {item.description && <p className="item-card__description">{item.description}</p>}
          </div>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {item.sizes && (
          <fieldset className="option-group">
            <legend>Tamaño</legend>
            {item.sizes.map((size) => (
              <label key={size.id} className="option">
                <input
                  type="radio"
                  name="size"
                  checked={sizeId === size.id}
                  onChange={() => setSizeId(size.id)}
                />
                <span className="option__label">{size.label}</span>
                <span className="option__price">{formatColones(size.price)}</span>
              </label>
            ))}
          </fieldset>
        )}

        {item.choice && (
          <fieldset className="option-group">
            <legend>{item.choice.label}</legend>
            {item.choice.options.map((option) => (
              <label key={option} className="option">
                <input type="radio" name="choice" checked={choice === option} onChange={() => setChoice(option)} />
                <span className="option__label">{option}</span>
              </label>
            ))}
          </fieldset>
        )}

        {item.extras && item.extras.length > 0 && (
          <fieldset className="option-group">
            <legend>Adicionales</legend>
            {item.extras.map((extra) => (
              <label key={extra.id} className="option">
                <input type="checkbox" checked={extraIds.includes(extra.id)} onChange={() => toggleExtra(extra.id)} />
                <span className="option__label">{extra.label}</span>
                <span className="option__price">+{formatColones(extra.price)}</span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="field">
          <label className="field__label" htmlFor={noteId}>
            Notas
          </label>
          <textarea
            id={noteId}
            rows={2}
            placeholder="Ej.: sin cebolla"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="sheet__footer">
          <div className="qty">
            <button
              type="button"
              aria-label="Restar uno"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" aria-label="Sumar uno" onClick={() => setQuantity((q) => q + 1)}>
              +
            </button>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => onAdd(line)}>
            Agregar · {formatColones(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
```

`src/components/CartBar.tsx`:

```tsx
import { formatColones } from '../features/menu/price';
import type { Colones } from '../features/menu/types';

interface Props {
  count: number;
  total: Colones;
  onOpen(): void;
}

export function CartBar({ count, total, onOpen }: Props) {
  return (
    <button type="button" className="cart-bar" onClick={onOpen}>
      <span>
        {count} {count === 1 ? 'platillo' : 'platillos'} · {formatColones(total)}
      </span>
      <span>Ver pedido</span>
    </button>
  );
}
```

- [ ] **Step 5: Agregar estilos al final de `src/styles/app.css`**

```css
/* Barra del carrito */
.cart-bar {
  position: fixed;
  right: var(--gutter);
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: var(--gutter);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 560px;
  margin: 0 auto;
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  background: var(--color-red);
  color: var(--color-text);
  font-weight: 700;
  box-shadow: 0 8px 24px var(--color-shadow);
  cursor: pointer;
}

/* Ventanas */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--color-backdrop);
}
.backdrop--center {
  align-items: center;
  padding: var(--gutter);
}
.sheet {
  width: 100%;
  max-width: 560px;
  max-height: 90dvh;
  overflow-y: auto;
  padding: 20px var(--gutter) calc(20px + env(safe-area-inset-bottom));
  border-radius: 20px 20px 0 0;
  background: var(--color-surface);
}
.sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.sheet__title {
  margin: 0 0 4px;
  font-size: 1.3rem;
}
.sheet__close {
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}
.sheet__footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
.sheet__footer .btn {
  flex: 1;
}

.option-group {
  margin: 18px 0 0;
  padding: 0;
  border: none;
}
.option-group legend {
  margin-bottom: 8px;
  padding: 0;
  font-weight: 700;
}
.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  cursor: pointer;
}
.option input {
  width: 20px;
  height: 20px;
  accent-color: var(--color-red);
}
.option__label {
  flex: 1;
}
.option__price {
  color: var(--color-yellow);
  font-weight: 700;
}

.field {
  margin-top: 16px;
}
.field__label {
  display: block;
  margin-bottom: 6px;
  font-weight: 700;
}
.field input[type='text'],
.field input[type='time'],
.field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface-2);
  font-size: 16px;
}
.field__error {
  margin: 6px 0 0;
  color: var(--color-error);
  font-size: 0.9rem;
}

.qty {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.qty button {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface-2);
  font-size: 1.2rem;
  cursor: pointer;
}
.qty button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 6: Reemplazar `src/App.tsx`**

```tsx
import { useState } from 'react';
import { CartBar } from './components/CartBar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ItemSheet } from './components/ItemSheet';
import { MenuSectionView } from './components/MenuSectionView';
import { SectionNav } from './components/SectionNav';
import { config } from './config';
import { MENU } from './data/menu';
import { useCart } from './features/cart/useCart';
import { hasOptions } from './features/menu/price';
import type { MenuItem } from './features/menu/types';

export default function App() {
  const cart = useCart(MENU);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  function handleAdd(item: MenuItem) {
    if (hasOptions(item)) {
      setSelected(item);
    } else {
      cart.add({ itemId: item.id, extraIds: [], quantity: 1 });
    }
  }

  return (
    <>
      <Header whatsappNumber={config.whatsappNumber} />
      <SectionNav sections={MENU} />
      <main className="menu" id="menu">
        {MENU.map((section) => (
          <MenuSectionView key={section.id} section={section} onAdd={handleAdd} />
        ))}
      </main>
      <Footer config={config} />
      {cart.count > 0 && <CartBar count={cart.count} total={cart.total} onOpen={() => {}} />}
      {selected && (
        <ItemSheet
          menu={MENU}
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={(line) => {
            cart.add(line);
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 7: Correr pruebas, tipos y compilación**

Run: `npm test && npm run typecheck && npm run build`
Expected: todo en verde.

- [ ] **Step 8: Revisar en el navegador (390 px)**

Run: `npm run dev`

Revisar:
- Tocar + en "Típico" lo agrega directo y aparece la barra "1 platillo · ₡1800".
- Tocar + en "Papipollo" abre la ventana desde abajo; cambiar a Grande cambia el botón a "Agregar · ₡5000".
- La página de atrás no se desplaza con la ventana abierta; tocar fuera o la × la cierra.
- Recargar la página conserva el carrito.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src
git commit -m "Ventana de opciones y barra del carrito" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Vista "Tu pedido" y envío por WhatsApp

**Files:**
- Create: `src/components/OrderView.tsx`
- Modify: `src/styles/app.css` (agregar al final), `src/App.tsx` (reemplazar completo)
- Test: `src/components/__tests__/OrderView.test.tsx`

**Interfaces:**
- Consumes: `CartLine`, `resolveLine`, `lineTotal`, `setQuantity`, `setNote` (cart); `OrderForm`, `EMPTY_FORM`, `validateOrderForm`, `hasErrors`, `ORDER_TYPE_LABEL`, `PAYMENT_LABEL`, `OrderType`, `PaymentMethod` (validation); `orderTotal`, `orderWarnings`, `deliveryFeeFor` (totals); `buildOrderMessage`, `buildWhatsAppUrl` (whatsapp); `formatColones`; `useLockBodyScroll`.
- Produces:
  - `OrderView(props: { menu: MenuSection[]; lines: CartLine[]; form: OrderForm; onFormChange(form: OrderForm): void; whatsappNumber?: string; deliveryFee?: Colones; onSetQuantity(index: number, quantity: number): void; onSetNote(index: number, note: string): void; onClear(): void; onClose(): void })`

El formulario vive en `App` para que no se pierda al cerrar y volver a abrir la vista.

- [ ] **Step 1: Escribir la prueba (falla)**

`src/components/__tests__/OrderView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MENU } from '../../data/menu';
import { setNote, setQuantity, type CartLine } from '../../features/cart/cart';
import { EMPTY_FORM, type OrderForm } from '../../features/order-form/validation';
import { OrderView } from '../OrderView';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const LINES: CartLine[] = [{ itemId: 'bacon-cheese', choice: 'Pechuga de pollo', extraIds: ['papas'], quantity: 1 }];

interface HarnessProps {
  whatsappNumber?: string;
  deliveryFee?: number;
  onClear?: () => void;
  onClose?: () => void;
}

function Harness({ whatsappNumber, deliveryFee, onClear = () => {}, onClose = () => {} }: HarnessProps) {
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [lines, setLines] = useState<CartLine[]>(LINES);
  return (
    <OrderView
      menu={MENU}
      lines={lines}
      form={form}
      onFormChange={setForm}
      whatsappNumber={whatsappNumber}
      deliveryFee={deliveryFee}
      onSetQuantity={(i, q) => setLines((c) => setQuantity(c, i, q))}
      onSetNote={(i, n) => setLines((c) => setNote(c, i, n))}
      onClear={onClear}
      onClose={onClose}
    />
  );
}

describe('OrderView', () => {
  it('muestra el platillo y el total', () => {
    render(<Harness whatsappNumber="50688887777" />);
    expect(screen.getByText('Bacon & Cheese')).toBeTruthy();
    expect(screen.getByText('Total').nextSibling?.textContent).toBe('₡5000');
  });

  it('marca los campos faltantes y no abre WhatsApp', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Harness whatsappNumber="50688887777" />);

    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));

    expect(screen.getByText('Falta el nombre')).toBeTruthy();
    expect(screen.getByText('Falta el tipo de pedido')).toBeTruthy();
    expect(screen.getByText('Falta el método de pago')).toBeTruthy();
    expect(open).not.toHaveBeenCalled();
  });

  it('pide dirección solo si es express', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" />);
    expect(screen.queryByLabelText('Dirección')).toBeNull();
    await user.click(screen.getByLabelText('Express'));
    expect(screen.getByLabelText('Dirección')).toBeTruthy();
    expect(screen.getByText('Costo de envío por confirmar')).toBeTruthy();
    await user.click(screen.getByLabelText('Para recoger'));
    expect(screen.queryByLabelText('Dirección')).toBeNull();
    expect(screen.getByLabelText('Hora a la que pasas (opcional)')).toBeTruthy();
  });

  it('abre WhatsApp con el pedido y pregunta si se envió', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClear = vi.fn();
    const onClose = vi.fn();
    render(<Harness whatsappNumber="+506 8888-7777" onClear={onClear} onClose={onClose} />);

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByLabelText('Para recoger'));
    await user.click(screen.getByLabelText('Efectivo'));
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = open.mock.calls[0][0] as string;
    expect(url.startsWith('https://wa.me/50688887777?text=')).toBe(true);
    const text = decodeURIComponent(url.split('?text=')[1]);
    expect(text).toContain('1× Bacon & Cheese (Pechuga de pollo) — ₡3800');
    expect(text).toContain('Nombre: Ana');
    expect(text).toContain('Pago: Efectivo');

    expect(screen.getByText('¿Ya enviaste tu pedido?')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sí, vaciar carrito' }));
    expect(onClear).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('"No, volver al pedido" no vacía el carrito', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClear = vi.fn();
    render(<Harness whatsappNumber="50688887777" onClear={onClear} />);

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.click(screen.getByLabelText('Para recoger'));
    await user.click(screen.getByLabelText('Efectivo'));
    await user.click(screen.getByRole('button', { name: 'Enviar por WhatsApp' }));
    await user.click(screen.getByRole('button', { name: 'No, volver al pedido' }));

    expect(onClear).not.toHaveBeenCalled();
    expect(screen.queryByText('¿Ya enviaste tu pedido?')).toBeNull();
    expect(screen.getByText('Bacon & Cheese')).toBeTruthy();
  });

  it('sin número de WhatsApp el botón queda desactivado', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Número pendiente' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('suma el envío al total cuando hay costo y es express', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" deliveryFee={1000} />);
    await user.click(screen.getByLabelText('Express'));
    expect(screen.getByText('Envío').nextSibling?.textContent).toBe('₡1000');
    expect(screen.getByText('Total').nextSibling?.textContent).toBe('₡6000');
  });

  it('quitar el único platillo muestra el pedido vacío', async () => {
    const user = userEvent.setup();
    render(<Harness whatsappNumber="50688887777" />);
    await user.click(screen.getByRole('button', { name: 'Quitar Bacon & Cheese' }));
    expect(screen.getByText('Tu pedido está vacío.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Enviar por WhatsApp' })).toBeNull();
  });
});
```

- [ ] **Step 2: Correr y confirmar que falla**

Run: `npm test -- src/components/__tests__/OrderView.test.tsx`
Expected: FAIL, no se encuentra `../OrderView`.

- [ ] **Step 3: Implementar `src/components/OrderView.tsx`**

```tsx
import { useId, useState, type ReactNode } from 'react';
import { lineTotal, resolveLine, type CartLine } from '../features/cart/cart';
import { formatColones } from '../features/menu/price';
import type { Colones, MenuSection } from '../features/menu/types';
import { deliveryFeeFor, orderTotal, orderWarnings } from '../features/order-form/totals';
import {
  hasErrors,
  ORDER_TYPE_LABEL,
  PAYMENT_LABEL,
  validateOrderForm,
  type FormErrors,
  type OrderForm,
  type OrderType,
  type PaymentMethod,
} from '../features/order-form/validation';
import { buildOrderMessage, buildWhatsAppUrl } from '../features/whatsapp/message';
import { useLockBodyScroll } from './useLockBodyScroll';

interface Props {
  menu: MenuSection[];
  lines: CartLine[];
  form: OrderForm;
  onFormChange(form: OrderForm): void;
  whatsappNumber?: string;
  deliveryFee?: Colones;
  onSetQuantity(index: number, quantity: number): void;
  onSetNote(index: number, note: string): void;
  onClear(): void;
  onClose(): void;
}

const ORDER_TYPES = Object.keys(ORDER_TYPE_LABEL) as OrderType[];
const PAYMENTS = Object.keys(PAYMENT_LABEL) as PaymentMethod[];

export function OrderView(props: Props) {
  const { menu, lines, form, onFormChange, whatsappNumber, deliveryFee } = props;
  const [submitted, setSubmitted] = useState(false);
  const [askSent, setAskSent] = useState(false);
  useLockBodyScroll();

  const errors: FormErrors = submitted ? validateOrderForm(form) : {};
  const fee = deliveryFeeFor(form, deliveryFee);
  const warnings = orderWarnings(menu, lines, form, deliveryFee);

  function update<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    onFormChange({ ...form, [key]: value });
  }

  function handleSend() {
    setSubmitted(true);
    if (!whatsappNumber || lines.length === 0 || hasErrors(validateOrderForm(form))) return;
    const message = buildOrderMessage(menu, lines, form, deliveryFee);
    window.open(buildWhatsAppUrl(whatsappNumber, message), '_blank', 'noopener');
    setAskSent(true);
  }

  return (
    <div className="order" role="dialog" aria-modal="true" aria-label="Tu pedido">
      <div className="order__inner">
        <div className="order__header">
          <h2 className="order__title">Tu pedido</h2>
          <button type="button" className="sheet__close" onClick={props.onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="empty">
            <p>Tu pedido está vacío.</p>
            <button type="button" className="btn btn--outline" onClick={props.onClose}>
              Ver menú
            </button>
          </div>
        ) : (
          <>
            {lines.map((line, index) => (
              <OrderLine
                // El índice como key mantiene el foco en la nota mientras se escribe.
                key={index}
                menu={menu}
                line={line}
                onSetQuantity={(q) => props.onSetQuantity(index, q)}
                onSetNote={(n) => props.onSetNote(index, n)}
              />
            ))}

            {fee !== undefined && (
              <div className="order__row">
                <span>Envío</span>
                <span>{formatColones(fee)}</span>
              </div>
            )}
            <div className="order__total">
              <span>Total</span>
              <span>{formatColones(orderTotal(menu, lines, form, deliveryFee))}</span>
            </div>
            {warnings.map((w) => (
              <p key={w} className="order__warning">
                {w}
              </p>
            ))}

            <Field label="Nombre" error={errors.name}>
              {(id, describedBy) => (
                <input
                  id={id}
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy}
                  onChange={(e) => update('name', e.target.value)}
                />
              )}
            </Field>

            <fieldset className="option-group">
              <legend>Tipo de pedido</legend>
              <div className="choice-row">
                {ORDER_TYPES.map((type) => (
                  <label key={type} className="option">
                    <input
                      type="radio"
                      name="order-type"
                      checked={form.type === type}
                      onChange={() => update('type', type)}
                    />
                    <span className="option__label">{ORDER_TYPE_LABEL[type]}</span>
                  </label>
                ))}
              </div>
              {errors.type && <p className="field__error">{errors.type}</p>}
            </fieldset>

            {form.type === 'express' && (
              <>
                <Field label="Dirección" error={errors.address}>
                  {(id, describedBy) => (
                    <textarea
                      id={id}
                      rows={2}
                      autoComplete="street-address"
                      value={form.address}
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={describedBy}
                      onChange={(e) => update('address', e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Referencia (opcional)">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      placeholder="Ej.: portón negro"
                      value={form.reference}
                      onChange={(e) => update('reference', e.target.value)}
                    />
                  )}
                </Field>
              </>
            )}

            {form.type === 'recoger' && (
              <Field label="Hora a la que pasas (opcional)">
                {(id) => (
                  <input id={id} type="time" value={form.pickupTime} onChange={(e) => update('pickupTime', e.target.value)} />
                )}
              </Field>
            )}

            <fieldset className="option-group">
              <legend>Método de pago</legend>
              <div className="choice-row">
                {PAYMENTS.map((payment) => (
                  <label key={payment} className="option">
                    <input
                      type="radio"
                      name="payment"
                      checked={form.payment === payment}
                      onChange={() => update('payment', payment)}
                    />
                    <span className="option__label">{PAYMENT_LABEL[payment]}</span>
                  </label>
                ))}
              </div>
              {errors.payment && <p className="field__error">{errors.payment}</p>}
            </fieldset>

            <Field label="Comentario (opcional)">
              {(id) => (
                <textarea id={id} rows={2} value={form.comment} onChange={(e) => update('comment', e.target.value)} />
              )}
            </Field>

            {hasErrors(errors) && <p className="field__error">Faltan datos. Revisa lo marcado en rojo.</p>}

            <button
              type="button"
              className="btn btn--primary btn--block order__send"
              disabled={!whatsappNumber}
              onClick={handleSend}
            >
              {whatsappNumber ? 'Enviar por WhatsApp' : 'Número pendiente'}
            </button>
          </>
        )}
      </div>

      {askSent && (
        <div className="backdrop backdrop--center">
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="sent-title">
            <h3 id="sent-title">¿Ya enviaste tu pedido?</h3>
            <p className="item-card__description">Si WhatsApp no se abrió, vuelve al pedido e inténtalo de nuevo.</p>
            <div className="dialog__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  props.onClear();
                  props.onClose();
                }}
              >
                Sí, vaciar carrito
              </button>
              <button type="button" className="btn btn--outline" onClick={() => setAskSent(false)}>
                No, volver al pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderLineProps {
  menu: MenuSection[];
  line: CartLine;
  onSetQuantity(quantity: number): void;
  onSetNote(note: string): void;
}

function OrderLine({ menu, line, onSetQuantity, onSetNote }: OrderLineProps) {
  const noteId = useId();
  const resolved = resolveLine(menu, line);
  if (!resolved) return null;
  const details = [resolved.size?.label, line.choice, ...resolved.extras.map((e) => `+ ${e.label}`)].filter(Boolean);
  const name = resolved.item.name;

  return (
    <div className="order-line">
      <div className="order-line__top">
        <span>{name}</span>
        <span>{formatColones(lineTotal(menu, line))}</span>
      </div>
      {details.length > 0 && <p className="order-line__details">{details.join(' · ')}</p>}
      <div className="order-line__actions">
        <div className="qty">
          <button type="button" aria-label={`Restar uno de ${name}`} onClick={() => onSetQuantity(line.quantity - 1)}>
            −
          </button>
          <span aria-live="polite">{line.quantity}</span>
          <button type="button" aria-label={`Sumar uno de ${name}`} onClick={() => onSetQuantity(line.quantity + 1)}>
            +
          </button>
        </div>
        <button type="button" className="link-btn" aria-label={`Quitar ${name}`} onClick={() => onSetQuantity(0)}>
          Quitar
        </button>
      </div>
      <div className="field">
        <label className="field__label" htmlFor={noteId}>
          {resolved.section.hasUnpricedExtras ? 'Nota (adicionales: te confirmamos el precio)' : 'Nota'}
        </label>
        <textarea id={noteId} rows={1} value={line.note ?? ''} onChange={(e) => onSetNote(e.target.value)} />
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children(id: string, describedBy: string | undefined): ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children(id, error ? errorId : undefined)}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Agregar estilos al final de `src/styles/app.css`**

```css
/* Tu pedido */
.order {
  position: fixed;
  inset: 0;
  z-index: 25;
  overflow-y: auto;
  background: var(--color-bg);
}
.order__inner {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px var(--gutter) calc(32px + env(safe-area-inset-bottom));
}
.order__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.order__title {
  margin: 0;
  color: var(--color-yellow);
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 400;
}
.order-line {
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}
.order-line__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
}
.order-line__details {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.order-line__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.order__row {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  color: var(--color-text-muted);
}
.order__total {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 1.2rem;
  font-weight: 800;
}
.order__warning {
  margin: 4px 0;
  color: var(--color-yellow);
  font-size: 0.9rem;
}
.order__send {
  margin-top: 20px;
}
.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.choice-row .option {
  flex: 1 1 140px;
  margin: 0;
}
.empty {
  padding: 40px 0;
  color: var(--color-text-muted);
  text-align: center;
}
.dialog {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  border-radius: 20px;
  background: var(--color-surface);
  text-align: center;
}
.dialog h3 {
  margin: 0 0 8px;
}
.dialog__actions {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}
```

- [ ] **Step 5: Reemplazar `src/App.tsx`**

```tsx
import { useState } from 'react';
import { CartBar } from './components/CartBar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ItemSheet } from './components/ItemSheet';
import { MenuSectionView } from './components/MenuSectionView';
import { OrderView } from './components/OrderView';
import { SectionNav } from './components/SectionNav';
import { config } from './config';
import { MENU } from './data/menu';
import { useCart } from './features/cart/useCart';
import { hasOptions } from './features/menu/price';
import type { MenuItem } from './features/menu/types';
import { EMPTY_FORM, type OrderForm } from './features/order-form/validation';

export default function App() {
  const cart = useCart(MENU);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);

  function handleAdd(item: MenuItem) {
    if (hasOptions(item)) {
      setSelected(item);
    } else {
      cart.add({ itemId: item.id, extraIds: [], quantity: 1 });
    }
  }

  return (
    <>
      <Header whatsappNumber={config.whatsappNumber} />
      <SectionNav sections={MENU} />
      <main className="menu" id="menu">
        {MENU.map((section) => (
          <MenuSectionView key={section.id} section={section} onAdd={handleAdd} />
        ))}
      </main>
      <Footer config={config} />
      {cart.count > 0 && !orderOpen && (
        <CartBar count={cart.count} total={cart.total} onOpen={() => setOrderOpen(true)} />
      )}
      {selected && (
        <ItemSheet
          menu={MENU}
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={(line) => {
            cart.add(line);
            setSelected(null);
          }}
        />
      )}
      {orderOpen && (
        <OrderView
          menu={MENU}
          lines={cart.lines}
          form={form}
          onFormChange={setForm}
          whatsappNumber={config.whatsappNumber}
          deliveryFee={config.deliveryFee}
          onSetQuantity={cart.setQuantity}
          onSetNote={cart.setNote}
          onClear={cart.clear}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 6: Correr pruebas, tipos y compilación**

Run: `npm test && npm run typecheck && npm run build`
Expected: todo en verde.

- [ ] **Step 7: Revisar el flujo completo en el navegador (390 px)**

Para probar el envío, poner temporalmente un número de prueba en `src/config.ts` (`whatsappNumber: '50600000000'`) y **quitarlo antes del commit**.

Run: `npm run dev`

Revisar:
- "Ver pedido" abre la vista; cambiar cantidades y quitar platillos actualiza el total.
- Escribir una nota con espacios entre palabras funciona y no pierde el foco.
- Enviar con el formulario vacío marca los campos en rojo y muestra "Faltan datos".
- Al elegir Express aparecen Dirección y Referencia, y el aviso "Costo de envío por confirmar".
- Con todo lleno, "Enviar por WhatsApp" abre `wa.me` con el mensaje armado y aparece "¿Ya enviaste tu pedido?".
- "No, volver al pedido" conserva todo; "Sí, vaciar carrito" lo vacía y vuelve al menú.
- Sin número en `config.ts`, el botón dice "Número pendiente" y está desactivado.

- [ ] **Step 8: Confirmar que `src/config.ts` no tiene el número de prueba y hacer commit**

Run: `git diff src/config.ts`
Expected: sin cambios.

```bash
git add src
git commit -m "Vista del pedido con formulario y envío por WhatsApp" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Cierre y documentación

**Files:**
- Modify: `AGENTS.md` (reemplazar completo)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: reglas y comandos del proyecto para las próximas sesiones.

- [ ] **Step 1: Reemplazar `AGENTS.md`**

~~~markdown
# KAIROS — reglas del proyecto

KAIROS (**Kairos Food's**) es un restaurante de comida rápida en Costa Rica. No tiene relación con REPORA.

Este repo es la página web del menú digital: los clientes ven el menú, arman su pedido y lo envían por WhatsApp.

- Especificación: `docs/superpowers/specs/2026-10-22-menu-digital-design.md`
- Plan: `docs/superpowers/plans/2026-10-22-menu-digital.md`

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm test           # pruebas (Vitest)
npm run typecheck  # chequeo de tipos
npm run build      # compilación para publicar (sale en dist/)
```

Antes de cerrar una tarea: `npm test`, `npm run typecheck` y `npm run build`.

## Reglas

- El menú está en `src/data/menu.ts` y es el único archivo que cambia con los precios. Su fuente es `docs/MENU.md`.
- No inventar platillos, precios ni descripciones. Lo que no está en el menú se le pregunta al dueño.
- Los datos del negocio (WhatsApp, costo de envío, horario, dirección, redes) van en `src/config.ts`. Quedan sin definir hasta que el dueño los dé.
- La lógica va en `src/features/*/` como funciones puras con pruebas en `__tests__/`. Los componentes no calculan precios ni arman el texto del pedido.
- Los colores salen de las variables de `src/styles/tokens.css`. No hay valores hex fuera de ese archivo.
- Precios en colones enteros, mostrados con `formatColones` (`₡3800`).

## Marca

- Logo: `assets/brand/logo.png` (copia publicada en `public/logo.png`).
- Paleta: fondo negro, rojo intenso, blanco y amarillo (gorro de chef, títulos y óvalos de precio).
- Letras: Kaushan Script para títulos de sección y Poppins para el resto.

## Pendiente del dueño

- Los puntos de la sección "Pendiente de confirmar" en `docs/MENU.md`.
- Los datos de `src/config.ts`.
- Dónde publicar (Netlify o Cloudflare Pages) y, si se quiere, un dominio propio.
~~~

- [ ] **Step 2: Verificación completa**

Run: `npm test && npm run typecheck && npm run build`
Expected: todas las pruebas en verde, `tsc` sin errores, `dist/` generado.

Run: `npm run preview` y abrir la URL que imprime con el ancho de un celular. Recorrer: agregar un platillo simple, uno con tamaño, uno con proteína y adicionales; abrir el pedido; recargar la página y confirmar que el carrito sigue ahí.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "Reglas y comandos del proyecto en AGENTS.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

La publicación (Netlify o Cloudflare Pages) queda fuera de este plan: es una acción hacia afuera y se hace con el visto bueno del dueño, cuando estén los datos de `src/config.ts`.
