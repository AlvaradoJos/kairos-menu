# Semana 1 · Propuesta: idea, problema y alcance

Proyecto de Ingeniería del Software II · Prof. Erick Chaves
Peso: 10 % · Entrega: lunes 9 de noviembre de 2026
Equipo: [PENDIENTE: nombre del equipo] · Versión del documento: 1 (2026-11-07)

> **Nota de transparencia.** Antes de empezar el curso ya existía una primera versión del sitio (spec y plan del 2026-10-22, ver `docs/superpowers/`). Este documento formaliza la propuesta y fija el alcance contra el que se evalúa; el alcance de la versión 1 coincide con lo que el código ya hace o con lo que se completa en las semanas 3 y 4.

---

## 1. Ficha de la propuesta

| Campo | Contenido |
|---|---|
| **Nombre** | Kairos · Menú digital y pedidos por WhatsApp |
| **Contexto** | Kairos Foods es una soda tradicional costarricense que también vende street food. Tiene dos públicos en el mismo menú: la soda (desayuno típico, prensadas, casados y plato del día) para gente que come cerca todos los días, y el street food (hamburguesas, tacos, nachos, burritos, papas, alitas) para antojo, compartir, fin de semana y noche. El menú tiene 51 platillos en 11 categorías, con precios entre ₡800 y ₡9.900, y hoy existe como menú impreso (5 imágenes enviadas por el negocio el 2026-10-20). |
| **Problema** | El menú solo existe impreso o como imágenes. Quien quiere pedir desde el celular tiene que leer una foto del menú (texto sobre fondo de humo, difícil de leer), escribir el pedido a mano y calcular el total sin ayuda. Los platillos tienen tamaños, elección de proteína y adicionales con precio, así que es fácil que el pedido llegue incompleto (sin tamaño, sin proteína, sin dirección o sin método de pago) y que el negocio tenga que preguntar de nuevo. [PENDIENTE: confirmar con el negocio cómo recibe pedidos hoy y qué errores son frecuentes; ver sección 2.] |
| **Usuarios** | (1) **Cliente** que pide desde el celular, para recoger o express. (2) **Personal del negocio** que recibe el pedido en WhatsApp y lo confirma. (3) **Equipo de desarrollo**, que mantiene el menú en `menu.json` y publica cambios. |
| **Justificación** | WhatsApp es la aplicación más usada en Costa Rica (ver sección 2), así que el pedido llega por un canal que el cliente y el negocio ya usan, sin instalar nada. Un sitio estático no tiene costo mensual de servidor ni comisión por pedido, a diferencia de las plataformas de delivery. El cálculo de precios queda en código con pruebas, no en la cabeza de quien escribe el pedido. |
| **Solución propuesta** | Un sitio web estático, pensado primero para celular, donde el cliente ve el menú por categorías, elige platillo, tamaño, proteína, adicionales, notas y cantidad, revisa su pedido con el total calculado, llena un formulario corto (nombre, recoger o express, dirección, pago) y lo envía ya redactado al WhatsApp del negocio. Sin servidor, sin cuentas y sin pagos en línea. Stack: Vite, React, TypeScript y Vitest; publicación en GitHub Pages. |

## 2. Evidencia de que el problema existe

### 2.1 Del negocio

- **Lo que sí hay:** el menú impreso enviado por el negocio el 2026-10-20 (`assets/menu-impreso/`), que muestra la estructura de tamaños, proteínas y adicionales con precio que el cliente debe combinar a mano, y la decisión del negocio de recibir pedidos por WhatsApp (número confirmado el 2026-10-24).
- **Entrevista:** [PENDIENTE: entrevista con el negocio. Fecha, quién la hizo, quién respondió (por rol, sin datos personales) y respuestas resumidas.]

Guion propuesto para la entrevista (15 minutos):

1. ¿Cómo reciben pedidos hoy? (WhatsApp, llamadas, en el local, apps de delivery) ¿Qué porcentaje aproximado por cada canal?
2. Cuando un pedido llega por WhatsApp, ¿qué datos faltan con más frecuencia? ¿Cuántas veces hay que volver a preguntar?
3. ¿Han tenido errores de precio o de platillo? ¿Qué pasó?
4. ¿Usan Uber Eats, Rappi u otra app? ¿Qué comisión pagan y qué les parece?
5. ¿Qué platillos se venden más? ¿En qué horario hay más pedidos?
6. ¿Hacen express? ¿A qué zona y con qué costo?
7. ¿Qué métodos de pago aceptan?
8. Si el pedido les llegara ya escrito con el total, ¿qué les gustaría que dijera el mensaje?

