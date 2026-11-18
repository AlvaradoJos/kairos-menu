# Semana 4 · Pruebas y calidad

Proyecto de Ingeniería del Software II · Prof. Erick Chaves
Peso: [PENDIENTE: peso] · Entrega: [PENDIENTE: fecha]
Equipo: [PENDIENTE: nombre del equipo] · Versión del documento: 2 (2026-11-18: se agrega la ubicación opcional, RF-16, y el defecto D-05)

Requisitos (RF/RNF) e historias (HU): `02-prefactibilidad.md`. Alcance (A1–A12): `01-propuesta.md`.

---

## 1. Plan de pruebas

### 1.1 Objetivo

Comprobar que la versión 1 cumple los requisitos imprescindibles y los criterios de aceptación de las historias HU-01 a HU-09, y encontrar y corregir defectos antes de liberar la versión candidata.

### 1.2 Alcance

| Dentro | Fuera (y por qué) |
|---|---|
| Lógica de precios, tamaños y adicionales (`features/menu`, `features/cart`) | Pagos, cuentas, panel de administración: no existen en la v1 (`01-propuesta.md` §4.2). |
| Carrito, combinación de líneas y guardado en el celular | Rendimiento bajo carga: el sitio es estático y no tiene servidor. |
| Validación del formulario y totales con envío | El comportamiento interno de WhatsApp después de abrir el enlace: es de un tercero; se cubre con una prueba manual en celular. |
| Armado del mensaje y del enlace de WhatsApp | Navegadores de escritorio antiguos: el público usa el celular. |
| Lectura del número desde la variable de entorno | |
| Ubicación opcional: permiso, fallos del GPS y enlace de Google Maps en el mensaje | La precisión real del GPS de cada celular: depende del aparato; se cubre con la prueba manual en celular. |
| Componentes y flujo completo de la app | |
| Accesibilidad básica (nombres, etiquetas, foco, errores asociados) | |

### 1.3 Niveles y técnicas

| Nivel | Qué prueba | Herramienta | Dónde |
|---|---|---|---|
| **Unitarias** | Funciones puras: precios, carrito, guardado, validación, totales, mensaje, número | Vitest | `src/features/*/__tests__/` |
| **Integración** | Componentes con la lógica real y el menú real (`menu.json`) | Vitest + Testing Library + jsdom | `src/components/__tests__/`, `src/__tests__/App.test.tsx` |
| **Funcionales** | El recorrido completo del cliente sobre `App`, con el número tomado de la variable de entorno | Vitest + Testing Library | `src/__tests__/flujo.test.tsx` |
| **Accesibilidad básica** | Todo control con nombre, campos con etiqueta, imágenes con `alt`, un solo `h1`, ventanas con título y `aria-modal`, errores asociados con `aria-describedby`, foco | Vitest + Testing Library | `flujo.test.tsx`, `ItemSheet.test.tsx`, `OrderView.test.tsx` |
| **Sistema (manual automatizada)** | El build de producción en Chrome a 390 × 844 px: recorrido, enlace generado, `localStorage`, errores de consola y scroll horizontal | Script con `puppeteer-core` (fuera del repo) | Sección 3.3 |
| **Calidad de las pruebas** | Mutaciones: se cambia una condición del código y se comprueba que alguna prueba falle | Script propio (fuera del repo) | Sección 3.4 |

Técnicas de diseño de casos: partición de equivalencia (recoger / express / sin tipo), valores límite (cantidad 0, 1, decimales; 10 y 15 dígitos del número), casos de error (JSON dañado, almacenamiento bloqueado, platillo borrado del menú) y casos de uso completos.

### 1.4 Datos de prueba

Solo datos sintéticos: nombre "Ana", dirección "Barrio X, 200 m sur de la iglesia", números `50688887777` y `50600000000`. El número real del negocio no aparece en pruebas, capturas ni ejemplos.

### 1.5 Criterios

- **Entrada:** el código compila y `npm ci` instala sin errores.
- **Salida (para la versión candidata):** `npm test`, `npm run typecheck` y `npm run build` sin fallos; ningún defecto de prioridad Alta abierto; todos los requisitos imprescindibles con al menos una prueba que pasa.

