# 7. Español e inglés con diccionario propio

Fecha: 2026-11-22 · Estado: aceptada (aprobada por Jose el 2026-11-22)

## Contexto
El spec dejaba "varios idiomas" fuera de la v1 porque el público es local y el menú impreso está en español. La entrega de la **Semana 3 del curso** pide la página en español e inglés, así que Jose aprobó el cambio de alcance y el spec se actualizó (sección "Fuera de alcance"). Las reglas del proyecto piden no agregar dependencias: nada de i18next ni librerías parecidas.

## Decisión
- **Diccionario propio** en `src/i18n/`: `es.ts` es la forma base y `en.ts` tiene el tipo `Dictionary` (`typeof es`), así que si falta un texto en inglés el `typecheck` falla. Los textos que llevan un dato son funciones (`t.menu.add(nombre)`).
- **`useLanguage()`** (`LanguageContext.tsx`) devuelve `lang`, `setLang` y `t`. Sin provider (pruebas de un solo componente) usa español.
- **Idioma inicial**, en este orden: el guardado en `localStorage` (`kairos.lang.v1`); si no hay, inglés si el navegador empieza con `en`; si no, español. Solo se guarda cuando el cliente toca **ES | EN**: el idioma que vino del navegador no cuenta como elección. Se actualizan `<html lang>` y el título.
- **La lógica no devuelve textos.** `validateOrderForm` da claves (`nameMissing`…), `orderWarnings` da avisos con estructura y `warningText` los escribe con el diccionario que toque; `startingPrice` da el monto y la interfaz escribe "desde" / "from".
- **Menú:** los nombres de los platillos no se traducen (son nombres propios del menú impreso). Categorías, notas, descripciones, tamaños, adicionales y elecciones llevan campos opcionales `_en` en `menu.json` (`nombre_en`, `nota_en`, `descripcion_en`, `etiqueta_en`, `opciones_en`), con traducción fiel, sin agregar ni quitar ingredientes. Si falta un campo, se muestra el español (`src/i18n/menuText.ts`). Los `id` no cambian.
- **El mensaje al negocio va siempre en español**, aunque el cliente use la página en inglés: quien atiende lo lee igual y la cocina no recibe dos versiones. El carrito guarda las opciones en español. Si el cliente usó inglés, el mensaje agrega `Idioma del cliente: inglés` para que le respondan en su idioma.
- Los precios se ven igual en los dos idiomas: ₡3.800.

## Consecuencias
- Agregar un texto es agregarlo en `es.ts` y en `en.ts`; TypeScript avisa si se olvida uno.
- Las traducciones de `menu.json` las hizo el equipo y Jose las revisó el 2026-11-22: "Carne" es "Beef" (res), "queso amarillo" es "American cheese" y se dejan las explicaciones entre paréntesis para el turista ("natilla (sour cream)", "patacones (fried green plantain)"). Tejano BBQ queda sin `descripcion_en` hasta confirmar qué son las "papas tostadas" (está en `pendiente_confirmar_con_el_negocio`), así que en inglés se ve en español.
- En inglés, el tipo de pedido "Express" se muestra como "Delivery (Express)" (aprobado por Jose).
- `ORDER_TYPE_LABEL` y `PAYMENT_LABEL` (`validation.ts`) quedan solo para el mensaje en español; la página usa `t.order.types` y `t.order.payments`.
- Un tercer idioma sería otro diccionario con el mismo tipo y otro campo en `menu.json`; hoy queda fuera de alcance.