### 2.2 Fuentes de apoyo

| Dato | Fuente |
|---|---|
| El 96 % de la población adulta con celular en Costa Rica usa WhatsApp, y el 95 % dice usarlo de forma intensa (encuesta telefónica a 792 personas, agosto 2025, ±3,5 pp). | CICOM-UCR, *Nuestras apps de cada día 2025*. https://cicom.ucr.ac.cr/cicom_informe_apps-2025/ · Nota de prensa: https://crhoy.com/tecnologia/informe-casi-toda-la-poblacion-costarricense-usa-whatsapp/ |
| La Cámara Costarricense de Restaurantes pidió a Uber Eats, Glovo y Rappi bajar a la mitad sus comisiones, lo que muestra que la comisión por pedido es una carga para los restaurantes. | El Observador CR. https://observador.cr/noticia/restaurantes-piden-a-empresas-repartidoras-que-bajen-a-la-mitad-las-tarifas-de-comision/ |
| Explicación de cómo funcionan las apps de entrega y su relación con los restaurantes en Costa Rica. | El Financiero CR. https://www.elfinancierocr.com/negocios/ef-explica-apps-de-entrega-y-restaurantes/TMWJMJSIFNHGVN57PUDDZ5EVFY/story/ |

[PENDIENTE: el equipo debe abrir cada fuente, confirmar la cifra y anotar la fecha de consulta antes de entregar.]

Estas fuentes muestran que el canal (WhatsApp) es adecuado y que la alternativa (apps de delivery) tiene un costo; **no** prueban por sí solas que Kairos tenga el problema. Eso lo tiene que mostrar la entrevista.

## 3. Objetivos

Redactados con verbos del nivel 4 de la taxonomía de Bloom (analizar).

**Objetivo general.** Integrar el menú de Kairos Foods y el armado de pedidos en un sitio web estático para celular, que envíe por WhatsApp pedidos completos y con el total calculado, sin costos de servidor ni comisiones.

**Objetivos específicos.**

1. **Analizar** el proceso actual de toma de pedidos de Kairos Foods mediante una entrevista con el negocio, para identificar qué datos necesita cada pedido y qué errores ocurren hoy.
2. **Organizar** los 51 platillos del menú impreso en una sola fuente de datos (`menu.json`) que **diferencie** precio fijo, tamaños, elección de proteína y adicionales con precio, de modo que ningún precio se copie a mano en otro archivo.
3. **Integrar** el carrito, la validación del formulario y el armado del mensaje de WhatsApp en un flujo de punta a punta que funcione desde el celular.
4. **Comparar** el comportamiento del sitio con los criterios de aceptación de cada historia de usuario mediante pruebas automatizadas (unitarias, de integración y funcionales) y una prueba de pedido completo en un celular.

## 4. Alcance de la versión 1

### 4.1 Incluye

| # | Funcionalidad | Estado hoy |
|---|---|---|
| A1 | Menú de 51 platillos en 11 categorías, leído de `menu.json`, con precios en formato ₡3.800. | Hecho |
| A2 | Barra de categorías fija que lleva a cada sección y marca la sección visible. | Hecho |
| A3 | Ventana de opciones por platillo: tamaño, proteína, adicionales con precio, notas y cantidad, con el precio calculado en el botón. | Hecho |
| A4 | Carrito con totales, combinación de líneas iguales y guardado en el celular (`localStorage`). | Hecho |
| A5 | Vista "Tu pedido": cambiar cantidad, quitar platillos y editar notas. | Hecho |
| A6 | Formulario: nombre, recoger o express, dirección (obligatoria si es express), hora de recogida opcional, método de pago y comentario, con mensajes de error por campo. | Hecho |
| A7 | Mensaje de WhatsApp armado automáticamente y apertura de WhatsApp con el texto listo. | Hecho |
| A8 | Avisos de "Precio por confirmar", "Costo de envío por confirmar" y adicionales de desayuno por confirmar. | Hecho |
| A9 | Pregunta "¿Ya enviaste tu pedido?" al volver, sin vaciar el carrito solo. | Hecho |
| A10 | Accesibilidad básica: controles de 44 px o más, foco en ventanas, sin scroll horizontal a 390 px. | Hecho |
| A11 | Publicación en GitHub Pages con revisión automática (pruebas, tipos y build). | Configurado, sin publicar |
| A12 | Número de WhatsApp de pruebas para la demo, separado del número real del negocio. | Semana 3 / 5 |
| A13 | Ubicación opcional por GPS en pedidos express: el mensaje lleva un enlace de Google Maps. La dirección sigue siendo obligatoria. | Hecho. Agregado el 2026-11-18 como cambio de alcance (`02-prefactibilidad.md` §9.2) |

