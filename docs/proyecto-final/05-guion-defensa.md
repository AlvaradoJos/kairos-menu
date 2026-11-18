# Semana 5 · Guion de la presentación y demo final

Proyecto de Ingeniería del Software II · Prof. Erick Chaves · Versión del documento: 1 (2026-11-18)

Duración total: [PENDIENTE: minutos que da el profesor]. Los tiempos de abajo son **proporciones** sobre un ejemplo de 15 minutos; se escalan cuando se conozca la duración real.

Integrantes: **A** = [PENDIENTE], **B** = [PENDIENTE], **C** = [PENDIENTE]. Si son más o menos, se reparten los bloques; cada bloque lo presenta una sola persona y todos responden preguntas.

## Antes de empezar (checklist)

- [ ] Dos computadoras con el proyecto corriendo (`manual-instalacion.md` §9): la principal y una de respaldo.
- [ ] `.env` con el **número de pruebas**; nunca el del negocio.
- [ ] Carrito vacío: en la consola del navegador, `localStorage.clear()` y recargar.
- [ ] Celular con WhatsApp del número de pruebas, a mano para mostrar el mensaje que llega.
- [ ] Ventana del navegador en modo celular (DevTools → 390 × 844) o el sitio abierto en un celular.
- [ ] Terminal abierta en la carpeta del proyecto, lista para `npm test`.
- [ ] Respaldo si falla la red o WhatsApp: las capturas de `docs/proyecto-final/capturas/` y el mensaje de ejemplo de `04-pruebas.md` §3.3.

## Guion

| # | Bloque | Quién | Tiempo (de 15 min) | Qué se dice y se muestra |
|---|---|---|---|---|
| 1 | Problema y usuario | A | 2 min | Kairos es una soda que también vende street food. Hoy los pedidos llegan por WhatsApp escritos a mano: faltan datos, los precios se confunden y las apps de delivery cobran comisión. Evidencia: `01-propuesta.md` §2. |
| 2 | Objetivo y alcance | A | 1,5 min | Objetivo general y específicos. Qué incluye la v1 y **qué quedó afuera y por qué** (pagos, cuentas, panel, historial: todo exige servidor). |
| 3 | Demo en vivo | B | 4 min | Ver el recorrido de abajo. |
| 4 | Arquitectura y decisiones | C | 2 min | Diagrama de `02-prefactibilidad.md` §7. `menu.json` como única fuente de precios; lógica en `features/` y componentes que solo muestran; sitio estático, sin datos personales en un servidor. ADR 1, 2, 4 y 6. |
| 5 | Pruebas y calidad | C | 2,5 min | Correr `npm test` en vivo (141 pruebas). Matriz requisito → prueba, mutaciones (13 de 14 detectadas, 1 equivalente) y un defecto contado de punta a punta: D-01 (emojis) o D-05 (prueba intermitente). |
| 6 | Despliegue y estado | B | 1 min | GitHub Actions no publica si algo falla; la variable `PUBLICAR`; el número por variable de entorno. Mostrar la corrida en verde. [PENDIENTE: URL publicada, si se publica antes de la defensa] |
| 7 | Limitaciones, mejoras y uso de IA | A | 2 min | `05-informe-final.md`: limitaciones y mejoras. `05-uso-responsable-ia.md`: qué hizo la IA y qué revisó el equipo. |
| — | Preguntas | Todos | El resto | Cualquiera debe poder explicar cualquier parte. |

## Recorrido de la demo (bloque 3)

Datos sintéticos, iguales a los de las pruebas: nombre "Ana", dirección "Barrio X, 200 m sur de la iglesia".

1. Abrir el sitio en tamaño celular. Mostrar el encabezado y la barra de categorías; tocar **Hamburguesas** y ver que baja a la sección.
2. Tocar **+** en **Bacon & Chesse**: se abre la ventana de opciones. Elegir **Pechuga de pollo** y **Papas fritas**: el botón cambia a "Agregar · ₡5.000". Agregar.
3. Tocar **+** en **Taco sencillo**, sumar uno y agregar. La barra del carrito dice "3 platillos · ₡7.000".
4. **Recargar la página**: el carrito sigue ahí (se guarda en el celular).
5. Abrir **Ver pedido**. Tocar **Enviar por WhatsApp** con el formulario vacío: aparecen los errores debajo de cada campo y el foco va al primero.
6. Llenar: nombre Ana, **Express**, la dirección, **SINPE Móvil**. Mostrar el aviso "Costo de envío por confirmar". Opcional: **Compartir mi ubicación** (solo funciona en `localhost` o HTTPS).
7. **Enviar por WhatsApp**: se abre WhatsApp con el pedido escrito. Mostrar en el celular el mensaje que llega: platillos, adicionales, total igual al del carrito, datos y forma de pago.
8. Volver al sitio: aparece "¿Ya enviaste tu pedido?". Tocar **Sí, vaciar carrito**.

Si algo falla en vivo: decirlo con calma, pasar a la computadora de respaldo o a las capturas, y seguir.

## Preguntas probables y quién responde

| Pregunta | Responde | Dónde está la respuesta |
|---|---|---|
| ¿Por qué no hay base de datos ni pagos? | A | `01-propuesta.md` §4.2, ADR 1 |
| ¿Cómo se cambia un precio? | C | `README.md` → "Cambiar precios"; HU-07 |
| ¿Cómo saben que el total del mensaje es correcto? | C | Prueba "mensaje completo exacto, total igual al del carrito" (`flujo.test.tsx`) |
| ¿Qué pasa con los datos del cliente? | B | `02-prefactibilidad.md` §8: no salen del celular salvo en el mensaje que él envía |
| ¿Qué hizo la IA y qué hicieron ustedes? | Todos | `05-uso-responsable-ia.md` |
| ¿Qué defecto les costó más? | C | D-01 (`04-pruebas.md` §4) |
| ¿Por qué cambió el alcance con la ubicación? | A | Control de cambios, `02-prefactibilidad.md` §9.2 |
