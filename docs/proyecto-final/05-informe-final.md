# Semana 5 · Informe final ejecutivo

Proyecto de Ingeniería del Software II · Prof. Erick Chaves · Equipo: [PENDIENTE: nombre del equipo] · 2026-11-18

## Qué se construyó

Un menú digital para el celular de **Kairos Foods**, una soda costarricense que también vende street food. El cliente ve los 51 platillos de las 11 categorías, elige tamaño, proteína y adicionales, arma el carrito y envía el pedido ya escrito por WhatsApp, donde el negocio lo confirma como siempre. No hay comisiones de apps de delivery, ni cuentas, ni servidor.

## Alcance logrado

| | Planeado (`01-propuesta.md`) | Estado |
|---|---|---|
| Menú, categorías, opciones y adicionales (A1–A3) | Sí | Hecho |
| Carrito guardado en el celular y "Tu pedido" (A4–A5) | Sí | Hecho |
| Formulario con validación y mensaje de WhatsApp (A6–A7) | Sí | Hecho |
| Avisos de precios por confirmar y "¿Ya enviaste tu pedido?" (A8–A9) | Sí | Hecho |
| Accesibilidad básica a 390 px (A10) | Sí | Hecho |
| Revisión automática y publicación en GitHub Pages (A11) | Sí | Configurado; [PENDIENTE: publicado] |
| Número de pruebas por variable de entorno (A12) | Sí | Hecho |
| Ubicación opcional por GPS en express (A13) | Cambio de alcance | Hecho; [PENDIENTE: aprobación] |

Los 16 requisitos funcionales están implementados y 15 tienen pruebas automáticas. RF-14 (horario, dirección y redes en el pie) y RF-15 (costo de envío) funcionan, pero esperan los datos del negocio; RF-14 se prueba cuando existan. Queda afuera, por decisión, todo lo que exige un servidor: pagos en línea, cuentas, panel de administración, historial y seguimiento de pedidos (`01-propuesta.md` §4.2).

## Arquitectura

Sitio estático con **Vite + React + TypeScript**. El menú vive en un solo archivo, `menu.json`, que es la única fuente de precios. La lógica (precios, carrito, validación, mensaje, número, ubicación) está en `src/features/*` como funciones puras con sus pruebas; los componentes de `src/components/` solo muestran y no calculan. El carrito se guarda en `localStorage` del celular; los datos del cliente viajan únicamente en el mensaje que él mismo envía desde su WhatsApp. GitHub Actions corre pruebas, tipos y build en cada cambio y publica en GitHub Pages solo desde `main` y con la variable `PUBLICAR`. Detalle y diagramas: `02-prefactibilidad.md` §7 y `03-diseno.md`. Decisiones: ADR 1 a 6.

## Pruebas

- **141 pruebas automáticas en 15 archivos**, todas pasan: unitarias (precios, carrito, guardado, validación, totales, mensaje, número, ubicación), de integración (componentes con el menú real) y funcionales (el recorrido completo de un cliente sobre la app, con accesibilidad básica).
- `npm run typecheck` y `npm run build` sin errores; `npm audit`: 0 vulnerabilidades.
- **Matriz requisito → prueba:** todo requisito imprescindible tiene al menos una prueba que pasa (`04-pruebas.md` §2).
- **Calidad de las pruebas:** de 14 mutaciones a propósito del código, 13 las detecta alguna prueba; la otra es equivalente (no cambia el comportamiento).
- **Prueba de sistema:** el build de producción en Chrome a 390 × 844 px, sin scroll horizontal ni errores de consola. Lighthouse móvil (2026-10-22): 96 / 100 / 100 / 100.

## Defectos

| ID | Prioridad | Estado |
|---|---|---|
| D-01 Emojis del cliente llegaban como "�" (por `wa.me`) | Alta | Corregido; [PENDIENTE: confirmar en celular real] |
| D-02 Número real del negocio en el historial de git | Media | Mitigado; [PENDIENTE: decidir antes de hacer público el repo] |
| D-05 Prueba del flujo completo fallaba por tiempo | Media | Corregido |
| D-03 Cantidad sin tope | Baja | Abierto (decisión del negocio) |
| D-04 Hora de recogida fuera de horario | Baja | Diferido (no se conoce el horario) |

## Limitaciones conocidas

- El costo de envío no se calcula: el mensaje dice "por confirmar" y el negocio lo da por WhatsApp, ahora con la ubicación del cliente si la comparte.
- No hay fotos de los platillos: el negocio no las ha enviado y no se usan fotos de stock.
- Faltan datos del negocio: horario, dirección, redes, precio de La Rascacielos y la lista de adicionales de desayuno.
- GitHub Pages gratis exige repositorio público; hoy es privado (ADR 4).
- El sitio no sabe si el pedido se envió de verdad: WhatsApp es de un tercero, por eso pregunta "¿Ya enviaste tu pedido?".

## Mejoras futuras

1. Fotos reales de los platillos, cuando el negocio las tenga.
2. Calcular el envío por zona o distancia con la ubicación, cuando el negocio defina su tarifa.
3. Avisar si la hora de recogida queda fuera del horario (D-04) y un tope de cantidad (D-03).
4. Marcar platillos agotados, lo que ya exige un servidor pequeño.
5. Dominio propio y medir cuántos pedidos llegan por el sitio.

## Uso de IA

Se usó Claude Code como asistente en el diseño, el código, las pruebas y la documentación; el detalle de herramientas, partes y revisión del equipo está en `05-uso-responsable-ia.md`.