### 4.2 Queda afuera (y por qué)

| Exclusión | Por qué |
|---|---|
| Pagos en línea | Requiere servidor, pasarela de pago, manejo de datos de tarjeta y comisiones. El negocio cobra al entregar o recoger, y el pago se acuerda por WhatsApp (ADR 1). |
| Panel de administración del menú | Exige servidor, autenticación y base de datos. El menú cambia poco y se edita en `menu.json` (ADR 2). |
| Marcar platillos agotados en tiempo real | Necesita un estado compartido que alguien actualice durante el día; sin servidor no hay dónde guardarlo. El negocio avisa por WhatsApp al confirmar. |
| Registro o historial de pedidos | Implica guardar datos personales de clientes en un servidor, con la responsabilidad legal que eso trae. Los pedidos quedan en el WhatsApp del negocio. |
| Cuentas de usuario | Agrega fricción para un pedido rápido y obliga a guardar datos personales. |
| Cálculo del costo de envío por zona o distancia | No se conoce la zona de reparto ni la tarifa. El mensaje dice "Costo de envío por confirmar". El cliente puede compartir su ubicación (A13), pero el envío lo calcula el negocio al recibir el pedido. |
| Fotos de los platillos | El negocio no ha enviado fotos reales, y no se usan fotos de stock ni generadas que parezcan sus platos. |
| Precios de adicionales de desayuno | El menú impreso dice "desde ₡500" sin lista. El cliente los pide en notas y el negocio confirma el precio. |
| Integración con la API de WhatsApp Business o envío automático | Requiere cuenta de empresa aprobada por Meta, servidor y costo por conversación. Con un enlace de WhatsApp el cliente envía el mensaje desde su propio WhatsApp. |
| Seguimiento del estado del pedido | Sin servidor no hay cómo notificar. La confirmación la hace el negocio por WhatsApp. |
| Varios idiomas | El público es local y el menú impreso está en español. |
| Aplicación nativa (Android/iOS) | El sitio abre en cualquier navegador del celular sin instalar nada. |

## 5. Funcionalidades iniciales y necesidades de usuario

| Usuario | Necesidad | Funcionalidad que la atiende |
|---|---|---|
| Cliente | Leer el menú en el celular sin pelear con una foto. | A1, A2 |
| Cliente | Saber cuánto va a pagar antes de pedir. | A3, A4, A8 |
| Cliente | Elegir tamaño, proteína y extras sin olvidar nada. | A3 |
| Cliente | No perder el pedido si cierra la página. | A4 |
| Cliente | Pedir por el canal que ya usa, sin instalar ni registrarse. | A7 |
| Negocio | Recibir pedidos completos: platillos, opciones, total, nombre, tipo, dirección y pago. | A6, A7 |
| Negocio | Que no se muestren como definitivos los precios que aún no confirma. | A8 |
| Negocio | No pagar comisión por pedido ni mensualidad de servidor. | Sitio estático en GitHub Pages (A11) |
| Equipo | Cambiar un precio en un solo lugar y saber si algo se rompió. | `menu.json` + pruebas automáticas (A11) |

## 6. Supuestos, restricciones, dependencias y riesgos

**Supuestos**

- La mayoría de clientes pide desde el celular y tiene WhatsApp instalado.
- El negocio prefiere confirmar cada pedido a mano por WhatsApp.
- El menú cambia pocas veces al mes, así que editar `menu.json` y volver a publicar es suficiente.
- [PENDIENTE: validar los tres supuestos en la entrevista.]