### 1.6 Responsables

| Actividad | Responsable |
|---|---|
| Pruebas unitarias e integración | [PENDIENTE: integrante] |
| Pruebas funcionales y de accesibilidad | [PENDIENTE: integrante] |
| Prueba manual en celular real | [PENDIENTE: integrante] |
| Registro de defectos y regresión | [PENDIENTE: integrante] |
| Revisión de código en pares | [PENDIENTE: integrantes] |

## 2. Matriz requisito → prueba

Los nombres de las pruebas son los que imprime `npx vitest run --reporter=verbose`. Abreviaturas: `cart` = `features/cart/__tests__/cart.test.ts`, `flujo` = `src/__tests__/flujo.test.tsx`, y así con cada archivo.

| Req. | HU | Prioridad | Pruebas | Resultado |
|---|---|---|---|---|
| RF-01 Menú completo desde `menu.json`, precios ₡3.800 | HU-01 | I | `menu`: 11 secciones en orden; 51 platillos; price o sizes; enteros positivos; ids sin repetir; nombres y precios tal cual de `menu.json` · `price`: antepone ₡ y punto de miles; "desde" el tamaño más barato | Pasa |
| RF-02 Barra de categorías | HU-01 | D | `SectionNav`: centra el botón activo (con y sin menos movimiento) · Manual: tocar "Hamburguesas" baja a la sección (captura 02) | Pasa |
| RF-03 Tamaño, proteína, adicionales, notas, cantidad | HU-02 | I | `ItemSheet`: precio con tamaño y cantidad; proteína y adicionales; no baja de 1; tocar dentro no cierra · `cart`: lineTotal con tamaño y adicionales por unidad · `flujo`: recorrido completo | Pasa |
| RF-04 Agregar sin opciones con un toque | HU-02 | D | `App`: anuncia el platillo agregado; vuelve a anunciar | Pasa |
| RF-05 Total y combinación de líneas | HU-03 | I | `cart`: addLine combina iguales (adicionales en otro orden, notas con espacios); cartTotal; itemCount | Pasa |
| RF-06 Guardar el carrito y descartar lo inválido | HU-03 | D | `storage`: 10 casos (JSON dañado, almacenamiento bloqueado, cantidad 0/negativa/decimal, líneas inválidas) · `flujo`: el carrito sigue al volver; platillo borrado se descarta | Pasa |
| RF-07 Cambiar cantidad, quitar, notas | HU-03 | I | `OrderView`: suma y resta unidades y recalcula; quitar el único platillo · `cart`: setQuantity, setNote, removeLine | Pasa |
| RF-08 Validación del formulario | HU-04 | I | `validation`: 6 casos · `OrderView`: marca faltantes y no abre WhatsApp; dirección solo si express · `flujo`: errores asociados al campo y foco en el primero | Pasa |
| RF-09 Mensaje y apertura de WhatsApp | HU-04 | I | `message`: 18 casos (ejemplo exacto, adicionales × cantidad, envío, hora solo para recoger, una línea por campo, sin emojis, enlace que conserva emojis) · `OrderView`: abre WhatsApp y pregunta · `flujo`: mensaje completo exacto, total igual al del carrito | Pasa |
| RF-10 Avisos de precios por confirmar | HU-05 | I | `menu`: marca por confirmar · `totals`: orderWarnings (3 casos) · `CartBar` y `App`: total "aprox." · `ItemSheet`: avisa precio por confirmar | Pasa |
| RF-11 "¿Ya enviaste tu pedido?" | HU-06 | D | `OrderView`: "No, volver" no vacía; foco y Escape · `flujo`: "Sí, vaciar carrito" vacía y cierra | Pasa |
| RF-12 Sin número no se envía | HU-04 | I | `OrderView`: botón desactivado · `flujo`: sin número se arma el pedido pero no se envía | Pasa |
| RF-13 Número por variable de entorno | HU-08 | I | `number`: 7 casos (vacío, espacios, formato, límites 10–15, letras) · `flujo`: usa el número de `VITE_WHATSAPP_NUMBER` | Pasa |
| RF-14 Pie con horario, dirección y redes | — | O | **Sin prueba automática.** El negocio no ha dado los datos; se prueba cuando existan. | No probado |
| RF-15 Envío sumado al total | HU-05 | O | `totals`: deliveryFeeFor (con y sin tipo), orderTotal · `message`: línea de envío · `OrderView`: suma el envío | Pasa |
| RF-16 Ubicación opcional en express | HU-09 | D | `location`: 5 casos (enlace con 6 decimales, punto del GPS, permiso negado, GPS no disponible, navegador sin GPS) · `message`: línea `Ubicación:` solo en express · `OrderView`: botón solo en express, adjunta el enlace, quitar la ubicación, sin permiso avisa y deja enviar | Pasa |
| RNF-01 360–390 px sin scroll horizontal | — | I | Manual automatizada (§3.3): `scrollWidth <= innerWidth` a 390 px | Pasa |
| RNF-02 Accesibilidad básica | — | I | `flujo`: 3 pruebas de accesibilidad · `ItemSheet` y `OrderView`: foco dentro, Escape, foco devuelto · `SectionNav`: respeta menos movimiento | Pasa |
| RNF-03 Lighthouse ≥ 90 | — | D | Medido el 2026-10-22: 96 / 100 / 100 / 100. [PENDIENTE: volver a medir sobre la versión candidata] | Pasa (medición anterior) |
| RNF-04 Precios solo en `menu.json` | HU-07 | I | `menu`: nombres y precios salen tal cual de `menu.json` | Pasa |
| RNF-05 Sin recursos de terceros, CSP | — | D | Manual: `dist/index.html` trae la `Content-Security-Policy` con `default-src 'self'` | Pasa |
| RNF-06 No publica si fallan las revisiones | HU-07 | I | Configuración del workflow: `deploy` necesita `check`. [PENDIENTE: ver una corrida en GitHub Actions] | Configurado |

