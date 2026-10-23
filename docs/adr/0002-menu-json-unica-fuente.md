# 2. `menu.json` es la única fuente del menú

Fecha: 2026-10-22 · Estado: aceptada (reemplaza el `src/data/menu.ts` escrito a mano que proponía el plan)

## Contexto
El plan original copiaba el menú en `src/data/menu.ts`. Las reglas del cliente (`CLAUDE.md`) piden que los precios vivan en `menu.json` y no se copien a mano en ningún otro archivo.

## Decisión
`menu.json` tiene todo: nombres, descripciones y precios con la ortografía del menú impreso, más la estructura que el sitio necesita (`id`, `elegir`, `adicionales`, `adicionales_sin_precio`, `por_confirmar`). `src/data/menu.ts` solo lo lee y lo convierte a los tipos del sitio. Una prueba compara nombres y precios del sitio contra `menu.json`.

## Consecuencias
- Cambiar un precio es editar un número en un solo archivo.
- Los `id` no se pueden cambiar sin vaciar los carritos guardados que los usan.
- Lo pendiente con el negocio (`por_confirmar`) se muestra como "Precio por confirmar" en la tarjeta y en la ventana de opciones, como "aprox." en la barra del carrito y como aviso en el mensaje.