**Restricciones**

- Sin presupuesto para servidor ni plataforma de pedidos: sitio estático.
- GitHub Pages gratis solo publica repos públicos (ADR 4).
- No se inventan platillos, precios, dirección, horario ni datos del negocio; lo que falta queda marcado como "por confirmar".
- Nada se publica ni se envía sin el OK del negocio y del equipo.
- Duración: 5 semanas del curso.

**Dependencias**

- El negocio, para confirmar los datos pendientes de `menu.json` (precio de La Rascacielos, adicionales de desayuno, descripciones faltantes, acompañamiento de los Strips de Pollo, proteínas del casado y ortografía) y los datos de `src/config.ts` (horario, dirección, redes, costo de envío).
- GitHub (repositorio, Actions y Pages) y WhatsApp (enlace `api.whatsapp.com/send`).
- Node.js 22 o más reciente para desarrollar.

**Riesgos iniciales**

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| El número real de WhatsApp del negocio está en `src/config.ts` y en el historial de git; si el repo se hace público queda expuesto, y los compañeros que prueben la demo le escribirían al negocio. | Alta | Alto | Sacar el número del código a una variable de entorno, usar un número de pruebas para la demo y decidir qué hacer con el historial antes de hacer público el repo (semanas 3 y 5). |
| El negocio no responde los datos pendientes a tiempo. | Media | Medio | El sitio ya muestra "por confirmar" y funciona sin esos datos. |
| El enlace de WhatsApp muestra mal caracteres especiales en algún celular. | Baja | Medio | Mensaje sin emojis (ADR 3) y prueba en un celular real antes de publicar. |
| No todos los integrantes logran correr el proyecto el día de la defensa. | Media | Alto | Manual de instalación y ensayo previo con 2 o 3 integrantes (semana 2 y 5). |
| El repo no puede ser público y Pages no publica. | Media | Medio | Plan pago, otro hosting (Cloudflare Pages o Netlify) o demo local con `npm run preview`. |
| Cambios de alcance tardíos. | Media | Medio | Control de cambios definido en la semana 2; todo cambio queda registrado y aprobado. |

## 7. Acta de equipo

| Integrante | Rol | Responsabilidades | Parte de la exposición |
|---|---|---|---|
| [PENDIENTE: nombre] | [PENDIENTE: rol] | [PENDIENTE] | [PENDIENTE] |
| [PENDIENTE: nombre] | [PENDIENTE: rol] | [PENDIENTE] | [PENDIENTE] |
| [PENDIENTE: nombre] | [PENDIENTE: rol] | [PENDIENTE] | [PENDIENTE] |

Roles sugeridos para repartir (el equipo decide quién toma cuál): coordinación y enlace con el negocio, desarrollo de lógica y pruebas, interfaz y accesibilidad, documentación y control de calidad, despliegue y repositorio. Cada integrante debe poder explicar cualquier parte del código.

**Acuerdos de trabajo (propuesta, el equipo la aprueba o la cambia):**

1. Todo cambio entra por una rama y un pull request revisado por otra persona; nadie hace push directo a `main`.
2. Antes de pedir revisión se corren `npm test`, `npm run typecheck` y `npm run build`.
3. Ningún dato del negocio se inventa; lo que falta se marca `[PENDIENTE]` y se pregunta.
4. Nada se publica, despliega ni se envía al negocio sin acuerdo del equipo y OK del negocio.
5. Si alguien no puede cumplir una tarea, avisa en el canal del equipo con al menos [PENDIENTE: plazo] de anticipación.
6. Las decisiones técnicas se registran como ADR en `docs/adr/`.

**Canales:** [PENDIENTE: canal principal (por ejemplo, grupo de WhatsApp o Discord) y canal para el negocio].

**Reuniones:** [PENDIENTE: día, hora y modalidad].

**Dónde se guardan los acuerdos:** en este repositorio, en `docs/proyecto-final/` (actas y entregables) y `docs/adr/` (decisiones técnicas). [PENDIENTE: confirmar si el equipo usa además un tablero de tareas, como GitHub Projects.]

Firmas o aprobación del acta: [PENDIENTE: fecha y aprobación de cada integrante].
