# KAIROS — reglas del proyecto

KAIROS (**Kairos Foods**, "Kairos Food's" en el menú impreso) es una soda costarricense que también vende street food. No tiene relación con REPORA.

Este repo es la página web del menú digital: los clientes ven el menú, arman su pedido y lo envían por WhatsApp. El contexto del cliente está en `CLAUDE.md`.

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

- El menú está en `menu.json` (raíz del repo) y es el único archivo que cambia con los precios. `src/data/menu.ts` solo lo lee; una prueba verifica que nombres y precios coincidan.
- En `menu.json`, `id` no se cambia (lo usa el carrito guardado), `{precio}` en una nota se reemplaza por el precio del adicional y `por_confirmar` muestra el precio como pendiente.
- No inventar platillos, precios ni descripciones. Lo que no está en el menú se le pregunta al dueño.
- Los datos del negocio (WhatsApp, costo de envío, horario, dirección, redes) van en `src/config.ts`. Quedan sin definir hasta que el dueño los dé.
- La lógica va en `src/features/*/` como funciones puras con pruebas en `__tests__/`. Los componentes no calculan precios ni arman el texto del pedido.
- Los colores salen de las variables de `src/styles/tokens.css`. No hay valores hex fuera de ese archivo.
- Precios en colones enteros, mostrados con `formatColones` (`₡3.800`, punto de miles).
- Movimiento corto y siempre con alternativa para `prefers-reduced-motion`.

## Marca

- Logo: `assets/logo-kairos.png` (original). Publicadas: `public/logo.webp` (560 px) e `public/icon-192.png` (ícono).
- Paleta: negro #000000, rojo #DD0815, blanco #F2F2F2 y amarillo #F2E61B (gorro de chef, títulos y óvalos de precio).
- Letras: Kaushan Script para títulos de sección y Poppins para el resto.

## Pendiente del dueño

- La lista `pendiente_confirmar_con_el_negocio` de `menu.json` (precio de La Rascacielos, ortografía, adicionales de desayuno, etc.).
- Los datos de `src/config.ts`.
- Si los emojis del mensaje (🍔, ⚠️) llegan bien a WhatsApp en el celular; en la página de wa.me se ven como "�".
- Dónde publicar y, si se quiere, un dominio propio.