**Cobertura de criterios de aceptación:** todos los criterios de HU-01 a HU-09 tienen al menos una prueba, salvo "tocar una categoría baja hasta esa sección" (HU-01), que se comprobó a mano en el navegador porque jsdom no hace scroll.

## 3. Resultados

### 3.1 Inventario de pruebas

| Archivo | Nivel | Pruebas |
|---|---|---|
| `features/cart/__tests__/cart.test.ts` | Unitaria | 32 |
| `features/whatsapp/__tests__/message.test.ts` | Unitaria | 18 |
| `features/menu/__tests__/menu.test.ts` | Unitaria (datos reales) | 13 |
| `features/cart/__tests__/storage.test.ts` | Unitaria | 10 |
| `features/order-form/__tests__/totals.test.ts` | Unitaria | 7 |
| `features/whatsapp/__tests__/number.test.ts` | Unitaria | 7 |
| `features/menu/__tests__/price.test.ts` | Unitaria | 6 |
| `features/order-form/__tests__/validation.test.ts` | Unitaria | 6 |
| `features/location/__tests__/location.test.ts` | Unitaria | 5 |
| `components/__tests__/OrderView.test.tsx` | Integración | 16 |
| `components/__tests__/ItemSheet.test.tsx` | Integración | 7 |
| `components/__tests__/CartBar.test.tsx` | Integración | 2 |
| `components/__tests__/SectionNav.test.tsx` | Integración | 2 |
| `__tests__/App.test.tsx` | Integración | 3 |
| `__tests__/flujo.test.tsx` | Funcional y accesibilidad | 7 |
| **Total** | | **141** |

Pruebas nuevas esta semana: 25 (de 116 a 141). 14 son el flujo completo, la persistencia, el estado sin número, la accesibilidad, la regresión de D-01 y las que cierran los huecos de la sección 3.4; 11 son de la ubicación (RF-16).

### 3.2 Comandos (salida real, 2026-11-18)

`npm test`

