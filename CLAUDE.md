# Kairos Foods: cliente de Horizon

Este repo es trabajo de Horizon Software Solutions para **Kairos Foods**. Las reglas generales (skills, conectores, confirmaciones) están en `~/.claude/CLAUDE.md`; aquí va solo el contexto del cliente.

## El negocio
- Soda tradicional costarricense que también vende street food. Dos públicos en el mismo menú:
  - **La soda:** desayuno típico, prensadas, casados y plato del día (₡2.950 con bebida). Gente que come cerca, todos los días, y busca precio y rapidez.
  - **El street food:** hamburguesas, tacos, nachos, burritos, papas cargadas, alitas y boneless. Antojo, para compartir, fin de semana y noche. Aquí están los platos más "fotografiables".
- 51 platillos en 11 categorías. Precios entre ₡800 (prensadas) y ₡9.900 (18 alitas); la mayoría de platos fuertes cuestan ₡2.950–₡3.800.
- Ventas cruzadas que ya usa: papas o aros por ₡1.200 adicionales, nachos al doble por ₡2.000, adicionales de desayuno desde ₡500.

## Lo que todavía no sabemos (pregúntale a Jose, no lo supongas)
Ubicación y zona de reparto · horario · cómo recibe pedidos hoy (WhatsApp, llamadas, apps de delivery) · métodos de pago (SINPE Móvil, tarjeta, efectivo) · redes sociales y número de WhatsApp · si tiene fotos reales de los platos · qué platos se venden más.

## Menú
- La fuente de verdad es `menu.json` (transcrito del menú impreso, con su ortografía original). Nunca inventes platos, precios ni ingredientes.
- Si un precio o dato cambia, se cambia en `menu.json` y todo lo demás lo lee de ahí. No copies precios a mano en otros archivos.
- La lista `pendiente_confirmar_con_el_negocio` de `menu.json` tiene las dudas abiertas (por ejemplo, el precio de La Rascacielos). No muestres esos datos como definitivos hasta que Jose confirme.
- Precios en colones con punto de miles: ₡3.800.

## Marca
- Logo: "Kairos" en letra de brocha, con la K y la R en rojo y el resto en blanco. "Foods" con la F roja. Gorro de chef amarillo sobre la K. Fondo negro con trazos de líneas blancas.
- Colores (tomados del logo y del menú; confirmar si hay archivos originales): Negro #000000 · Rojo #DD0815 · Blanco #F2F2F2 · Amarillo #F2E61B.
- Menú impreso actual: humo rojo sobre negro, títulos de sección en amarillo y precios dentro de óvalos amarillos.
- Voz: tica, cercana y antojadiza. El menú ya habla así ("Agrégale", "Duplicá"). Nada de lenguaje corporativo.

## Cómo trabajar este cliente
- Todo es **mobile-first**: la gente ve el menú y pide desde el celular.
- Diseño: `impeccable` (dirección y pulido), `design-taste-frontend` (que no se vea genérico), `frontend-ui-engineering` (accesible, rápido), `emil-design-eng` (detalles y animaciones). Conserva la identidad negro / rojo / amarillo, pero con contraste legible: en el menú impreso el texto sobre el humo cuesta leerlo.
- Contenido para redes: plantillas en Orshot o Canva con su marca. Textos en voz tica. Todo queda en Metricool **para revisión**; nada se publica sin aprobación del cliente.
- Imágenes: no uses fotos de stock ni imágenes generadas que parezcan los platos reales de Kairos. Si no hay fotos, usa marcadores claros y pídele las fotos a Jose.
- Archivos imprimibles (menú, volantes, cotizaciones): skills `pdf` y `xlsx`.

## Proyecto: sitio web
- Base aprobada: `docs/superpowers/specs/2026-10-22-menu-digital-design.md` (spec) y `docs/superpowers/plans/2026-10-22-menu-digital.md` (plan). Si chocan, gana el spec.
- Fuente del menú: `menu.json`. Instrucciones de trabajo y paradas de aprobación: `../kairos-foods/PROMPT-sitio-web.md`.
- Stack: Vite + React + TypeScript, sitio estático. Pruebas con Vitest. Comandos: `npm run dev`, `npm test`, `npm run typecheck`, `npm run build`.

### Estructura
- `menu.json`: menú (51 platillos, 11 categorías). `src/data/menu.ts` lo lee; no copies precios a mano.
- `src/config.ts`: datos del negocio (WhatsApp, horario, dirección, redes). `undefined` hasta que Jose los dé.
- `src/features/*`: lógica pura con pruebas en `__tests__/`. `src/components/`: solo UI, no calculan precios.
- `assets/logo-kairos.png` (logo), `assets/menu-impreso/` (referencia visual). `assets/brand/` y `assets/menu/` son copias de lo mismo.

### Límites
- Nada sale de la computadora sin OK de Jose: push a main, deploy, publicar, enviar.
- Nunca inventes dirección, horario, teléfono, platos ni precios. Si falta un dato, pregúntalo.
