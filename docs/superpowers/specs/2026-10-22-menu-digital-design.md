# Menú digital de Kairos Food's — diseño

Fecha: 2026-10-22
Estado: aprobado en conversación, pendiente de revisión escrita.

## Objetivo

Una página web, pensada primero para celular, donde los clientes de Kairos Food's ven el menú, arman su pedido y lo envían ya redactado al WhatsApp del restaurante. Llegan por un QR en el local o por un link compartido en Instagram o WhatsApp.

**Éxito:** un cliente puede ir del link a un mensaje de WhatsApp con su pedido completo y el total correcto, desde el celular, sin ayuda.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Propósito | Ver el menú y pedir por WhatsApp. Sin pagos en línea ni cuentas de usuario. |
| Quién edita el menú | El equipo de desarrollo, editando `src/data/menu.ts` y volviendo a publicar. |
| Tipos de pedido | Para recoger y express. |
| Variantes | Tamaños con precio propio, elección carne/pollo, adicionales con precio fijo y notas libres. |
| Stack | Vite + React + TypeScript, sitio estático. Pruebas con Vitest. |
| Hosting | Gratuito, en Netlify o Cloudflare Pages. Se decide al publicar. |

## Fuera de alcance (v1)

Pagos en línea, panel de administración, platillos agotados, registro o historial de pedidos, cuentas de usuario, varios idiomas.

## Estructura

```
src/
  config.ts              datos del negocio (WhatsApp, envío, horario, dirección, redes)
  data/menu.ts           el menú completo; único archivo que cambia con los precios
  features/cart/         lógica del carrito (funciones puras + __tests__/)
  features/whatsapp/     armado del mensaje y del link (funciones puras + __tests__/)
  features/order-form/   validación del formulario (funciones puras + __tests__/)
  components/            piezas visuales; no calculan precios
  App.tsx
public/
  logo.png, favicon
```

**Regla:** los componentes no calculan precios ni arman texto del pedido. Todo eso sale de `features/*`.

## Modelo de datos

```ts
type Colones = number; // entero, sin decimales

interface MenuItem {
  id: string;                 // estable, en kebab-case: "bacon-cheese"
  name: string;
  description?: string;       // vacío si el menú impreso no trae descripción
  price?: Colones;            // precio fijo; ausente si el platillo tiene sizes
  sizes?: { id: string; label: string; price: Colones }[];
  choice?: { label: string; options: string[] };   // p. ej. "Proteína": ["Carne", "Pollo"]; no cambia el precio
  extras?: { id: string; label: string; price: Colones }[];
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  note?: string;              // aviso al final de la sección, p. ej. "Agrégale papas o aros por ₡1200"
  hasUnpricedExtras?: boolean; // desayunos: "adicionales desde ₡500" sin lista
}
```

Cada platillo tiene `price` o `sizes`, nunca los dos ni ninguno. Una prueba lo verifica.

### Cómo se mapea el menú impreso

- **Tamaños:** las 8 papas (Regular/Grande); Alitas y Boneless-Nuggets (6/12/18 unidades).
- **Elección de proteína:**
  - Carne o pollo: Twister Sándwich, Taco sencillo, Supertaco, Nachos de la Casa, Nachos Supremos, Burrito sencillo, Twister burrito, Quesadilla de pollo o carne.
  - Carne o queso: Enyucados.
  - Carne o pechuga de pollo: Bacon & Cheese, La Boss Burguer, Pizza Burguer.
- **Adicionales "Papas fritas" y "Aros de cebolla" (+₡1200 cada uno):** platillos de Tacos, Quesadillas, Pollo frito y Hamburguesas, que son las secciones donde el menú impreso los anuncia. Son dos adicionales independientes; el cliente puede marcar uno, el otro o los dos.
- **Adicional "Duplicar tamaño" (+₡2000):** Nachos de la Casa y Nachos Supremos.
- **Adicionales de desayuno:** la sección se marca con `hasUnpricedExtras`. El cliente los pide en las notas y el restaurante confirma el precio.

### Nombres

Se usan los nombres del menú impreso, con estas correcciones de ortografía: "Chesse" → "Cheese", "mozarella" → "mozzarella" y "Tortillas frita" → "Tortillas fritas". "Burguer" se mantiene porque forma parte del nombre de los platillos. Si el dueño prefiere otra cosa, se cambia en `menu.ts`.

## Carrito (`features/cart`)

- Una línea del carrito tiene: `itemId`, `sizeId?`, `choice?`, `extraIds[]`, `note?` y `quantity` (≥ 1).
- Dos líneas con el mismo platillo, tamaño, elección, adicionales y nota se combinan sumando cantidades.
- `lineTotal = (precio base o del tamaño + suma de adicionales) × cantidad`.
- `cartTotal` es la suma de las líneas.
- `needsPriceConfirmation` es verdadero si alguna línea es de una sección con `hasUnpricedExtras` y tiene nota.
- El carrito se guarda en `localStorage`. Si al cargarlo una línea apunta a un platillo, tamaño o adicional que ya no existe en el menú, esa línea se descarta.

## Pantallas

Una sola página, primero para celular y adaptable a escritorio.