```
 Test Files  15 passed (15)
      Tests  141 passed (141)
   Start at  15:40:18
   Duration  12.07s (environment 55%, tests 30%, import 13%, transform 1%, worker 1%)
```

`npm run typecheck`

```
> kairos-menu@0.1.0 typecheck
> tsc --noEmit

exit=0
```

`npm run build`

```
> kairos-menu@0.1.0 build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 45 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                                   1.18 kB │ gzip:  0.56 kB
dist/assets/index-BWmGwpnL.css                                   15.53 kB │ gzip:  3.51 kB
dist/assets/index-r5jXyhNV.js                                   254.11 kB │ gzip: 78.54 kB

✓ built in 403ms
```

(Se omitieron las líneas de los archivos de fuentes `.woff`/`.woff2`.)

`npm audit`

```
found 0 vulnerabilities
```

### 3.3 Prueba de sistema en navegador

Corrida el 2026-11-07, antes de la ubicación. [PENDIENTE: repetirla sobre la versión candidata, incluyendo "Compartir mi ubicación" con permiso concedido y negado.]

Build de producción con `VITE_WHATSAPP_NUMBER=50600000000`, Chrome sin interfaz, 390 × 844 px, `window.open` interceptado para no abrir WhatsApp. Se agregaron Bacon & Chesse (pechuga, papas fritas, nota `extra salsa 🌶️`) y 2 tacos, y se llenó el formulario para express con SINPE Móvil.

```json
{
  "noHScroll": true,
  "url": "https://api.whatsapp.com/send?phone=50600000000",
  "message": "¡Hola Kairos Food's! Quiero hacer un pedido\n\n1× Bacon & Chesse (Pechuga de pollo) — ₡3.800\n   + Papas fritas — ₡1.200\n   Nota: extra salsa 🌶️\n2× Taco sencillo (Carne) — ₡2.000\n\nTotal: ₡7.000\n\nNombre: Ana\nTipo: Express\nDirección: Barrio X, 200 m sur de la iglesia\nPago: SINPE Móvil\n\nCosto de envío por confirmar",
  "errors": []
}
```

### 3.4 Calidad de las pruebas (mutaciones)

Se cambiaron a propósito 14 condiciones del código, una a la vez, y se corrió la suite completa. Una mutación "sobrevive" si ninguna prueba falla: es un hueco.

| Mutación | Antes | Después |
|---|---|---|
| Validación: dirección sin `trim()` | Detectada | Detectada |
| Validación: no pedir método de pago | Detectada | Detectada |
| Envío cobrado si el tipo no es "recoger" (también sin tipo) | **Sobrevive** | Detectada (`totals`: no cobra envío sin tipo) |
| Adicionales sin multiplicar por cantidad | Detectada | Detectada |
| Cantidad 0 aceptada en el carrito | Detectada | Detectada |
| Notas con espacios distintos no se combinan | Detectada | Detectada |
| Cantidad 0 aceptada al cargar el carrito guardado | **Sobrevive** | Detectada (`storage`: cantidad 0 sin otra línea igual) |
| Hora de recogida en pedidos express | **Sobrevive** | Detectada (`message`: hora escrita y después express) |
| Adicional sin multiplicar en el mensaje | Detectada | Detectada |
| Número de 8 dígitos aceptado | Detectada | Detectada |
| "desde" con el primer tamaño y no el más barato | Detectada | Detectada |
| Envío con el carrito vacío | **Sobrevive** | Sobrevive: **equivalente**, con el carrito vacío el formulario no se muestra |
| Tocar dentro de la ventana de opciones la cierra | **Sobrevive** | Detectada (`ItemSheet`: tocar dentro no cierra) |
| "Sumar uno" en el pedido no suma | **Sobrevive** | Detectada (`OrderView`: suma y resta unidades) |

Además, quitar "vaciar carrito" en "Sí, vaciar carrito" o quitar `aria-describedby` de los errores hace fallar `flujo`.

## 4. Registro de defectos

Prioridad: **Alta** = el cliente o el negocio reciben información incorrecta; **Media** = riesgo de seguridad o privacidad, o algo que puede frenar la publicación (el workflow no publica si falla una prueba); **Baja** = mejora o caso poco probable.

| ID | Prioridad | Defecto | Pasos para reproducir | Esperado | Obtenido | Estado |
|---|---|---|---|---|---|---|
| **D-01** | Alta | Los emojis que el cliente escribe (en notas, nombre, dirección o comentario) llegan a WhatsApp como "�". | 1. Agregar cualquier platillo. 2. En la nota escribir `extra salsa 🌶️`. 3. Llenar el formulario y tocar "Enviar por WhatsApp". 4. Ver el texto en WhatsApp. (Comprobado sin enviar nada: `curl -I "https://wa.me/50600000000?text=Hola%20%F0%9F%8D%94"` devuelve `Location: …text=Hola+%EF%BF%BD…`.) | El emoji llega igual. | La redirección de `wa.me` cambia el emoji por U+FFFD "�". La ñ y el ₡ sí llegan bien. | **Corregido** (el enlace usa `api.whatsapp.com/send`, que conserva el emoji). Regresión: 4 pruebas en `message`, 1 en `OrderView`, 1 en `flujo` y el navegador (§3.3). [PENDIENTE: confirmar en un celular real con el número de pruebas] |
| **D-02** | Media | El número real del negocio quedó en el historial de git. | `git log -p -- src/config.ts` y buscar el commit `1840854`. | El número no está en el repo. | Ya no está en el código ni en el build (semana 3), pero sí en ese commit. | **Mitigado.** [PENDIENTE: decidir si se reescribe el historial antes de hacer público el repo] |
| **D-03** | Baja | La cantidad no tiene tope: se puede pedir, por ejemplo, 250 alitas tocando "+". | 1. Abrir Alitas. 2. Tocar "Sumar uno" muchas veces. 3. Agregar. | Un tope razonable o una confirmación. | Se agrega cualquier cantidad. | **Abierto.** El spec no fija un tope. [PENDIENTE: preguntar al negocio si quiere uno] |
| **D-05** | Media | La prueba del flujo completo falla de forma intermitente por tiempo. | Correr `npx vitest run` varias veces seguidas en Windows. | Las 141 pruebas pasan siempre. | En 4 de 5 corridas, "menú → opciones → carrito → formulario → WhatsApp → vaciar" pasa el límite de 5 s de Vitest (tarda ~4 s sola y más con la suite en paralelo); a veces arrastra a la prueba siguiente. La app funciona bien: el problema es el límite de la prueba. | **Corregido:** el grupo "Flujo completo" tiene un límite de 20 s, con comentario. Regresión: 6 corridas seguidas, 141 de 141. |
| **D-04** | Baja | La hora de recogida acepta cualquier hora, por ejemplo 03:00. | 1. Elegir "Para recoger". 2. Poner 03:00 en "Hora a la que pasas". 3. Enviar. | Avisar si está fuera del horario. | Se envía sin aviso. | **Diferido.** No se conoce el horario del negocio. |

**Huecos de prueba encontrados y cerrados:** los 5 de la sección 3.4 (envío sin tipo, cantidad 0 guardada, hora en express, tocar dentro de la ventana, "Sumar uno" en el pedido). En todos, el código ya funcionaba bien; lo que faltaba era la prueba.

**Regresión:** después de corregir D-01 se corrió la suite completa (130 de 130 pasan), el chequeo de tipos, el build y el recorrido en el navegador (§3.3). Después de agregar la ubicación y corregir D-05 se corrió la suite 6 veces seguidas (141 de 141 en todas), el chequeo de tipos, el build y `npm audit`.

## 5. Revisión de código

Revisión completa de `src/` (1.355 líneas) con la skill `code-review-and-quality`, en cinco ejes. [PENDIENTE: revisión en pares por al menos un integrante, según `README.md` → "Revisión por pares".]