**Estilo**

- Colores:
  - Fondo negro.
  - Rojo intenso en acentos y botones.
  - Títulos amarillos.
  - Texto blanco.
  - Precios en óvalo amarillo con texto negro.
- Colores definidos como variables CSS. Los componentes no usan valores hex sueltos.
- Tipografía tipo pincel para los títulos de sección y una sans legible para el resto, ambas de Google Fonts.
- Humo rojo suave solo en el encabezado.

**Partes**

1. **Encabezado:** logo, frase corta y botones "Pedir por WhatsApp" y "Ver menú".
2. **Barra de secciones:** fija arriba y deslizable de lado. Al tocar una sección baja hasta ella, y la sección visible queda marcada.
3. **Menú:** una tarjeta por platillo con nombre, descripción, precio ("desde ₡X" si tiene tamaños) y botón **+**. El `note` de la sección va al final de esta.
4. **Ventana de opciones** (sube desde abajo): tamaño, proteína, adicionales, notas y cantidad. El botón muestra el precio calculado: "Agregar · ₡3800". Si el platillo no tiene tamaños, elección ni adicionales, **+** lo agrega directo; las notas se pueden poner luego desde "Tu pedido".
5. **Barra del carrito:** visible con al menos un platillo. Muestra "N platillos · ₡total · Ver pedido".
6. **Tu pedido:**
   - Lista de platillos con controles para cambiar la cantidad, quitar y editar la nota.
   - Formulario: nombre, tipo de pedido (recoger o express), dirección y referencia (si es express), hora de recogida (si es para recoger, opcional), método de pago (efectivo, SINPE Móvil o tarjeta) y comentario.
   - Botón **"Enviar por WhatsApp"**.
7. **Pie de página:** horario, dirección y redes, solo los que estén definidos en `config.ts`.

## Flujo del pedido

1. **Validación** (`features/order-form`). Campos obligatorios: nombre, tipo de pedido, método de pago y, si es express, dirección. Cada campo que falta muestra un mensaje corto debajo, por ejemplo "Falta la dirección". El botón no envía mientras haya errores o el carrito esté vacío.
2. **Mensaje** (`features/whatsapp`):

```
¡Hola Kairos Food's! Quiero hacer un pedido 🍔

1× Bacon & Cheese (Pechuga de pollo) — ₡3800
   + Papas fritas — ₡1200
2× Taco sencillo (Carne) — ₡2000
1× Papipollo (Grande) — ₡5000
   Nota: sin pico de gallo

Total: ₡12000

Nombre: Ana
Tipo: Express
Dirección: Barrio X, 200 m sur de la iglesia
Pago: SINPE Móvil
Comentario: tocar el timbre

⚠️ Costo de envío por confirmar
```

   - El precio junto al platillo es (precio base o del tamaño) × cantidad. Cada adicional va en su propia línea con (precio del adicional) × cantidad. El total es la suma de todo, igual a `cartTotal`.
   - Si `needsPriceConfirmation`, se agrega "⚠️ Adicionales por confirmar".
   - Si es express y `config.deliveryFee` no está definido, se agrega "⚠️ Costo de envío por confirmar". Si está definido, aparece como línea "Envío" y se suma al total.
   - Las líneas de datos vacías (comentario, hora) no se incluyen.
3. **Envío.** Se abre `https://wa.me/<número>?text=<mensaje codificado>` en una pestaña nueva.
4. **Después del envío.** Al volver a la página se pregunta "¿Ya enviaste tu pedido?", con las opciones **"Sí, vaciar carrito"** y **"No, volver al pedido"**. El carrito nunca se vacía solo.

## Datos pendientes (`src/config.ts`)

```ts
export const config = {
  whatsappNumber: undefined as string | undefined, // formato internacional, p. ej. "50688887777"
  deliveryFee: undefined as number | undefined,
  hours: undefined as string | undefined,
  address: undefined as string | undefined,
  socials: [] as { label: string; url: string }[],
};
```

Mientras `whatsappNumber` no esté definido, el botón de enviar queda desactivado con el texto "Número pendiente". Ningún dato del negocio se inventa.

## Pruebas

Con Vitest, en los `__tests__/` de cada feature:

- **Menú:** cada platillo tiene `price` o `sizes` (exactamente uno), todos los precios son enteros positivos y los `id` no se repiten.
- **Carrito:** totales con tamaños, adicionales y cantidades; combinación de líneas iguales; descarte de líneas inválidas al cargar.
- **Validación:** cada campo obligatorio y la regla de dirección para express.
- **Mensaje:** el ejemplo de arriba sale exacto; los avisos de confirmación aparecen y desaparecen según el caso; el texto se codifica bien en la URL.

Antes de cada publicación se corren `npm test`, `npm run typecheck` y `npm run build`.

## Por confirmar con el dueño

Se arrastran de `docs/MENU.md` y no bloquean la v1:

- Precio de La Rascacielos (₡3800).
- Precio de Papas Fritas Grande (₡2700).
- Qué acompañamiento llevan los Strips de Pollo.
- Lista de adicionales de desayuno.
- Datos de `config.ts`: WhatsApp, costo de envío, horario, dirección y redes.