| Eje | Resultado |
|---|---|
| **Correctitud** | Un defecto real (D-01, corregido). La lógica de precios y carrito está bien cubierta: las mutaciones de cálculo se detectan todas. |
| **Legibilidad** | Nombres claros y en el idioma del dominio; comentarios que explican el porqué (por ejemplo, la `key` por índice en `OrderView`). |
| **Arquitectura** | Se respeta la regla del proyecto: los componentes no calculan precios ni arman el mensaje; todo está en `src/features/*`. `menu.json` es la única fuente de precios. |
| **Seguridad** | Sin secretos en el código (número por variable de entorno). Lo que escribe el cliente solo se usa dentro de `encodeURIComponent` y en JSX, que escapa el texto: no hay inyección. CSP `default-src 'self'`, enlaces externos con `noopener`. `npm audit`: 0 vulnerabilidades. |
| **Rendimiento** | JS de 252 kB (77,8 kB comprimido). `resolveLine` recorre el menú por cada línea, pero con 51 platillos el costo es despreciable. |

Hallazgos:

| Severidad | Hallazgo | Acción |
|---|---|---|
| Requerido | D-01: `wa.me` rompe los emojis. | Corregido. |
| Considerar | D-03: cantidad sin tope. | Queda abierto para decidir con el negocio. |
| Considerar | La ubicación es un dato personal preciso. Se pide solo cuando el cliente toca el botón, no se guarda en `localStorage` y solo viaja en el mensaje que el cliente envía. | Anotado en `02-prefactibilidad.md` §8. |
| Requerido | D-05: prueba intermitente por tiempo. | Corregido. |
| Nit | `orderWarnings` usa `item!` (aserción de no nulo) después de un `filter`; un filtro con tipo (`(i): i is MenuItem => …`) evitaría el `!`. | No se cambia en esta versión: no afecta el comportamiento. |
| Nit | En `OrderView` y `App`, `onClose` se crea en cada render y `useDialogFocus` vuelve a registrar el listener de teclado. | Sin impacto medible; no se cambia. |
| FYI | `OrderLine` usa el índice como `key` a propósito, para no perder el foco mientras se escribe la nota (comentado en el código). | — |

**Veredicto:** aprobado para versión candidata, con D-01 corregido.

## 6. Versión candidata

Propuesta: **`v1.0.0-rc.1`** (formato de versionado semántico; el punto antes del número hace que `rc.10` se ordene después de `rc.9`).

Antes de crearla:

1. Unir la rama a `main` con un pull request revisado.
2. Ver en verde la corrida de GitHub Actions sobre `main`.
3. Confirmar D-01 en un celular real con el número de pruebas.
4. Cambiar `"version"` en `package.json` de `0.1.0` a `1.0.0-rc.1`.

Comandos que se usarían. **No se ejecutaron: falta tu OK.**

```bash
git tag -a v1.0.0-rc.1 -m "Versión candidata 1 del menú digital de Kairos"
git push origin v1.0.0-rc.1
```

## 7. Cambios en el repositorio esta semana

| Cambio | Archivos |
|---|---|
| D-01: el enlace usa `api.whatsapp.com/send` en vez de `wa.me` (prueba primero). | `src/features/whatsapp/message.ts` y sus pruebas, `src/components/__tests__/OrderView.test.tsx` |
| Pruebas funcionales y de accesibilidad de la app completa. | `src/__tests__/flujo.test.tsx` (nuevo) |
| Pruebas que cierran los huecos de mutación. | `totals`, `storage`, `message`, `ItemSheet`, `OrderView` |
| ADR 1 y ADR 3 actualizados; control de cambios con la desviación del spec. | `docs/adr/`, `02-prefactibilidad.md` |
| Ubicación opcional en express (A13, RF-16, HU-09), con 11 pruebas; registrada como cambio de alcance. | `src/features/location/`, `OrderView.tsx`, `message.ts`, `validation.ts` (commit `d4f9aac`); `01`, `02`, `03` |
| D-05: límite de 20 s para el grupo "Flujo completo". | `src/__tests__/flujo.test.tsx` |
| Referencias a `wa.me` corregidas en los documentos. | `01-propuesta.md`, `02-prefactibilidad.md`, `03-diseno.md`, `README.md` |
